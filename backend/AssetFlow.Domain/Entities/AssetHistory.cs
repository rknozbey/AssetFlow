namespace AssetFlow.Domain.Entities
{
    public class AssetHistory
    {
        public Guid Id { get; set; }
        
        // Hangi demirbaşla ilgili işlem yapıldı?
        public Guid AssetId { get; set; }
        public Asset? Asset { get; set; } // Hata vermemesi için Nullable (?) yapıldı

        // Kime zimmetlendi veya kimden alındı?
        public string UserId { get; set; } = string.Empty; // Varsayılan değer atandı
        public User? User { get; set; } // Hata vermemesi için Nullable (?) yapıldı

        // Yapılan işlemin türü: Örneğin "Zimmetlendi" veya "İade Edildi"
        public string ActionType { get; set; } = string.Empty; // Varsayılan değer atandı

        // İşlem ne zaman yapıldı?
        public DateTime ActionDate { get; set; }

        // Varsa ek bir not (örn: "Cihaz çizik teslim edildi")
        public string? Note { get; set; }
    }
}