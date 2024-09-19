using System.Security.Claims;
using API.DTOs;
using API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
    public async Task<IActionResult> GetListSnippets()
    {
        string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null) return NotFound();

        var snippets = await _context.Snippets.Where(u => u.AppUserId == userId).Include(f => f.SnippetFilters).ToListAsync();
        
        return Ok(snippets);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSnippet(int id)
    {
        string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null) return NotFound();

        var snippet = await this._context.Snippets.Include(f => f.SnippetFilters).FirstOrDefaultAsync(s => s.Id == id);

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
            Title = snippetDto.Title,
            Content = snippetDto.Content,
            Creator = displayName,
            DateCreated = DateTime.UtcNow,
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
        else 
        {
            return BadRequest();
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
        if (snippetDto.Title == null || snippetDto.Title == "" || snippetDto.Content == null || snippetDto.Content == "") return BadRequest("Missing Title or Content");

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
                    FilterName = item.FilterName,
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
            Title = snippetDto.Title,
            Content = snippetDto.Content,
            Creator = displayName,
            DateCreated = snippetDto.DateCreated,
            LastUpdated = DateTime.UtcNow,
            AppUserId = userId
        };

        var existingSnipFilt = this._context.SnippetFilters.Where(x => x.SnippetId == snippetDto.Id).ToList();
        
        updateSnippet.SnippetFilters = new List<SnippetFilter>();


        // Add a filter to the snippet if it was not previously checked
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
        
        // Remove a filter if its no longer checked
        if (snippetDto.Filters.Count > 0)
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
        else 
        {
            return BadRequest();
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
