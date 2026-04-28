using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WorkHourSystem.Dtos;
using WorkHourSystem.Services;

namespace WorkHourSystem.Controllers;

[ApiController]
[Route("api/v1/statistics")]
[Authorize]
public class StatisticsController : ControllerBase
{
    private readonly IWorkHourService _workHourService;

    public StatisticsController(IWorkHourService workHourService)
    {
        _workHourService = workHourService;
    }

    [HttpGet("personal")]
    public IActionResult GetPersonalStatistics([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var personCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(personCode))
            return Unauthorized();

        var stats = _workHourService.GetPersonalStatistics(personCode, startDate, endDate);
        return Ok(ApiResponse<PersonalStatisticsDto>.Success(stats));
    }

    [HttpGet("department")]
    public IActionResult GetDepartmentStatistics([FromQuery] string departmentId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var personCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(personCode))
            return Unauthorized();

        var stats = _workHourService.GetDepartmentStatistics(personCode, departmentId, startDate, endDate);
        return Ok(ApiResponse<DepartmentStatisticsDto>.Success(stats));
    }

    [HttpGet("project/{code}")]
    public IActionResult GetProjectStatistics(string code, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var personCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(personCode))
            return Unauthorized();

        var stats = _workHourService.GetProjectStatistics(personCode, code, startDate, endDate);
        return Ok(ApiResponse<ProjectStatisticsDto>.Success(stats));
    }
}