using WorkHourSystem.Constants;
using WorkHourSystem.Data;
using WorkHourSystem.Dtos;
using WorkHourSystem.Models;

namespace WorkHourSystem.Services;

public interface IWorkHourService
{
    (bool Success, string Message) ValidateWorkHour(string personCode, DateTime workDate, decimal hours, string projectCode = "");
    WorkHourDto? CreateWorkHour(string personCode, CreateWorkHourRequest request);
    WorkHourDto? UpdateWorkHour(string personCode, string id, UpdateWorkHourRequest request);
    bool DeleteWorkHour(string personCode, string id);
    bool SubmitWorkHour(string personCode, string id);
    List<WorkHourDto> GetWorkHours(string personCode, DateTime? startDate = null, DateTime? endDate = null, string? projectCode = null);
    WorkHourDto? GetWorkHour(string personCode, string id);
    List<WorkHourDto> GetPendingApprovals(string personCode);
    bool ApproveWorkHour(string approverCode, string id);
    bool RejectWorkHour(string approverCode, string id);
    PersonalStatisticsDto GetPersonalStatistics(string personCode, DateTime startDate, DateTime endDate);
    DepartmentStatisticsDto GetDepartmentStatistics(string personCode, string departmentId, DateTime startDate, DateTime endDate);
    ProjectStatisticsDto GetProjectStatistics(string personCode, string projectCode, DateTime startDate, DateTime endDate);
}

public class WorkHourService : IWorkHourService
{
    private readonly InMemoryDataStore _dataStore;
    private readonly IPermissionService _permissionService;
    private const decimal StandardWorkHours = 8m;
    private const decimal MinimumWorkHours = 0.5m;

    public WorkHourService(InMemoryDataStore dataStore, IPermissionService permissionService)
    {
        _dataStore = dataStore;
        _permissionService = permissionService;
    }

    public (bool Success, string Message) ValidateWorkHour(string personCode, DateTime workDate, decimal hours, string projectCode = "")
    {
        if (workDate.Date > DateTime.Today)
            return (false, "不能填报未来日期的工时");

        if (workDate.Date < DateTime.Today.AddDays(-1))
            return (false, "只能填报当天及昨天的工时");

        if (hours <= 0 || hours > StandardWorkHours)
            return (false, $"工时必须大于0且不超过{StandardWorkHours}小时");

        if (hours % MinimumWorkHours != 0)
            return (false, $"工时最小单位为{MinimumWorkHours}小时");

        var hasPendingOa = _dataStore.OaProcessSnapshots.Any(op => 
            op.PersonCode == personCode && 
            op.ProcessDate.Date == workDate.Date && 
            op.Status == "pending");
        
        if (hasPendingOa)
            return (false, "该日期有待审批的请假/出差流程，无法手动填报工时");

        if (!string.IsNullOrEmpty(projectCode))
        {
            var isProjectMember = _dataStore.ProjectMembers.Any(pm => 
                pm.PersonCode == personCode && pm.ProjectCode == projectCode);
            if (!isProjectMember)
                return (false, "您不是该项目成员，无法在该项目上报工");

            var existingRecord = _dataStore.WorkHours.Any(wh => 
                wh.PersonCode == personCode && 
                wh.ProjectCode == projectCode && 
                wh.WorkDate.Date == workDate.Date &&
                wh.Status != WorkHourStatus.Rejected);
            if (existingRecord)
                return (false, "当天在该项目上已有工时记录");
        }

        var todayHours = _dataStore.WorkHours
            .Where(wh => wh.PersonCode == personCode && 
                        wh.WorkDate.Date == workDate.Date &&
                        wh.Status != WorkHourStatus.Rejected)
            .Sum(wh => wh.Hours);

        if (todayHours + hours > StandardWorkHours)
            return (false, $"今日已填报{todayHours}小时，超出标准工作时长限制");

        return (true, "校验通过");
    }

    public WorkHourDto? CreateWorkHour(string personCode, CreateWorkHourRequest request)
    {
        var (valid, message) = ValidateWorkHour(personCode, request.WorkDate, request.Hours, request.ProjectCode);
        if (!valid) return null;

        var workHour = new WorkHour
        {
            Id = Guid.NewGuid().ToString(),
            PersonCode = personCode,
            ProjectCode = request.ProjectCode,
            WorkDate = request.WorkDate,
            Hours = request.Hours,
            Description = request.Description,
            WorkType = request.WorkType,
            Source = "manual",
            Status = WorkHourStatus.Draft,
            SubmitTime = DateTime.MinValue
        };

        _dataStore.WorkHours.Add(workHour);
        return MapToDto(workHour);
    }

