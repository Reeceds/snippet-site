using System.ComponentModel.DataAnnotations.Schema;
using API.Models;

namespace API;

public class Snippet
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public string Notes { get; set; }
    public string Creator { get; set; }
    public DateTime DateCreated { get; set; }
    public DateTime LastUpdated { get; set; }
    public List<SnippetFilter>? SnippetFilters { get; set; }
    public string AppUserId { get; set; }

}
