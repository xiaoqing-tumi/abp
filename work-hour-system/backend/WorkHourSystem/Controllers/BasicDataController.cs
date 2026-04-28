using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WorkHourSystem.Dtos;
using WorkHourSystem.Services;

namespace WorkHourSystem.Controllers;

[ApiController]
[Route("api/v1")]
[Authorize]
public class BasicDataController : ControllerBase
{
    private readonly IBasicDataService _basicDataService;

    public BasicDataController(IBasicDataService basicDataService)
    {
        _basicDataService = basicDataService;
    }

    [HttpGet("persons/mine")]
    public IActionResult GetCurrentUser()
    {
        var personCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(personCode))
            return Unauthorized();

        var person = _basicDataService.GetPerson(personCode);
        if (person == null)
            return NotFound(ApiResponse<PersonDto>.NotFound());

        return Ok(ApiResponse<PersonDto>.Success(person));
    }

    [HttpGet("persons")]
    public IActionResult GetPersons()
    {
        var personCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(personCode))
            return Unauthorized();

        var persons = _basicDataService.GetPersons(personCode);
        return Ok(ApiResponse<List<PersonDto>>.Success(persons));
    }

    [HttpGet("projects/my")]
    public IActionResult GetMyProjects()
    {
        var personCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(personCode))
            return Unauthorized();

        var projects = _basicDataService.GetMyProjects(personCode);
        return Ok(ApiResponse<List<ProjectDto>>.Success(projects));
    }

    [HttpGet("projects/all")]
    public IActionResult GetAllProjects()
    {
        var personCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(personCode))
            return Unauthorized();

        var projects = _basicDataService.GetAllProjects(personCode);
        return Ok(ApiResponse<List<ProjectDto>>.Success(projects));
    }

    [HttpGet("attendance/my")]
    public IActionResult GetMyAttendance([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var personCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(personCode))
            return Unauthorized();

        var attendance = _basicDataService.GetMyAttendance(personCode, startDate, endDate);
        return Ok(ApiResponse<List<AttendanceDto>>.Success(attendance));
    }

    [HttpGet("attendance/dept")]
    public IActionResult GetDeptAttendance([FromQuery] string departmentId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var personCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(personCode))
            return Unauthorized();

        var attendance = _basicDataService.GetDeptAttendance(personCode, departmentId, startDate, endDate);
        return Ok(ApiResponse<List<AttendanceDto>>.Success(attendance));
    }

    [HttpGet("oa-processes/pending")]
    public IActionResult GetPendingOaProcesses()
    {
        var personCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(personCode))
            return Unauthorized();

        var processes = _basicDataService.GetPendingOaProcesses(personCode);
        return Ok(ApiResponse<List<OaProcessDto>>.Success(processes));
    }

    [HttpPost("oa-processes/simulate")]
    public IActionResult SimulateOaProcess([FromBody] OaProcessDto process)
    {
        var personCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(personCode))
            return Unauthorized();

        var success = _basicDataService.SimulateOaProcess(personCode, process);
        if (!success)
            return Forbid();

        return Ok(ApiResponse<object>.Success(null, "模拟OA流程创建成功"));
    }
}