    public WorkHourDto? UpdateWorkHour(string personCode, string id, UpdateWorkHourRequest request)
    {
        var workHour = _dataStore.WorkHours.FirstOrDefault(wh => wh.Id == id);
        if (workHour == null) return null;

        if (workHour.PersonCode != personCode && !_permissionService.IsAdminOrHR(personCode))
            return null;

        if (workHour.Status != WorkHourStatus.Draft)
            return null;

        var (valid, _) = ValidateWorkHour(personCode, workHour.WorkDate, request.Hours);
        if (!valid) return null;

        workHour.Hours = request.Hours;
        workHour.Description = request.Description;
        workHour.WorkType = request.WorkType;

        return MapToDto(workHour);
    }

    public bool DeleteWorkHour(string personCode, string id)
    {
        var workHour = _dataStore.WorkHours.FirstOrDefault(wh => wh.Id == id);
        if (workHour == null) return false;

        if (workHour.PersonCode != personCode && !_permissionService.IsAdminOrHR(personCode))
            return false;

        if (workHour.Status != WorkHourStatus.Draft)
            return false;

        return _dataStore.WorkHours.Remove(workHour);
    }

    public bool SubmitWorkHour(string personCode, string id)
    {
        var workHour = _dataStore.WorkHours.FirstOrDefault(wh => wh.Id == id);
        if (workHour == null) return false;

        if (workHour.PersonCode != personCode)
            return false;

        if (workHour.Status != WorkHourStatus.Draft)
            return false;

        workHour.Status = WorkHourStatus.Submitted;
        workHour.SubmitTime = DateTime.Now;
        return true;
    }

    public List<WorkHourDto> GetWorkHours(string personCode, DateTime? startDate = null, DateTime? endDate = null, string? projectCode = null)
    {
        var accessiblePersons = _permissionService.GetAccessiblePersonCodes(personCode);
        
        var query = _dataStore.WorkHours.AsQueryable()
            .Where(wh => accessiblePersons.Contains(wh.PersonCode));

        if (startDate.HasValue)
            query = query.Where(wh => wh.WorkDate >= startDate.Value);
        
        if (endDate.HasValue)
            query = query.Where(wh => wh.WorkDate <= endDate.Value);
        
        if (!string.IsNullOrEmpty(projectCode))
            query = query.Where(wh => wh.ProjectCode == projectCode);

        return query.Select(MapToDto).ToList();
    }

    public WorkHourDto? GetWorkHour(string personCode, string id)
    {
        var workHour = _dataStore.WorkHours.FirstOrDefault(wh => wh.Id == id);
        if (workHour == null) return null;

        if (!_permissionService.CanAccessPerson(personCode, workHour.PersonCode))
            return null;

        return MapToDto(workHour);
    }

    public List<WorkHourDto> GetPendingApprovals(string personCode)
    {
        var viewer = _dataStore.Persons.FirstOrDefault(p => p.PersonCode == personCode);
        if (viewer == null) return [];

        IQueryable<WorkHour> query = _dataStore.WorkHours.AsQueryable()
            .Where(wh => wh.Status == WorkHourStatus.Submitted);

        if (viewer.Role == Roles.DeptManager)
        {
            var deptMembers = _dataStore.Persons.Where(p => p.DepartmentId == viewer.DepartmentId)
                                                .Select(p => p.PersonCode).ToList();
            query = query.Where(wh => deptMembers.Contains(wh.PersonCode));
        }
        else if (viewer.Role == Roles.PM)
        {
            var managedProjects = _dataStore.Projects.Where(p => p.ManagerCode == personCode)
                                                    .Select(p => p.ProjectCode).ToList();
            query = query.Where(wh => managedProjects.Contains(wh.ProjectCode));
        }
        else if (viewer.Role != Roles.Admin && viewer.Role != Roles.Director)
        {
            return [];
        }

        return query.Select(MapToDto).ToList();
    }

    public bool ApproveWorkHour(string approverCode, string id)
    {
        var workHour = _dataStore.WorkHours.FirstOrDefault(wh => wh.Id == id);
        if (workHour == null) return false;

        if (!CanApprove(approverCode, workHour))
            return false;

        workHour.Status = WorkHourStatus.Approved;
        return true;
    }

    public bool RejectWorkHour(string approverCode, string id)
    {
        var workHour = _dataStore.WorkHours.FirstOrDefault(wh => wh.Id == id);
        if (workHour == null) return false;

        if (!CanApprove(approverCode, workHour))
            return false;

        workHour.Status = WorkHourStatus.Rejected;
        return true;
    }

    private bool CanApprove(string approverCode, WorkHour workHour)
    {
        var approver = _dataStore.Persons.FirstOrDefault(p => p.PersonCode == approverCode);
        if (approver == null) return false;

        if (approver.Role == Roles.Admin || approver.Role == Roles.Director)
            return true;

        if (approver.Role == Roles.DeptManager)
        {
            var targetPerson = _dataStore.Persons.FirstOrDefault(p => p.PersonCode == workHour.PersonCode);
            return targetPerson != null && targetPerson.DepartmentId == approver.DepartmentId;
        }

        if (approver.Role == Roles.PM)
        {
            return _dataStore.Projects.Any(p => p.ProjectCode == workHour.ProjectCode && p.ManagerCode == approverCode);
        }

        return false;
    }

