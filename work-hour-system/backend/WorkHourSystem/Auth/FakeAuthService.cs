using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using WorkHourSystem.Data;
using WorkHourSystem.Dtos;
using WorkHourSystem.Models;

namespace WorkHourSystem.Auth;

public interface IAuthService
{
    LoginResponse? Login(string personCode);
    string GenerateToken(Person person);
}

public class FakeAuthService : IAuthService
{
    private readonly InMemoryDataStore _dataStore;
    private readonly JwtSettings _jwtSettings;

    public FakeAuthService(InMemoryDataStore dataStore, JwtSettings jwtSettings)
    {
        _dataStore = dataStore;
        _jwtSettings = jwtSettings;
    }

    public LoginResponse? Login(string personCode)
    {
        var person = _dataStore.Persons.FirstOrDefault(p => p.PersonCode == personCode && p.Status == 1);
        if (person == null) return null;

        var token = GenerateToken(person);

        return new LoginResponse
        {
            Token = token,
            PersonCode = person.PersonCode,
            Name = person.Name,
            DepartmentId = person.DepartmentId,
            DepartmentName = person.DepartmentName,
            Role = person.Role
        };
    }

    public string GenerateToken(Person person)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, person.PersonCode),
            new Claim(ClaimTypes.Name, person.Name),
            new Claim("DepartmentId", person.DepartmentId),
            new Claim("DepartmentName", person.DepartmentName),
            new Claim(ClaimTypes.Role, person.Role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.Now.AddMinutes(_jwtSettings.ExpireMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}