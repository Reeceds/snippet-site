using System;
using System.Security.Claims;
using API.DTOs;
using API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace API.Controllers
{
    [Authorize]
    public class DocsController : BaseApiController
    {
        private DataContext _context;
        private UserManager<AppUser> _userManager;

        public DocsController(DataContext context, UserManager<AppUser> userManager)
        {
            this._context = context;
            this._userManager = userManager;
        }

        [HttpGet("list/{id}")]
        public async Task<IActionResult> GetDocumentsList(int id)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null) return NotFound();

            // if (id) return BadRequest();

            var documents = await this._context.Docs.Where(x => x.FolderId == id && x.AppUserId == userId).ToListAsync();

            return Ok(documents);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDocument(int id)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null) return NotFound();

            var document = await _context.Docs.Where(x => x.Id == id && x.AppUserId == userId).FirstOrDefaultAsync();

            if (document == null) return BadRequest();

            return Ok(document);
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateDocument([FromBody] DocDto docDto)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null) return NotFound();

            string displayName = this._userManager.GetUserAsync(User).Result.DisplayName;

            var newDocument = new Doc
            {
                Title = docDto.Title.Trim(),
                Content = docDto.Content,
                Creator = displayName,
                DateCreated = DateTime.UtcNow,
                LastUpdated = DateTime.UtcNow,
                FolderId = docDto.FolderId,
                AppUserId = userId
            };

            this._context.Docs.Add(newDocument);
            await this._context.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("edit")]
        public async Task<IActionResult> EditDocument([FromBody] DocDto docDto)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null) return NotFound();

            var matchedDocument = await this._context.Docs.Where(x => x.Id == docDto.Id && x.AppUserId == userId).FirstOrDefaultAsync();

            if (matchedDocument == null) return BadRequest();

            this._context.Docs.Attach(matchedDocument);

            matchedDocument.Title = docDto.Title.Trim();
            matchedDocument.Content = docDto.Content;
            matchedDocument.LastUpdated = DateTime.UtcNow;

            this._context.Entry(matchedDocument).Property(e => e.Title).IsModified = true;
            this._context.Entry(matchedDocument).Property(e => e.Content).IsModified = true;
            this._context.Entry(matchedDocument).Property(e => e.LastUpdated).IsModified = true;

            await this._context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null) return NotFound();

            var document = await this._context.Docs.Where(x => x.Id == id && x.AppUserId == userId).FirstOrDefaultAsync();

            if (document == null) return NotFound();

            this._context.Docs.Remove(document);
            await this._context.SaveChangesAsync();

            return Ok();
        }
    }
}
