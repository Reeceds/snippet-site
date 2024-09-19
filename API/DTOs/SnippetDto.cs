namespace API;

public class FilterObj
{
    public int Id { get; set; }
    public string FilterName { get; set; }
}

public class SnippetDto
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? Content { get; set; }
    public string?  Creator { get; set; }
    public DateTime DateCreated { get; set; } = DateTime.UtcNow;
    public List<FilterObj> Filters { get; set; } = new List<FilterObj>();
    public List<Filter>? NewFilters { get; set; } = new List<Filter>();
    public string? AppUserId { get; set; }
}
