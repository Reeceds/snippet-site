using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API;

[Authorize]
public class FiltersController : BaseApiController
{
    private readonly DataContext _context;

    public FiltersController(DataContext context)
    {
        this._context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetFilters() 
    {
        string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null) return NotFound();

        var filters = await _context.Filters.Where(f => f.AppUserId == userId).ToListAsync();

        return Ok(filters);
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateFilter([FromBody] FilterDto filterDto)
    {
        string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null) return NotFound();

        var duplicate = await this._context.Filters.FirstOrDefaultAsync(x => x.FilterName!.ToLower() == filterDto.FilterName!.ToLower() && x.AppUserId == userId);

        if (duplicate != null) return BadRequest("Duplicate");

        var categoryName = await _context.Categories.FirstOrDefaultAsync(c => c.Id == filterDto.CategoryId);

        var newFilter = new Filter
        {
            FilterName = filterDto.FilterName,
            CategoryId = filterDto.CategoryId,
            CategoryName = categoryName?.CategoryName,
            AppUserId = userId
        };

        this._context.Filters.Add(newFilter);

        await this._context.SaveChangesAsync();

        return Ok(newFilter);
    }

    [HttpPost("edit")]
    public async Task<IActionResult> EditFilter([FromBody] FilterDto filterDto)
    {
        string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null) return NotFound();

        var duplicate = await this._context.Filters.FirstOrDefaultAsync(x => x.FilterName!.ToLower() == filterDto.FilterName!.ToLower());

        if (duplicate != null) return BadRequest("Duplicate");

        var categoryName = await _context.Categories.FirstOrDefaultAsync(c => c.Id == filterDto.CategoryId);

        var updateFilter = new Filter
        {
            Id = filterDto.Id,
            FilterName = filterDto.FilterName,
            CategoryId = filterDto.CategoryId,
            CategoryName = categoryName?.CategoryName,
            AppUserId = userId
        };

        var mathchedSnippetFilters = this._context.SnippetFilters.Where(x => x.FilterId == filterDto.Id).ToList();

        foreach (var item in mathchedSnippetFilters)
        {
            this._context.SnippetFilters.Attach(item);

            item.FilterName = filterDto.FilterName;

            this._context.Entry(item).Property(e => e.FilterName).IsModified = true;
        }

        this._context.Filters.Update(updateFilter);
        await this._context.SaveChangesAsync();

        return Ok();
    }

    [HttpDelete("delete/{id}")]
    public async Task<IActionResult> DeleteFilter(int id)
    {
        string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null) return NotFound();

        var deleteFilter = await this._context.Filters.Where(f => f.Id == id && f.AppUserId == userId).FirstOrDefaultAsync();

        if (deleteFilter == null) return NotFound();

        this._context.Filters.Remove(deleteFilter);
        await this._context.SaveChangesAsync();

        return Ok();
    }

    // [HttpPost("create/list")]
    // public async Task<IActionResult> CreateFilter([FromBody] List<FilterDto> filterDto)
    // {
    //     string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    //     if (userId == null) return NotFound();

    //     Filter newFilter = new Filter();

    //     foreach (var item in filterDto)
    //     {
    //         var duplicate = await this._context.Filters.FirstOrDefaultAsync(x => x.FilterName!.ToLower() == item.FilterName!.ToLower() && x.AppUserId == userId);

    //         if (duplicate != null) return BadRequest("Duplicate");

    //         var categoryName = await _context.Categories.FirstOrDefaultAsync(c => c.Id == item.CategoryId);

    //         newFilter = new Filter()
    //         {
    //             FilterName = item.FilterName,
    //             CategoryId = item.CategoryId,
    //             CategoryName = categoryName?.CategoryName,
    //             AppUserId = userId
    //         };

    //         this._context.Filters.Add(newFilter);
    //     }

    //     await this._context.SaveChangesAsync();

    //     return Ok();
    // }

}
