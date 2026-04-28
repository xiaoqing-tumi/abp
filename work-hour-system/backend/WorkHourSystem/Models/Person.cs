namespace WorkHourSystem.Models;

public class Person
{
    public string PersonCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string DepartmentId { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int Status { get; set; } = 1;
    public string Role { get; set; } = "Employee";
}