using Microsoft.Extensions.Hosting;
using WorkHourSystem.Data;

namespace WorkHourSystem.Services;

public class DataSyncHostedService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DataSyncHostedService> _logger;
    private static DateTime _lastSyncTime = DateTime.MinValue;
    private static bool _isSyncing = false;
    private static List<SyncLog> _syncLogs = new List<SyncLog>();

    public DataSyncHostedService(IServiceProvider serviceProvider, ILogger<DataSyncHostedService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("数据同步服务已启动");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await SyncDataAsync();
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "数据同步失败");
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }
    }

    private async Task SyncDataAsync()
    {
        if (_isSyncing) return;

        _isSyncing = true;
        var startTime = DateTime.Now;

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var dataStore = scope.ServiceProvider.GetRequiredService<InMemoryDataStore>();

            await Task.Delay(1000);

            var syncLog = new SyncLog
            {
                Id = Guid.NewGuid().ToString(),
                SyncTime = startTime,
                SyncType = "定时同步",
                Status = "成功",
                Message = "人员、项目、考勤数据同步完成",
                Details = new List<SyncDetail>
                {
                    new SyncDetail { DataType = "人员数据", Count = dataStore.Persons.Count, Status = "成功" },
                    new SyncDetail { DataType = "项目数据", Count = dataStore.Projects.Count, Status = "成功" },
                    new SyncDetail { DataType = "项目成员关系", Count = dataStore.ProjectMembers.Count, Status = "成功" },
                    new SyncDetail { DataType = "考勤数据", Count = dataStore.Attendances.Count, Status = "成功" },
                    new SyncDetail { DataType = "OA流程快照", Count = dataStore.OaProcessSnapshots.Count, Status = "成功" },
                }
            };

            lock (_syncLogs)
            {
                _syncLogs.Insert(0, syncLog);
                if (_syncLogs.Count > 100) _syncLogs.RemoveAt(_syncLogs.Count - 1);
            }

            _lastSyncTime = startTime;
            _logger.LogInformation("数据同步完成: {Time}", startTime);
        }
        catch (Exception ex)
        {
            var syncLog = new SyncLog
            {
                Id = Guid.NewGuid().ToString(),
                SyncTime = startTime,
                SyncType = "定时同步",
                Status = "失败",
                Message = ex.Message,
                Details = new List<SyncDetail>()
            };

            lock (_syncLogs)
            {
                _syncLogs.Insert(0, syncLog);
                if (_syncLogs.Count > 100) _syncLogs.RemoveAt(_syncLogs.Count - 1);
            }

            _logger.LogError(ex, "数据同步失败");
        }
        finally
        {
            _isSyncing = false;
        }
    }

    public static async Task ManualSyncAsync(InMemoryDataStore dataStore)
    {
        if (_isSyncing) throw new Exception("同步正在进行中，请稍后再试");

        _isSyncing = true;
        var startTime = DateTime.Now;

        try
        {
            await Task.Delay(1000);

            var syncLog = new SyncLog
            {
                Id = Guid.NewGuid().ToString(),
                SyncTime = startTime,
                SyncType = "手动同步",
                Status = "成功",
                Message = "手动同步完成",
                Details = new List<SyncDetail>
                {
                    new SyncDetail { DataType = "人员数据", Count = dataStore.Persons.Count, Status = "成功" },
                    new SyncDetail { DataType = "项目数据", Count = dataStore.Projects.Count, Status = "成功" },
                    new SyncDetail { DataType = "项目成员关系", Count = dataStore.ProjectMembers.Count, Status = "成功" },
                    new SyncDetail { DataType = "考勤数据", Count = dataStore.Attendances.Count, Status = "成功" },
                    new SyncDetail { DataType = "OA流程快照", Count = dataStore.OaProcessSnapshots.Count, Status = "成功" },
                }
            };

            lock (_syncLogs)
            {
                _syncLogs.Insert(0, syncLog);
                if (_syncLogs.Count > 100) _syncLogs.RemoveAt(_syncLogs.Count - 1);
            }

            _lastSyncTime = startTime;
        }
        finally
        {
            _isSyncing = false;
        }
    }

    public static DateTime GetLastSyncTime() => _lastSyncTime;
    public static bool IsSyncing() => _isSyncing;
    public static List<SyncLog> GetSyncLogs() => _syncLogs.ToList();
}

public class SyncLog
{
    public string Id { get; set; } = string.Empty;
    public DateTime SyncTime { get; set; }
    public string SyncType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public List<SyncDetail> Details { get; set; } = new List<SyncDetail>();
}

public class SyncDetail
{
    public string DataType { get; set; } = string.Empty;
    public int Count { get; set; }
    public string Status { get; set; } = string.Empty;
}
