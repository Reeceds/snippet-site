using System.Security.Claims;
using System.Text;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.OpenApi.Any;
using Microsoft.AspNetCore.Authorization;
using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;

namespace API;

public class AuthenticationController : BaseApiController
{
    private SignInManager<AppUser> _signInManager;
    private UserManager<AppUser> _userManager;
    private readonly IConfiguration _configuration;
    private readonly IConfigurationSection _goolgeSettings;
    private readonly IConfigurationSection _secret;
    private readonly DataContext _context;

    public AuthenticationController(SignInManager<AppUser> signInManager, UserManager<AppUser> userManager, IConfiguration configuration, DataContext context)
    {
        this._signInManager = signInManager;
        this._userManager = userManager;
        this._configuration = configuration;
        this._goolgeSettings = _configuration.GetSection("GoogleAuthSettings");
        this._secret = _configuration.GetSection("ApplicationSettings");
        this._context = context;
    }

    [HttpPost("google-login")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleAuthDto googleAuth)
    {
        var payload =  await this.VerifyGoogleToken(googleAuth);

        if (payload == null) return BadRequest("Invalid External Authentication.");

        var info = new UserLoginInfo(googleAuth.Provider, payload.Subject, googleAuth.Provider);
        var user = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);

        if (user == null)
        {
            user = new AppUser { Email = payload.Email, UserName = payload.Email };
            await _userManager.CreateAsync(user);
            await _userManager.AddLoginAsync(user, info);
        }

        if (user == null) return BadRequest("Invalid External Authentication.");

        var accessToken = GenerateAccessToken(user);
        var refreshToken = GenerateRefreshToken();

        // Save refresh token in DB (implement the method to store it)
        user.RefreshToken = refreshToken;
        await _context.SaveChangesAsync();

        // Set HttpOnly cookie for the refresh token
        SetRefreshTokenCookie(refreshToken);

        return Ok(new { AccessToken = accessToken, IsAuthSuccessful = true, Provider = googleAuth.Provider, DisplayName = user.DisplayName });
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];

        if (refreshToken == null)
        {
            return Unauthorized();
        }

        var user = await _context.Users.SingleOrDefaultAsync(u => u.RefreshToken == refreshToken);

        if (user == null || user.RefreshToken != refreshToken)
        {
            return Unauthorized();
        }

        var newAccessToken = GenerateAccessToken(user);
        var newRefreshToken = GenerateRefreshToken();

        // Update refresh token in DB
        user.RefreshToken = newRefreshToken;
        await _context.SaveChangesAsync();

        // Set new refresh token in cookie
        SetRefreshTokenCookie(newRefreshToken);

        return Ok(new { AccessToken = newAccessToken });
    }
    
    [HttpGet("logout")]
    public void Logout()
    {
        if (Request.Cookies["refreshToken"] != null)
        {
            HttpContext.Response.Cookies.Delete("refreshToken");
        }

        return;
    }

    protected async Task<GoogleJsonWebSignature.Payload> VerifyGoogleToken(GoogleAuthDto googleToken)
    {
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings()
            {
                Audience = new List<string>() { _goolgeSettings.GetSection("clientId").Value! }
            };
            var payload = await GoogleJsonWebSignature.ValidateAsync(googleToken.IdToken, settings);
            return payload;
        }
        catch (Exception ex)
        {
            //log an exception
            throw new Exception(ex.Message);
        }
    }

    protected dynamic GenerateAccessToken(AppUser user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(this._secret.GetSection("Secret").Value!);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] { new Claim("sub", user.Id) }),
            Expires = DateTime.UtcNow.AddMinutes(1),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha512Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var encrypterToken = tokenHandler.WriteToken(token);

        return encrypterToken;
    }

    private void SetRefreshTokenCookie(string refreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            Expires = DateTime.Now.AddDays(7),
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None
        };

        HttpContext.Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }

    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];

        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
}