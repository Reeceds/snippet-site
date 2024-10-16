using System;

namespace API.Models
{
    public class Doc
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string Creator { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime LastUpdated { get; set; }
        public Folder Folder { get; set; } = null!;
        public int FolderId { get; set; }
        public string AppUserId { get; set; }
    }
}
