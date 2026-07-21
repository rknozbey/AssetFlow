namespace AssetFlow.Domain.Entities
{
    public class Category
    {
        // 1. Asset tablosundaki Guid CategoryId ile uyumlu olması için int yerine Guid kullanıyoruz.
        public Guid Id { get; set; }

        // 2. Kategori adı boş olamaz, bu yüzden varsayılan olarak boş string atıyoruz.
        public string Name { get; set; } = string.Empty;

        // 3. Açıklama kısmı isteğe bağlı olabilir, soru işareti (?) ile null olabileceğini belirtiyoruz.
        public string? Description { get; set; } 
        
        // 4. Null referans hatası almamak için koleksiyonu boş bir liste olarak başlatıyoruz.
        public ICollection<Asset> Assets { get; set; } = new List<Asset>();
    }
}