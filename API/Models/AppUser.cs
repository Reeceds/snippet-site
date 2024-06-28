using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace API;

public class AppUser : IdentityUser
{
    [MaxLength(10)]
    public string? DisplayName { get; set; }
}
