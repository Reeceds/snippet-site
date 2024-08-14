using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API;

[Authorize]
public class UserController : BaseApiController
{
    private readonly DataContext _context;
    private readonly UserManager<AppUser> _userManager;

    public UserController(DataContext context, UserManager<AppUser> userManager)
    {
        this._context = context;
        this._userManager = userManager;
    }

    [HttpGet("current-user")]
    public async Task<IActionResult> GetCurrentUser()
    {
        AppUser currentUser =  await _userManager.GetUserAsync(User);

        if (currentUser == null) return NotFound();

        UserDto user = new UserDto()
        {
            Email = currentUser.Email,
            DisplayName = currentUser.DisplayName
        };

        return Ok(user);
    }

    [HttpPost("edit-uesername")]
    public async Task<IActionResult> EditDisplayName([FromBody] AppUser data)
    {
        AppUser currentUser =  await _userManager.GetUserAsync(User);

        if (currentUser == null) return NotFound();

        if (!ModelState.IsValid) return BadRequest();

        await _context.Users.Where(i => i.Id == currentUser.Id).ExecuteUpdateAsync(x => x.SetProperty(d => d.DisplayName, _ => data.DisplayName));

        return Ok();
    }
}
