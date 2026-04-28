namespace WorkHourSystem.Dtos;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string PersonCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string DepartmentId { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}