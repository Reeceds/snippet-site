﻿using System.Reflection.Emit;
using API.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API;

public class DataContext : IdentityDbContext<AppUser>
{
    public DbSet<Snippet> Snippets { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Filter> Filters { get; set; }
    public DbSet<SnippetFilter> SnippetFilters { get; set; }
    public DbSet<Folder> Folders { get; set; }
    public DbSet<Doc> Docs { get; set; }

    public DataContext(DbContextOptions<DataContext> options) : base(options) {}
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<Category>().HasData(
            new Category() { Id = 1, CategoryName = "Languages" },
            new Category() { Id = 2, CategoryName = "Frameworks" },
            new Category() { Id = 3, CategoryName = "Libraries" }
        );

        modelBuilder.Entity<SnippetFilter>()
            .HasKey(sf => new { sf.SnippetId, sf.FilterId});
        
        modelBuilder.Entity<SnippetFilter>()
            .HasOne(s => s.Snippet)
            .WithMany(f => f.SnippetFilters)
            .HasForeignKey(s => s.SnippetId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SnippetFilter>()
            .HasOne(f => f.Filter)
            .WithMany(s => s.SnippetFilters)
            .HasForeignKey(f => f.FilterId)
            .OnDelete(DeleteBehavior.Cascade);

        // modelBuilder.Entity<Folder>()
        //     .HasMany(x => x.Docs)
        //     .WithOne( x => x.Folder)
        //     .HasForeignKey(x => x.FolderId)
        //     .OnDelete(DeleteBehavior.Cascade);
    }
}
