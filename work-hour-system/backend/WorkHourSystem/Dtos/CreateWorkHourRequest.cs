namespace WorkHourSystem.Dtos;

public class CreateWorkHourRequest
{
    public string ProjectCode { get; set; } = string.Empty;
    public DateTime WorkDate { get; set; }
    public decimal Hours { get; set; }
    public string Description { get; set; } = string.Empty;
    public string WorkType { get; set; } = "normal";
}