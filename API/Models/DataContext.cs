using System.Reflection.Emit;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API;

public class DataContext : IdentityDbContext<AppUser>
{
    public DbSet<Snippet> Snippets { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Filter> Filters { get; set; }

    public DataContext(DbContextOptions<DataContext> options) : base(options) {}
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<Category>().HasData(
            new Category() { Id = 1, CategoryName = "Languages" },
            new Category() { Id = 2, CategoryName = "Frameworks" },
            new Category() { Id = 3, CategoryName = "Libraries" }
        );
    }
}
