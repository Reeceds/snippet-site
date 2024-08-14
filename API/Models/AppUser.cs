using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace API;

public class AppUser : IdentityUser
{
    [MaxLength(10, ErrorMessage = "This field must be 10 characters or less")]
    public string? DisplayName { get; set; }
}
