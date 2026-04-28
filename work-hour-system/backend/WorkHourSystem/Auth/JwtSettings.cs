namespace WorkHourSystem.Auth;

public class JwtSettings
{
    public string SecretKey { get; set; } = "work-hour-system-secret-key-must-be-at-least-16-characters";
    public string Issuer { get; set; } = "WorkHourSystem";
    public string Audience { get; set; } = "WorkHourSystem";
    public int ExpireMinutes { get; set; } = 120;
}