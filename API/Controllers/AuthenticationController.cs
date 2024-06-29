using System.Security.Claims;
using System.Text;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.OpenApi.Any;
using Microsoft.AspNetCore.Authorization;

namespace API;

public class AuthenticationController : BaseApiController
{
    private SignInManager<AppUser> _signInManager;
    private UserManager<AppUser> _userManager;
    private readonly IConfiguration _configuration;
    private readonly IConfigurationSection _goolgeSettings;
    private readonly IConfigurationSection _secret;

    public AuthenticationController(SignInManager<AppUser> signInManager, UserManager<AppUser> userManager, IConfiguration configuration)
    {
        this._signInManager = signInManager;
        this._userManager = userManager;
        this._configuration = configuration;
        this._goolgeSettings = _configuration.GetSection("GoogleAuthSettings");
        this._secret = _configuration.GetSection("ApplicationSettings");
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

        GenerateToken(user);

        // new GoogleAuthResponseDto { IsAuthSuccessful = true, Token = token, Provider = googleAuth.Provider };

        return Ok(new GoogleAuthResponseDto { IsAuthSuccessful = true, Provider = googleAuth.Provider });
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

    protected dynamic GenerateToken(AppUser user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(this._secret.GetSection("Secret").Value!);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] { new Claim("sub", user.Id) }),
            Expires = DateTime.UtcNow.AddHours(1),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha512Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var encrypterToken = tokenHandler.WriteToken(token);

        HttpContext.Response.Cookies.Append("jwtToken", encrypterToken,
            new CookieOptions
            {
                Expires = DateTime.UtcNow.AddHours(1),
                HttpOnly = true,
                Secure = true,
                IsEssential = true,
                SameSite = SameSiteMode.None
            }
        );

        return encrypterToken;
    }

    [Authorize]
    [HttpGet("logout")]
    public void Logout()
    {
        HttpContext.Response.Cookies.Delete("jwtToken");
    }
}