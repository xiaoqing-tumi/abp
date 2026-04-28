namespace WorkHourSystem.Models;

public class Attendance
{
    public string PersonCode { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Status { get; set; } = string.Empty;
    public TimeSpan? CheckIn { get; set; }
    public TimeSpan? CheckOut { get; set; }
    public string LeaveType { get; set; } = string.Empty;
    public decimal? LeaveDuration { get; set; }
    public string LeaveStatus { get; set; } = string.Empty;
}