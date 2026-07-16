using AssetFlow.Infrastructure.Data;
using AssetFlow.Domain.Entities;
using AssetFlow.Application.DTOs.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AssetFlow.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context; 
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            // Kullanıcı daha önce kayıtlı mı kontrolü
            var userExists = await _context.Users.AnyAsync(u => u.Email == dto.Email);
            if (userExists)
                return BadRequest("Bu email adresi zaten kullanılıyor.");

            // Şifreyi BCrypt ile güvenli hale getirme (Hash)
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var newUser = new User
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                PasswordHash = passwordHash,
                Role = "Personel" // Varsayılan rol
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok("Kullanıcı başarıyla kaydedildi.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            // Kullanıcıyı veritabanında bul
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
                return Unauthorized("Geçersiz email veya şifre.");

            // Şifre doğrulama (Hash karşılaştırması)
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
            if (!isPasswordValid)
                return Unauthorized("Geçersiz email veya şifre.");

            // Başarılı giriş: JWT Token Üretimi
            var token = GenerateJwtToken(user);

            return Ok(new { Token = token });
        }

        // Token Üreten Yardımcı Metot
        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Token içine koyacağımız bilgiler (Claims)
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role), // Kullanıcı rolü (Admin/Personel)
                new Claim("FirstName", user.FirstName)
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(2), // Token 2 saat geçerli
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}