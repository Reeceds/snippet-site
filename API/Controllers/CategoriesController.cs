using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API;

[Authorize]
public class CategoriesController : BaseApiController
{
    private readonly DataContext _context;
    private readonly UserManager<AppUser> _userManager;

    public CategoriesController(DataContext context, UserManager<AppUser> userManager)
    {
        this._context = context;
        this._userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        AppUser currentUser =  await _userManager.GetUserAsync(User);

        if (currentUser == null) return NotFound();

        var categories = await this._context.Categories.ToListAsync();

        return Ok(categories);
    }
}
