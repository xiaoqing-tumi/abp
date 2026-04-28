using Microsoft.AspNetCore.Mvc;
using WorkHourSystem.Auth;
using WorkHourSystem.Data;
using WorkHourSystem.Dtos;

namespace WorkHourSystem.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly InMemoryDataStore _dataStore;

    public AuthController(IAuthService authService, InMemoryDataStore dataStore)
    {
        _authService = authService;
        _dataStore = dataStore;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        var response = _authService.Login(request.PersonCode);
        if (response == null)
            return Unauthorized(ApiResponse<LoginResponse>.Error(401, "工号不存在或已离职"));

        return Ok(ApiResponse<LoginResponse>.Success(response));
    }

    [HttpGet("users")]
    public IActionResult GetAvailableUsers()
    {
        var users = _dataStore.Persons
            .Where(p => p.Status == 1)
            .Select(p => new { p.PersonCode, p.Name, p.DepartmentName, p.Role })
            .ToList<object>();
        return Ok(ApiResponse<List<object>>.Success(users));
    }
}