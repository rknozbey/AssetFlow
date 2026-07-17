using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AssetFlow.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] //  Sadece geçerli token'ı olanların girmesini sağlar!
    public class TestController : ControllerBase
    {
        [HttpGet("kilitli-kapi")]
        public IActionResult GetSecureData()
        {
            // Token içinden, kullanıcı giriş yaparken içine sakladığımız bilgileri (Claims) geri okuyoruz
            var userEmail = User.FindFirstValue(ClaimTypes.Email);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            return Ok(new 
            { 
                Mesaj = "Tebrikler, sistemin kilitli kapısını başarıyla açtınız!",
                KullaniciEmail = userEmail,
                YetkiTuru = userRole,
                KullaniciId = userId
            });
        }
    }
}