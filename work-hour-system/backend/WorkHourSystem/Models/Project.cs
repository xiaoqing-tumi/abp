namespace WorkHourSystem.Models;

public class Project
{
    public string ProjectCode { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
    public string ManagerCode { get; set; } = string.Empty;
    public int Status { get; set; } = 1;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}