using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WorkHourSystem.Dtos;
using WorkHourSystem.Services;

namespace WorkHourSystem.Controllers;

[ApiController]
[Route("api/v1/work-hours")]
[Authorize]
public class WorkHourController : ControllerBase
{
    private readonly IWorkHourService _workHourService;

    public WorkHourController(IWorkHourService workHourService)
    {
        _workHourService = workHourService;
    }

    [HttpGet]
    public IActionResult GetWorkHours([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate, [FromQuery] string? projectCode)
    {
        var personCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(personCode))
            return Unauthorized();

        var workHours = _workHourService.GetWorkHours(personCode, startDate, endDate, projectCode);
        return Ok(ApiResponse<List<WorkHourDto>>.Success(workHours));
    }

    [HttpGet("{id}")]
    public IActionResult GetWorkHour(string id)
    {
        var personCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(personCode))
            return Unauthorized();

        var workHour = _workHourService.GetWorkHour(personCode, id);
        if (workHour == null)
            return NotFound(ApiResponse<WorkHourDto>.NotFound());

        return Ok(ApiResponse<WorkHourDto>.Success(workHour));
    }

    [HttpPost]
    public IActionResult CreateWorkHour([FromBody] CreateWorkHourRequest request)
    {
        var personCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(personCode))
            return Unauthorized();

        var workHour = _workHourService.CreateWorkHour(personCode, request);
        if (workHour == null)
            return BadRequest(ApiResponse<WorkHourDto>.BadRequest("工时创建失败，请检查业务规则"));

        return Ok(ApiResponse<WorkHourDto>.Success(workHour, "创建成功"));
    }

    [HttpPut("{id}")]
    public IActionResult UpdateWorkHour(string id, [FromBody] UpdateWorkHourRequest request)
    {
        var personCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(personCode))
            return Unauthorized();

        var workHour = _workHourService.UpdateWorkHour(personCode, id, request);
        if (workHour == null)
            return BadRequest(ApiResponse<WorkHourDto>.BadRequest("工时更新失败"));

        return Ok(ApiResponse<WorkHourDto>.Success(workHour, "更新成功"));
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteWorkHour(string id)
    {
        var personCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(personCode))
            return Unauthorized();

        var success = _workHourService.DeleteWorkHour(personCode, id);
        if (!success)
            return BadRequest(ApiResponse<object>.BadRequest("删除失败"));

        return Ok(ApiResponse<object>.Success(null, "删除成功"));
    }

    [HttpPost("{id}/submit")]
    public IActionResult SubmitWorkHour(string id)
    {
        var personCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(personCode))
            return Unauthorized();

        var success = _workHourService.SubmitWorkHour(personCode, id);
        if (!success)
            return BadRequest(ApiResponse<object>.BadRequest("提交失败"));

        return Ok(ApiResponse<object>.Success(null, "提交成功"));
    }

    [HttpGet("pending-approvals")]
    public IActionResult GetPendingApprovals()
    {
        var personCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(personCode))
            return Unauthorized();

        var approvals = _workHourService.GetPendingApprovals(personCode);
        return Ok(ApiResponse<List<WorkHourDto>>.Success(approvals));
    }

    [HttpPost("{id}/approve")]
    public IActionResult ApproveWorkHour(string id)
    {
        var personCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(personCode))
            return Unauthorized();

        var success = _workHourService.ApproveWorkHour(personCode, id);
        if (!success)
            return BadRequest(ApiResponse<object>.BadRequest("审批失败"));

        return Ok(ApiResponse<object>.Success(null, "审批通过"));
    }

    [HttpPost("{id}/reject")]
    public IActionResult RejectWorkHour(string id)
    {
        var personCode = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(personCode))
            return Unauthorized();

        var success = _workHourService.RejectWorkHour(personCode, id);
        if (!success)
            return BadRequest(ApiResponse<object>.BadRequest("驳回失败"));

        return Ok(ApiResponse<object>.Success(null, "已驳回"));
    }
}