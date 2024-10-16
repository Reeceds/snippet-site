using System;

namespace API.Models
{
    public class Folder
    {
        public int Id { get; set; }
        public string FolderName { get; set; }
        public string Creator { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime LastUpdated { get; set; }
        public List<Doc> Docs { get; set; }
        public string AppUserId { get; set; }
    }
}
