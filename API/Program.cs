using System.Text;
using System.Text.Json.Serialization;
using API;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
ConfigurationManager configuration = builder.Configuration;

// Add services to the container.
// ! Add .AddJsonOptions(... when including related table data (.Include()) in API calls to avoid serialization error
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ! Add this connection string before 'var app = builder.Build();' is run
builder.Services.AddDbContext<DataContext>(options =>
{
    options.UseSqlite("Data source=net-core_angular-project.db");
});

// ! Add for Identity user and role configuration e.g. password rules, remove 'options => {}' for no configuraiton
builder.Services.AddIdentity<AppUser, IdentityRole>(
    options =>
    {
        options.User.RequireUniqueEmail = true;
    }
).AddEntityFrameworkStores<DataContext>().AddDefaultTokenProviders();

// ! {JWT} Add this to configure JWT settings when the app is being built
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddCookie(x => { // ! Add for cookie authentication
    x.Cookie.Name = "jwtToken";
})
.AddJwtBearer(o =>
{
    o.RequireHttpsMetadata = false;
    o.SaveToken = true;
    o.TokenValidationParameters = new TokenValidationParameters
    {
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["ApplicationSettings:Secret"]!)),
        ValidateIssuerSigningKey = true,
        ValidateIssuer = false,
        ValidateAudience = false
    };
    o.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            context.Token = context.Request.Cookies["jwtToken"];
            return Task.CompletedTask;
        }
    };
});

// ! Add CORS
builder.Services.AddCors();

// ! {JWT}
builder.Services.AddAuthorization();

var app = builder.Build();

// ! Add CORS for the url of the front end (i.e the local server that Angular is running on)
app.UseCors(builder => builder
.AllowAnyHeader()
.AllowCredentials() // ! Add .AllowCredentials() when using passing jwt on httponly cookkie
.AllowAnyMethod()
.WithOrigins("http://localhost:4200"));

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
