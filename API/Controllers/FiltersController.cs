using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;
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

        var duplicate = await this._context.Filters.FirstOrDefaultAsync(x => x.FilterName!.ToLower() == filterDto.FilterName!.ToLower());

        if (duplicate != null) return BadRequest("Duplicate");

        var newFilter = new Filter
        {
            FilterName = filterDto.FilterName,
            CategoryId = filterDto.CategoryId,
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

        var updateFilter = new Filter
        {
            Id = filterDto.Id,
            FilterName = filterDto.FilterName,
            CategoryId = filterDto.CategoryId,
            AppUserId = userId
        };

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

}
