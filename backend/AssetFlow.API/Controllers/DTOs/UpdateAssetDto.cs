namespace AssetFlow.API.DTOs
{
    public class UpdateAssetDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string SerialNumber { get; set; } = string.Empty;
        public DateTime PurchaseDate { get; set; }
    }
}