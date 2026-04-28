namespace WorkHourSystem.Dtos;

public class OaProcessDto
{
    public string Id { get; set; } = string.Empty;
    public string PersonCode { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public DateTime ProcessDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal DurationHours { get; set; }
}