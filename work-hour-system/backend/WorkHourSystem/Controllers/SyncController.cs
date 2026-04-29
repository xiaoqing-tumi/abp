using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorkHourSystem.Data;
using WorkHourSystem.Services;

namespace WorkHourSystem.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class SyncController : ControllerBase
{
    private readonly InMemoryDataStore _dataStore;
    private readonly ILogger<SyncController> _logger;

    public SyncController(InMemoryDataStore dataStore, ILogger<SyncController> logger)
    {
        _dataStore = dataStore;
        _logger = logger;
    }

    [HttpGet("status")]
    public IActionResult GetSyncStatus()
    {
        var lastSyncTime = DataSyncHostedService.GetLastSyncTime();
        var isSyncing = DataSyncHostedService.IsSyncing();

        return Ok(new ApiResponse<object>
        {
            Code = 200,
            Data = new
            {
                lastSyncTime = lastSyncTime == DateTime.MinValue ? null : lastSyncTime.ToString("yyyy-MM-dd HH:mm:ss"),
                isSyncing,
                nextSyncTime = lastSyncTime == DateTime.MinValue ? "等待中" : lastSyncTime.AddHours(1).ToString("yyyy-MM-dd HH:mm:ss"),
            },
            Message = "获取同步状态成功"
        });
    }

    [HttpPost("manual")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ManualSync()
    {
        try
        {
            await DataSyncHostedService.ManualSyncAsync(_dataStore);
            return Ok(new ApiResponse<object>
            {
                Code = 200,
                Data = new { syncTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") },
                Message = "手动同步成功"
            });
        }
        catch (Exception ex)
        {
            return Ok(new ApiResponse<object>
            {
                Code = 400,
                Data = null,
                Message = ex.Message
            });
        }
    }

    [HttpGet("logs")]
    public IActionResult GetSyncLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var logs = DataSyncHostedService.GetSyncLogs();
        var total = logs.Count;
        var pagedLogs = logs.Skip((page - 1) * pageSize).Take(pageSize).ToList();

        return Ok(new ApiResponse<object>
        {
            Code = 200,
            Data = new
            {
                list = pagedLogs,
                total,
                page,
                pageSize
            },
            Message = "获取同步日志成功"
        });
    }

    [HttpGet("statistics")]
    public IActionResult GetSyncStatistics()
    {
        var logs = DataSyncHostedService.GetSyncLogs();
        var today = DateTime.Today;
        var todayLogs = logs.Where(l => l.SyncTime.Date == today).ToList();

        return Ok(new ApiResponse<object>
        {
            Code = 200,
            Data = new
            {
                totalSyncCount = logs.Count,
                successCount = logs.Count(l => l.Status == "成功"),
                failCount = logs.Count(l => l.Status == "失败"),
                todaySyncCount = todayLogs.Count,
                todaySuccessCount = todayLogs.Count(l => l.Status == "成功"),
                todayFailCount = todayLogs.Count(l => l.Status == "失败"),
                dataCounts = new
                {
                    persons = _dataStore.Persons.Count,
                    projects = _dataStore.Projects.Count,
                    projectMembers = _dataStore.ProjectMembers.Count,
                    attendances = _dataStore.Attendances.Count,
                    workHours = _dataStore.WorkHours.Count,
                    oaProcesses = _dataStore.OaProcessSnapshots.Count,
                }
            },
            Message = "获取同步统计成功"
        });
    }
}
