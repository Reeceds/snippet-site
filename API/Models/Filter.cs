using API.Models;

namespace API;

public class Filter
{
    public int Id { get; set; }
    public string? FilterName { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public List<SnippetFilter>? SnippetFilters { get; set; }
    public string? AppUserId { get; set; }
}
