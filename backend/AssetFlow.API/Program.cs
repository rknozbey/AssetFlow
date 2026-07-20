using AssetFlow.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models; // Swagger için eklendi
using System.Security.Claims; // RoleClaimType için eklendi
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Connection String'i kontrol et
Console.WriteLine("========================================");
Console.WriteLine("Connection String:");
Console.WriteLine(builder.Configuration.GetConnectionString("DefaultConnection"));
Console.WriteLine("========================================");

// PostgreSQL Bağlantısı
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("AssetFlow.Infrastructure")));

// Controller'ları ekle
builder.Services.AddControllers();

// Swagger Yapılandırması (JWT Desteği ile)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "AssetFlow API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Token'ınızı 'Bearer {token}' formatında giriniz. (Örnek: Bearer eyJhbG...)",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// JWT Ayarları
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["Key"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!)),
        RoleClaimType = ClaimTypes.Role // SİSTEME ROLÜN HANGİ ETİKETTE OLDUĞUNU SÖYLÜYORUZ
    };
});

var app = builder.Build();

// HTTP Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Authentication & Authorization (Sırası çok önemlidir!)
app.UseAuthentication();
app.UseAuthorization();

// Controller'ları map et
app.MapControllers();

app.Run();