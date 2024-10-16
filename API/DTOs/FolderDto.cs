using System;

namespace API.DTOs
{
    public class FolderDto
    {
        public int Id { get; set; }
        public string FolderName { get; set; }
        public string? Creator { get; set; }
        public DateTime? DateCreated { get; set; }
        public DateTime? LastUpdated { get; set; }
    }
}
