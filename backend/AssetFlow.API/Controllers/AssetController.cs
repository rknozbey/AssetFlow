using AssetFlow.API.DTOs;
using AssetFlow.Domain.Entities;
using AssetFlow.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AssetFlow.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] 
    public class AssetController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AssetController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("my-assets")]
        public async Task<IActionResult> GetMyAssets()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                return Unauthorized("Kullanıcı kimliği doğrulanamadı.");
            }

            var myAssets = await _context.Assets
                .Where(a => a.UserId == userId)
                .Select(a => new
                {
                    a.Id,
                    a.Name,
                    a.SerialNumber,
                    a.Description,
                    a.PurchaseDate
                })
                .ToListAsync();

            return Ok(myAssets);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateAsset([FromBody] CreateAssetDto request)
        {
            var newAsset = new Asset
            {
                Name = request.Name,
                Description = request.Description,
                SerialNumber = request.SerialNumber,
                PurchaseDate = request.PurchaseDate
            };

            _context.Assets.Add(newAsset);
            await _context.SaveChangesAsync();

            return Ok(new { Mesaj = "Demirbaş başarıyla sisteme eklendi!", DemirbasId = newAsset.Id });
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAssets()
        {
            var assets = await _context.Assets
                .Include(a => a.User)
                .Select(a => new
                {
                    a.Id,
                    a.Name,
                    a.SerialNumber,
                    a.IsAssigned,
                    ZimmetDurumu = a.User != null ? $"{a.User.FirstName} {a.User.LastName} üzerine zimmetli" : "Depoda (Boşta)"
                })
                .ToListAsync();

            return Ok(assets);
        }

        [HttpPut("assign")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignAsset([FromBody] AssignAssetDto request)
        {
            var asset = await _context.Assets.FindAsync(request.AssetId);
            if (asset == null) 
                return NotFound("Demirbaş sistemde bulunamadı.");

            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null) 
                return NotFound("Personel sistemde bulunamadı.");

            if (asset.IsAssigned) 
                return BadRequest("Bu demirbaş zaten birine zimmetli! Önce boşa çıkartmalısınız.");

            asset.UserId = request.UserId;
            asset.IsAssigned = true;

            await _context.SaveChangesAsync();

            return Ok(new { Mesaj = $"'{asset.Name}' isimli demirbaş, {user.FirstName} {user.LastName} personeline başarıyla zimmetlendi!" });
        }
        
        [HttpPut("unassign/{assetId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UnassignAsset(Guid assetId)
        {
            var asset = await _context.Assets
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.Id == assetId);

            if (asset == null) 
                return NotFound("Demirbaş sistemde bulunamadı.");

            if (!asset.IsAssigned) 
                return BadRequest("Bu demirbaş zaten depoda, kimseye zimmetli değil!");

            var previousUser = $"{asset.User?.FirstName} {asset.User?.LastName}";

            asset.UserId = null;
            asset.IsAssigned = false;

            await _context.SaveChangesAsync();

            return Ok(new { Mesaj = $"'{asset.Name}' isimli demirbaş {previousUser} personelinden başarıyla teslim alındı ve depoya kaldırıldı." });
        }
        
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateAsset(Guid id, [FromBody] UpdateAssetDto request)
        {
            var asset = await _context.Assets.FindAsync(id);
            
            if (asset == null) 
                return NotFound("Güncellenmek istenen demirbaş sistemde bulunamadı.");

            asset.Name = request.Name;
            asset.Description = request.Description;
            asset.SerialNumber = request.SerialNumber;
            asset.PurchaseDate = request.PurchaseDate;

            await _context.SaveChangesAsync();

            return Ok(new { Mesaj = $"'{asset.Name}' isimli demirbaşın bilgileri başarıyla güncellendi." });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAsset(Guid id)
        {
            var asset = await _context.Assets.FindAsync(id);

            if (asset == null) 
                return NotFound("Silinmek istenen demirbaş sistemde bulunamadı.");

            if (asset.IsAssigned)
                return BadRequest("Bu demirbaş şu an bir personele zimmetli! Silmeden önce lütfen iade (unassign) işlemini gerçekleştirin.");

            _context.Assets.Remove(asset);
            await _context.SaveChangesAsync();

            return Ok(new { Mesaj = "Demirbaş sistemden kalıcı olarak silindi." });
        }
    }
}