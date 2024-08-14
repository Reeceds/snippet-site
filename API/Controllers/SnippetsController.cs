using System.Security.Claims;
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
    public async Task<IActionResult> ListSnippets()
    {
        string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null) return NotFound();

        var snippets = await _context.Snippets.Where(u => u.AppUserId == userId).ToListAsync();

        return Ok(snippets);
    }
}
