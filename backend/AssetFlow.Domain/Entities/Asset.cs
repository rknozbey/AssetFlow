namespace AssetFlow.Domain.Entities
{
    public class Asset
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty; // Demirbaşın Adı (Örn: Macbook Pro)
        public string? Description { get; set; } // Açıklama veya teknik detaylar
        public string SerialNumber { get; set; } = string.Empty; // Benzersiz seri numarası
        public DateTime PurchaseDate { get; set; } // Satın alınma tarihi
        public bool IsAssigned { get; set; } = false; // Birine zimmetli mi?
        public bool IsActive { get; set; } = true; // Kullanımdan kaldırıldı mı (hurda/kayıp durumu)?

        // YENİ EKLENEN: React arayüzünden gelen departman bilgisini tutacak alan
        public string? Department { get; set; }

        // User Navigation (Mevcut)
        public Guid? UserId { get; set; } 
        public User? User { get; set; }

        // Category Navigation (Mevcut)
        public Guid? CategoryId { get; set; } // Her demirbaşın bir kategorisi olmalı
        public Category? Category { get; set; }
    }
}