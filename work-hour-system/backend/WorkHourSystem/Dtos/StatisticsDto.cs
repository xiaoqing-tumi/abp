namespace WorkHourSystem.Dtos;

public class PersonalStatisticsDto
{
    public string PersonCode { get; set; } = string.Empty;
    public string PersonName { get; set; } = string.Empty;
    public decimal TotalHours { get; set; }
    public decimal NormalHours { get; set; }
    public decimal OvertimeHours { get; set; }
    public decimal LeaveHours { get; set; }
    public int WorkDays { get; set; }
}

public class DepartmentStatisticsDto
{
    public string DepartmentId { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public decimal TotalHours { get; set; }
    public decimal NormalHours { get; set; }
    public decimal OvertimeHours { get; set; }
    public decimal LeaveHours { get; set; }
    public int EmployeeCount { get; set; }
}

public class ProjectStatisticsDto
{
    public string ProjectCode { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
    public decimal TotalHours { get; set; }
    public decimal NormalHours { get; set; }
    public decimal OvertimeHours { get; set; }
    public int MemberCount { get; set; }
}