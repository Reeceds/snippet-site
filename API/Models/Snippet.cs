using System.ComponentModel.DataAnnotations.Schema;

namespace API;

public class Snippet
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public string Creator { get; set; }
    public DateTime DateCreated { get; set; } = DateTime.UtcNow;
    // public List<Filter> Filters { get; set; } = new List<Filter>();
    public string AppUserId { get; set; }

}
