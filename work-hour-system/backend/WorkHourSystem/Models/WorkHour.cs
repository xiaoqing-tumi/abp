namespace WorkHourSystem.Models;

public class WorkHour
{
    public string Id { get; set; } = string.Empty;
    public string PersonCode { get; set; } = string.Empty;
    public string ProjectCode { get; set; } = string.Empty;
    public DateTime WorkDate { get; set; }
    public decimal Hours { get; set; }
    public string Description { get; set; } = string.Empty;
    public string WorkType { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime SubmitTime { get; set; }
}