using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API;

[Authorize]
public class SnippetsController : BaseApiController
{
    private readonly DataContext _context;

    public SnippetsController(DataContext context)
    {
        this._context = context;
    }
    [HttpGet]
    public async Task<IActionResult> ListSnippets()
    {
        var snippets = await _context.Snippets.ToListAsync();

        return Ok(snippets);
    }
}
