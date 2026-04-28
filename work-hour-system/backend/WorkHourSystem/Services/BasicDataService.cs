using WorkHourSystem.Data;
using WorkHourSystem.Dtos;

namespace WorkHourSystem.Services;

public interface IBasicDataService
{
    PersonDto? GetPerson(string personCode);
    List<PersonDto> GetPersons(string viewerPersonCode);
    List<ProjectDto> GetMyProjects(string personCode);
    List<ProjectDto> GetAllProjects(string personCode);
    List<AttendanceDto> GetMyAttendance(string personCode, DateTime startDate, DateTime endDate);
    List<AttendanceDto> GetDeptAttendance(string personCode, string departmentId, DateTime startDate, DateTime endDate);
    List<OaProcessDto> GetPendingOaProcesses(string personCode);
    bool SimulateOaProcess(string adminCode, OaProcessDto process);
}

public class BasicDataService : IBasicDataService
{
    private readonly InMemoryDataStore _dataStore;
    private readonly IPermissionService _permissionService;

    public BasicDataService(InMemoryDataStore dataStore, IPermissionService permissionService)
    {
        _dataStore = dataStore;
        _permissionService = permissionService;
    }

    public PersonDto? GetPerson(string personCode)
    {
        var person = _dataStore.Persons.FirstOrDefault(p => p.PersonCode == personCode);
        return person == null ? null : MapToPersonDto(person);
    }

    public List<PersonDto> GetPersons(string viewerPersonCode)
    {
        var accessiblePersons = _permissionService.GetAccessiblePersonCodes(viewerPersonCode);
        return _dataStore.Persons
            .Where(p => accessiblePersons.Contains(p.PersonCode))
            .Select(MapToPersonDto)
            .ToList();
    }

    public List<ProjectDto> GetMyProjects(string personCode)
    {
        var projectCodes = _dataStore.ProjectMembers
            .Where(pm => pm.PersonCode == personCode)
            .Select(pm => pm.ProjectCode)
            .ToList();

        return _dataStore.Projects
            .Where(p => projectCodes.Contains(p.ProjectCode))
            .Select(MapToProjectDto)
            .ToList();
    }

    public List<ProjectDto> GetAllProjects(string personCode)
    {
        if (!_permissionService.IsAdminOrHR(personCode))
            return [];

        return _dataStore.Projects.Select(MapToProjectDto).ToList();
    }

    public List<AttendanceDto> GetMyAttendance(string personCode, DateTime startDate, DateTime endDate)
    {
        return _dataStore.Attendances
            .Where(a => a.PersonCode == personCode &&
                       a.Date >= startDate &&
                       a.Date <= endDate)
            .Select(MapToAttendanceDto)
            .ToList();
    }

    public List<AttendanceDto> GetDeptAttendance(string personCode, string departmentId, DateTime startDate, DateTime endDate)
    {
        if (!_permissionService.CanAccessDepartment(personCode, departmentId))
            return [];

        var deptMembers = _dataStore.Persons
            .Where(p => p.DepartmentId == departmentId)
            .Select(p => p.PersonCode)
            .ToList();

        return _dataStore.Attendances
            .Where(a => deptMembers.Contains(a.PersonCode) &&
                       a.Date >= startDate &&
                       a.Date <= endDate)
            .Select(MapToAttendanceDto)
            .ToList();
    }

    public List<OaProcessDto> GetPendingOaProcesses(string personCode)
    {
        return _dataStore.OaProcessSnapshots
            .Where(op => op.PersonCode == personCode && op.Status == "pending")
            .Select(MapToOaProcessDto)
            .ToList();
    }

    public bool SimulateOaProcess(string adminCode, OaProcessDto process)
    {
        if (!_permissionService.IsAdminOrHR(adminCode))
            return false;

        _dataStore.OaProcessSnapshots.Add(new Models.OaProcessSnapshot
        {
            Id = Guid.NewGuid().ToString(),
            PersonCode = process.PersonCode,
            Type = process.Type,
            ProcessDate = process.ProcessDate,
            Status = process.Status,
            DurationHours = process.DurationHours
        });

        return true;
    }

    private PersonDto MapToPersonDto(Models.Person person)
    {
        return new PersonDto
        {
            PersonCode = person.PersonCode,
            Name = person.Name,
            DepartmentId = person.DepartmentId,
            DepartmentName = person.DepartmentName,
            Email = person.Email,
            Role = person.Role
        };
    }

    private ProjectDto MapToProjectDto(Models.Project project)
    {
        var manager = _dataStore.Persons.FirstOrDefault(p => p.PersonCode == project.ManagerCode);
        return new ProjectDto
        {
            ProjectCode = project.ProjectCode,
            ProjectName = project.ProjectName,
            ManagerCode = project.ManagerCode,
            ManagerName = manager?.Name ?? "",
            Status = project.Status,
            StartDate = project.StartDate,
            EndDate = project.EndDate
        };
    }

    private AttendanceDto MapToAttendanceDto(Models.Attendance attendance)
    {
        var person = _dataStore.Persons.FirstOrDefault(p => p.PersonCode == attendance.PersonCode);
        return new AttendanceDto
        {
            PersonCode = attendance.PersonCode,
            PersonName = person?.Name ?? "",
            Date = attendance.Date,
            Status = attendance.Status,
            CheckIn = attendance.CheckIn,
            CheckOut = attendance.CheckOut,
            LeaveType = attendance.LeaveType,
            LeaveDuration = attendance.LeaveDuration,
            LeaveStatus = attendance.LeaveStatus
        };
    }

    private OaProcessDto MapToOaProcessDto(Models.OaProcessSnapshot process)
    {
        return new OaProcessDto
        {
            Id = process.Id,
            PersonCode = process.PersonCode,
            Type = process.Type,
            ProcessDate = process.ProcessDate,
            Status = process.Status,
            DurationHours = process.DurationHours
        };
    }
}