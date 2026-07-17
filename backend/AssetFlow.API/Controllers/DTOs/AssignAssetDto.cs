namespace AssetFlow.API.DTOs
{
    public class AssignAssetDto
    {
        public Guid AssetId { get; set; } // Hangi demirbaş?
        public Guid UserId { get; set; }  // Hangi personele?
    }
}