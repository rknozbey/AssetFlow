using AssetFlow.API.DTOs;
using AssetFlow.Domain.Entities;
using AssetFlow.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssetFlow.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // BU KİLİT SAYESİNDE SADECE GİRİŞ YAPMIŞ PERSONELLER DEMİRBAŞ EKLEYEBİLİR
    public class AssetController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AssetController(AppDbContext context)
        {
            _context = context;
        }

        // 1. Yeni Demirbaş Ekleme Uç Noktası (POST)
        [HttpPost]
        public async Task<IActionResult> CreateAsset([FromBody] CreateAssetDto request)
        {
            var newAsset = new Asset
            {
                Name = request.Name,
                Description = request.Description,
                SerialNumber = request.SerialNumber,
                PurchaseDate = request.PurchaseDate
                // IsAssigned ve IsActive gibi değerler zaten default (false/true) olarak ayarlı
            };

            _context.Assets.Add(newAsset);
            await _context.SaveChangesAsync();

            return Ok(new { Mesaj = "Demirbaş başarıyla sisteme eklendi!", DemirbasId = newAsset.Id });
        }

        // 2. Sistemdeki Tüm Demirbaşları Listeleme Uç Noktası (GET)
        [HttpGet]
        public async Task<IActionResult> GetAllAssets()
        {
            var assets = await _context.Assets
                .Include(a => a.User) // Eğer zimmetliyse, personelin bilgilerini de yanına ekle (Join)
                .Select(a => new
                {
                    a.Id,
                    a.Name,
                    a.SerialNumber,
                    a.IsAssigned,
                    // Eğer UserId doluysa personelin adını yaz, boşsa "Depoda" yaz
                   ZimmetDurumu = a.User != null ? $"{a.User.FirstName} {a.User.LastName} üzerine zimmetli" : "Depoda (Boşta)"
                })
                .ToListAsync();

            return Ok(assets);
        }

        // 3. Demirbaşı Personele Zimmetleme Uç Noktası (PUT)
        [HttpPut("assign")]
        public async Task<IActionResult> AssignAsset([FromBody] AssignAssetDto request)
        {
            // 1. Demirbaşı bul
            var asset = await _context.Assets.FindAsync(request.AssetId);
            if (asset == null) 
                return NotFound("Demirbaş sistemde bulunamadı.");

            // 2. Personeli bul
            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null) 
                return NotFound("Personel sistemde bulunamadı.");

            // 3. Demirbaş zaten başkasına verilmiş mi kontrol et
            if (asset.IsAssigned) 
                return BadRequest("Bu demirbaş zaten birine zimmetli! Önce boşa çıkartmalısınız.");

            // 4. Atama işlemini gerçekleştir
            asset.UserId = request.UserId;
            asset.IsAssigned = true;

            await _context.SaveChangesAsync();

            return Ok(new { Mesaj = $"'{asset.Name}' isimli demirbaş, {user.FirstName} {user.LastName} personeline başarıyla zimmetlendi!" });

        }
        // 4. Demirbaşı Zimmetten Düşme / İade Uç Noktası (PUT)
        [HttpPut("unassign/{assetId}")]
        public async Task<IActionResult> UnassignAsset(Guid assetId)
        {
            // 1. Demirbaşı ve üzerindeki personeli bul
            var asset = await _context.Assets
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.Id == assetId);

            if (asset == null) 
                return NotFound("Demirbaş sistemde bulunamadı.");

            // 2. Demirbaş zaten boşta mı kontrol et
            if (!asset.IsAssigned) 
                return BadRequest("Bu demirbaş zaten depoda, kimseye zimmetli değil!");

            // Bilgi mesajı için eski personelin adını hafızaya alalım
            var previousUser = $"{asset.User?.FirstName} {asset.User?.LastName}";

            // 3. İade işlemini gerçekleştir (Bağı kopar)
            asset.UserId = null;
            asset.IsAssigned = false;

            await _context.SaveChangesAsync();

            return Ok(new { Mesaj = $"'{asset.Name}' isimli demirbaş {previousUser} personelinden başarıyla teslim alındı ve depoya kaldırıldı." });
        }
    }
}