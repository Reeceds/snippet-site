using System.Security.Claims;
using API.DTOs;
using API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace API;

[Authorize]
public class SnippetsController : BaseApiController
{
    private readonly DataContext _context;
    private readonly UserManager<AppUser> _userManager;

    public SnippetsController(DataContext context, UserManager<AppUser> userManager)
    {
        this._context = context;
        this._userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetSnippetsList([FromQuery]string? filters, [FromQuery]string? search, [FromQuery]int pageSize) // Use '?' to specify that the query may be empty and not cause an eror
    {
        string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null) return NotFound();

        List<Snippet> snippets = new List<Snippet>();

        string searchString = "";

        if (!string.IsNullOrEmpty(search))
        {
            searchString = search.Trim();
        }

        // If no filters or serach, return all
        if (string.IsNullOrEmpty(filters) && string.IsNullOrEmpty(searchString))
        {
            snippets = await _context.Snippets.Where(u => u.AppUserId == userId).Include(f => f.SnippetFilters).ToListAsync();

            if (snippets.Count == 0) return Ok("No snippets found: Unfiltered results");
        }
        
        // If only filters requested, send matched list
        if (!string.IsNullOrEmpty(filters) && string.IsNullOrEmpty(searchString))
        {
            var filtersArr = filters.ToLower().Split(",");
            
            snippets = await (
                from s in _context.Snippets
                join sf in _context.SnippetFilters on s.Id equals sf.SnippetId
                where s.AppUserId == userId && filtersArr.Contains(sf.FilterName.ToLower())
                select s
            ).Distinct().Include(f => f.SnippetFilters).ToListAsync();

            if (snippets.Count == 0) return Ok("No snippets found: Filter results only");
        }
        
        // If only a search requested, send matched list
        if (!string.IsNullOrEmpty(searchString) && string.IsNullOrEmpty(filters))
        {
            snippets = await _context.Snippets.Where(i => i.Title.ToLower().Contains(searchString.ToLower()) && i.AppUserId == userId).Include(f => f.SnippetFilters).ToListAsync();

            if (snippets.Count == 0) return Ok("No snippets found: Search results only");
        }

        // If both filters and search requested, send matched list
        if (!string.IsNullOrEmpty(filters) && !string.IsNullOrEmpty(searchString))
        {
            var filtersArr = filters.Split(",");
            
            snippets = await (
                from s in _context.Snippets
                join sf in _context.SnippetFilters on s.Id equals sf.SnippetId
                where s.AppUserId == userId && filtersArr.Contains(sf.FilterName) && s.Title.ToLower().Contains(searchString.ToLower())
                select s
            ).Distinct().Include(f => f.SnippetFilters).ToListAsync();

            if (snippets.Count == 0) return Ok("No snippets found: Filters & search results");
        }

        bool hasMoreItems = snippets.Count > pageSize;
        int resultsCount = snippets.Count;
        
        snippets = snippets.Take(pageSize).ToList();
        
        return Ok(new 
        { 
            Items = snippets, 
            HasMoreItems = hasMoreItems,
            ResultsCount = resultsCount
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSnippet(int id)
    {
        string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null) return NotFound();

        var snippet = await this._context.Snippets.Where(x => x.AppUserId == userId).Include(f => f.SnippetFilters).FirstOrDefaultAsync(s => s.Id == id);

        return Ok(snippet);
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateSnippet([FromBody] SnippetDto snippetDto)
    {
        string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null) return NotFound();

        string displayName = this._userManager.GetUserAsync(User).Result.DisplayName;

        var newSnippet = new Snippet
        {
            Title = snippetDto.Title.Trim(),
            Content = snippetDto.Content,
            Notes = snippetDto.Notes,
            Creator = displayName,
            DateCreated = DateTime.UtcNow,
            LastUpdated = DateTime.UtcNow,
            AppUserId = userId
        };
        
        if (snippetDto.Filters.Count > 0)
        {
            newSnippet.SnippetFilters = new List<SnippetFilter>();

            foreach (var item in snippetDto.Filters)
            {
                newSnippet.SnippetFilters.Add(new SnippetFilter
                {
                    FilterId = item.Id,
                    FilterName = item.FilterName,
                    AppUserId = userId
                });
            }
        }

        this._context.Snippets.Add(newSnippet);
        await this._context.SaveChangesAsync();

        return Ok();
    }

    [HttpPost("create-filters")]
    public async Task<IActionResult> CreateNewFilters([FromBody] SnippetDto snippetDto)
    {
        string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null) return NotFound();

        // ! Check if the snippet is valid
        if (snippetDto.Title.IsNullOrEmpty() || snippetDto.Content.IsNullOrEmpty()) return BadRequest("Missing Title or Content");

        Filter newFilter = new Filter();
        var snippetFilterList = new List<Filter>();

        if (snippetDto.NewFilters.Count > 0)
        {
            foreach (var item in snippetDto.NewFilters)
            {
                var duplicate = await this._context.Filters.FirstOrDefaultAsync(x => x.FilterName!.ToLower() == item.FilterName!.ToLower());

                if (duplicate != null) return BadRequest("Duplicate");

                var categoryName = await _context.Categories.FirstOrDefaultAsync(c => c.Id == item.CategoryId);

                newFilter = new Filter()
                {
                    FilterName = item.FilterName.Trim(),
                    CategoryId = item.CategoryId,
                    CategoryName = categoryName?.CategoryName,
                    AppUserId = userId
                };

                snippetFilterList.Add(newFilter);

                this._context.Filters.Add(newFilter);
            };
        }

        await this._context.SaveChangesAsync();
        return Ok(snippetFilterList);
    }

    [HttpPost("edit")]
    public async Task<IActionResult> EditSnippet([FromBody] SnippetDto snippetDto)
    {
        string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null) return NotFound();

        string displayName = this._userManager.GetUserAsync(User).Result.DisplayName;

        var updateSnippet = new Snippet
        {
            Id = snippetDto.Id,
            Title = snippetDto.Title.Trim(),
            Content = snippetDto.Content,
            Notes = snippetDto.Notes,
            Creator = displayName,
            DateCreated = snippetDto.DateCreated,
            LastUpdated = DateTime.UtcNow,
            AppUserId = userId
        };

        var existingSnipFilt = this._context.SnippetFilters.Where(x => x.SnippetId == snippetDto.Id && x.AppUserId == userId).ToList();
        
        if (snippetDto.Filters.Count > 0)
        {
            updateSnippet.SnippetFilters = new List<SnippetFilter>();

            // Add a filter to the snippet if it was not previously selected
            foreach (var newFilter in snippetDto.Filters)
            {          
                bool filterExists = existingSnipFilt.Any(x => x.FilterId == newFilter.Id);
                
                if (!filterExists)
                {
                    updateSnippet.SnippetFilters.Add(new SnippetFilter
                    {
                        FilterId = newFilter.Id,
                        FilterName = newFilter.FilterName,
                        AppUserId = userId
                    });
                }
            }
            
        }
        
        // Remove a filter if its no longer selected
        if (existingSnipFilt.Count > 0)
        {
            foreach (var oldFilter in existingSnipFilt)
            {
                bool filterExists = snippetDto.Filters.Any(x => x.Id == oldFilter.FilterId);

                if (!filterExists)
                {
                    this._context.Remove(this._context.SnippetFilters.FirstOrDefault(f => f.FilterId == oldFilter.FilterId));
                }
            }
        }

        this._context.Snippets.Update(updateSnippet);
        await this._context.SaveChangesAsync();

        return Ok();
    }

    [HttpDelete("delete/{id}")]
    public async Task<IActionResult> DeleteSnippet(int id)
    {
        string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null) return NotFound();

        var deleteSnippet = await this._context.Snippets.Where(f => f.Id == id && f.AppUserId == userId).FirstOrDefaultAsync();

        if (deleteSnippet == null) return NotFound();

        this._context.Snippets.Remove(deleteSnippet);
        await this._context.SaveChangesAsync();

        return Ok();
    }
}
