using System.Security.Claims;
using API.DTOs;
using API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize]
    public class FoldersController : BaseApiController
    {
        private DataContext _context;
        private UserManager<AppUser> _userManager;

        public FoldersController(DataContext context, UserManager<AppUser> userManager)
        {
            this._context = context;
            this._userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetFoldersList()
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null) return NotFound();

            var foldersList = await _context.Folders.Where(x => x.AppUserId == userId).ToListAsync();

            if (foldersList == null) return NotFound();

            return Ok(foldersList);
        }

        [HttpGet("folder/{id}")]
        public async Task<IActionResult> GetFolder(int id)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null) return NotFound();

            var folder = await this._context.Folders.Where(x => x.Id == id).FirstOrDefaultAsync();

            if (folder == null) return BadRequest();

            return Ok(folder);
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateFolder([FromBody] FolderDto folderDto)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null) return NotFound();

            string displayName = this._userManager.GetUserAsync(User).Result.DisplayName;

            var newFolder = new Folder
            {
                FolderName = folderDto.FolderName.Trim(),
                Creator = displayName,
                DateCreated = DateTime.UtcNow,
                LastUpdated = DateTime.UtcNow,
                AppUserId = userId
            };

            this._context.Folders.Add(newFolder);
            await this._context.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("edit")]
        public async Task<IActionResult> EditFolder([FromBody] FolderDto folderDto)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null) return NotFound();

            var mathchedFolder = await this._context.Folders.Where(x => x.Id == folderDto.Id).FirstOrDefaultAsync();

            if (mathchedFolder == null) return NotFound();

            this._context.Folders.Attach(mathchedFolder);

            mathchedFolder.FolderName = folderDto.FolderName.Trim();
            mathchedFolder.LastUpdated = DateTime.UtcNow;

            this._context.Entry(mathchedFolder).Property(e => e.FolderName).IsModified = true;
            this._context.Entry(mathchedFolder).Property(e => e.LastUpdated).IsModified = true;

            await this._context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteFolder(int id)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null) return NotFound();

            var folder = await this._context.Folders.Where(x => x.Id == id).FirstOrDefaultAsync();

            if (folder == null) return NotFound();

            this._context.Folders.Remove(folder);
            await this._context.SaveChangesAsync();

            return Ok();
        }
    }
}