    public PersonalStatisticsDto GetPersonalStatistics(string personCode, DateTime startDate, DateTime endDate)
    {
        var workHours = _dataStore.WorkHours
            .Where(wh => wh.PersonCode == personCode &&
                        wh.WorkDate >= startDate &&
                        wh.WorkDate <= endDate &&
                        wh.Status != WorkHourStatus.Rejected)
            .ToList();

        var person = _dataStore.Persons.FirstOrDefault(p => p.PersonCode == personCode);

        return new PersonalStatisticsDto
        {
            PersonCode = personCode,
            PersonName = person?.Name ?? "",
            TotalHours = workHours.Sum(wh => wh.Hours),
            NormalHours = workHours.Where(wh => wh.WorkType == WorkTypes.Normal).Sum(wh => wh.Hours),
            OvertimeHours = workHours.Where(wh => wh.WorkType == WorkTypes.Overtime).Sum(wh => wh.Hours),
            LeaveHours = workHours.Where(wh => wh.WorkType == WorkTypes.Leave).Sum(wh => wh.Hours),
            WorkDays = workHours.Select(wh => wh.WorkDate.Date).Distinct().Count()
        };
    }

    public DepartmentStatisticsDto GetDepartmentStatistics(string personCode, string departmentId, DateTime startDate, DateTime endDate)
    {
        if (!_permissionService.CanAccessDepartment(personCode, departmentId))
            return new DepartmentStatisticsDto();

        var deptMembers = _dataStore.Persons.Where(p => p.DepartmentId == departmentId)
                                            .Select(p => p.PersonCode).ToList();

        var workHours = _dataStore.WorkHours
            .Where(wh => deptMembers.Contains(wh.PersonCode) &&
                        wh.WorkDate >= startDate &&
                        wh.WorkDate <= endDate &&
                        wh.Status != WorkHourStatus.Rejected)
            .ToList();

        var dept = _dataStore.Persons.FirstOrDefault(p => p.DepartmentId == departmentId);

        return new DepartmentStatisticsDto
        {
            DepartmentId = departmentId,
            DepartmentName = dept?.DepartmentName ?? "",
            TotalHours = workHours.Sum(wh => wh.Hours),
            NormalHours = workHours.Where(wh => wh.WorkType == WorkTypes.Normal).Sum(wh => wh.Hours),
            OvertimeHours = workHours.Where(wh => wh.WorkType == WorkTypes.Overtime).Sum(wh => wh.Hours),
            LeaveHours = workHours.Where(wh => wh.WorkType == WorkTypes.Leave).Sum(wh => wh.Hours),
            EmployeeCount = deptMembers.Count
        };
    }

    public ProjectStatisticsDto GetProjectStatistics(string personCode, string projectCode, DateTime startDate, DateTime endDate)
    {
        if (!_permissionService.CanAccessProject(personCode, projectCode))
            return new ProjectStatisticsDto();

        var workHours = _dataStore.WorkHours
            .Where(wh => wh.ProjectCode == projectCode &&
                        wh.WorkDate >= startDate &&
                        wh.WorkDate <= endDate &&
                        wh.Status != WorkHourStatus.Rejected)
            .ToList();

        var project = _dataStore.Projects.FirstOrDefault(p => p.ProjectCode == projectCode);
        var memberCount = _dataStore.ProjectMembers.Where(pm => pm.ProjectCode == projectCode).Count();

        return new ProjectStatisticsDto
        {
            ProjectCode = projectCode,
            ProjectName = project?.ProjectName ?? "",
            TotalHours = workHours.Sum(wh => wh.Hours),
            NormalHours = workHours.Where(wh => wh.WorkType == WorkTypes.Normal).Sum(wh => wh.Hours),
            OvertimeHours = workHours.Where(wh => wh.WorkType == WorkTypes.Overtime).Sum(wh => wh.Hours),
            MemberCount = memberCount
        };
    }

    private WorkHourDto MapToDto(WorkHour workHour)
    {
        var person = _dataStore.Persons.FirstOrDefault(p => p.PersonCode == workHour.PersonCode);
        var project = _dataStore.Projects.FirstOrDefault(p => p.ProjectCode == workHour.ProjectCode);

        return new WorkHourDto
        {
            Id = workHour.Id,
            PersonCode = workHour.PersonCode,
            PersonName = person?.Name ?? "",
            ProjectCode = workHour.ProjectCode,
            ProjectName = project?.ProjectName ?? "",
            WorkDate = workHour.WorkDate,
            Hours = workHour.Hours,
            Description = workHour.Description,
            WorkType = workHour.WorkType,
            Source = workHour.Source,
            Status = workHour.Status,
            SubmitTime = workHour.SubmitTime
        };
    }
}