using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API;

public class DataContext : IdentityDbContext<AppUser>
{
    public DbSet<Snippet> Snippets { get; set; }

    public DataContext(DbContextOptions<DataContext> options) : base(options)
    {
    }
}
