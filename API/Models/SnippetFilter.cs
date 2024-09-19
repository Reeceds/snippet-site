using System;

namespace API.Models
{
    public class SnippetFilter
    {
        public int SnippetId { get; set; }
        public Snippet Snippet { get; set; } = null!;
        public string FilterName { get; set; } = null!;
        public Filter Filter { get; set; } = null!;
        public int FilterId { get; set; }
        public string AppUserId { get; set; } = null!;
    }
}
