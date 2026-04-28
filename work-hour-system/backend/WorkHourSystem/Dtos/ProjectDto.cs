namespace WorkHourSystem.Dtos;

public class ProjectDto
{
    public string ProjectCode { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
    public string ManagerCode { get; set; } = string.Empty;
    public string ManagerName { get; set; } = string.Empty;
    public int Status { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}