namespace WorkHourSystem.Dtos;

public class UpdateWorkHourRequest
{
    public decimal Hours { get; set; }
    public string Description { get; set; } = string.Empty;
    public string WorkType { get; set; } = "normal";
}