using System;

namespace API.DTOs
{
    public class SnippetFilterDto
    {
        public int SnippetId { get; set; }
        public int FilterId { get; set; }
        public string FilterName { get; set; } = null!;
    }
}
