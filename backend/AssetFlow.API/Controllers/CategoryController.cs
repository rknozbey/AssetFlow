using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AssetFlow.Domain.Entities;
using AssetFlow.Infrastructure.Data;
// AppDbContext'in bulunduğu klasörün namespace'ini de buraya using ile eklemelisin

namespace AssetFlow.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // İstersen dünkü güvenlik kalkanını buraya da kurabilirsin:
    // [Authorize(Roles = "Admin")] 
    public class CategoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoryController(AppDbContext context)
        {
            _context = context;
        }

        // 1. Yeni Kategori Ekleme
        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] Category category)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            
            return Ok(category);
        }

        // 2. Tüm Kategorileri Listeleme
        [HttpGet]
        public async Task<IActionResult> GetAllCategories()
        {
            var categories = await _context.Categories.ToListAsync();
            return Ok(categories);
        }
    }
}