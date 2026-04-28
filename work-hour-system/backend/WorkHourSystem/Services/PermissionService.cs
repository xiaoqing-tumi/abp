using WorkHourSystem.Constants;
using WorkHourSystem.Data;
using WorkHourSystem.Models;

namespace WorkHourSystem.Services;

public interface IPermissionService
{
    bool CanAccessPerson(string viewerPersonCode, string targetPersonCode);
    bool CanAccessProject(string viewerPersonCode, string projectCode);
    bool CanAccessDepartment(string viewerPersonCode, string departmentId);
    List<string> GetAccessiblePersonCodes(string viewerPersonCode);
    List<string> GetAccessibleProjectCodes(string viewerPersonCode);
    List<string> GetAccessibleDepartmentIds(string viewerPersonCode);
    bool IsAdminOrHR(string personCode);
    bool IsManager(string personCode);
}

public class PermissionService : IPermissionService
{
    private readonly InMemoryDataStore _dataStore;

    public PermissionService(InMemoryDataStore dataStore)
    {
        _dataStore = dataStore;
    }

    public bool CanAccessPerson(string viewerPersonCode, string targetPersonCode)
    {
        if (viewerPersonCode == targetPersonCode) return true;
        
        var viewer = _dataStore.Persons.FirstOrDefault(p => p.PersonCode == viewerPersonCode);
        var target = _dataStore.Persons.FirstOrDefault(p => p.PersonCode == targetPersonCode);
        
        if (viewer == null || target == null) return false;
        
        if (viewer.Role == Roles.Admin || viewer.Role == Roles.Director) return true;
        
        if (viewer.Role == Roles.HRAttendance) return true;
        
        if (viewer.Role == Roles.DeptManager && viewer.DepartmentId == target.DepartmentId) return true;
        
        if (viewer.Role == Roles.PM)
        {
            var managedProjects = _dataStore.Projects.Where(p => p.ManagerCode == viewerPersonCode)
                                                    .Select(p => p.ProjectCode).ToList();
            var targetProjects = _dataStore.ProjectMembers.Where(pm => pm.PersonCode == targetPersonCode)
                                                          .Select(pm => pm.ProjectCode).ToList();
            return managedProjects.Intersect(targetProjects).Any();
        }
        
        return false;
    }

    public bool CanAccessProject(string viewerPersonCode, string projectCode)
    {
        var viewer = _dataStore.Persons.FirstOrDefault(p => p.PersonCode == viewerPersonCode);
        if (viewer == null) return false;
        
        if (viewer.Role == Roles.Admin || viewer.Role == Roles.Director) return true;
        
        if (viewer.Role == Roles.HRAttendance) return true;
        
        var project = _dataStore.Projects.FirstOrDefault(p => p.ProjectCode == projectCode);
        if (project == null) return false;
        
        if (project.ManagerCode == viewerPersonCode) return true;
        
        if (_dataStore.ProjectMembers.Any(pm => pm.PersonCode == viewerPersonCode && pm.ProjectCode == projectCode))
            return true;
        
        if (viewer.Role == Roles.DeptManager)
        {
            var projectMembers = _dataStore.ProjectMembers.Where(pm => pm.ProjectCode == projectCode)
                                                           .Select(pm => pm.PersonCode).ToList();
            var deptMembers = _dataStore.Persons.Where(p => p.DepartmentId == viewer.DepartmentId)
                                                .Select(p => p.PersonCode).ToList();
            return projectMembers.Intersect(deptMembers).Any();
        }
        
        return false;
    }

    public bool CanAccessDepartment(string viewerPersonCode, string departmentId)
    {
        var viewer = _dataStore.Persons.FirstOrDefault(p => p.PersonCode == viewerPersonCode);
        if (viewer == null) return false;
        
        if (viewer.Role == Roles.Admin || viewer.Role == Roles.Director) return true;
        
        if (viewer.Role == Roles.HRAttendance) return true;
        
        if (viewer.Role == Roles.DeptManager && viewer.DepartmentId == departmentId) return true;
        
        return false;
    }

    public List<string> GetAccessiblePersonCodes(string viewerPersonCode)
    {
        var viewer = _dataStore.Persons.FirstOrDefault(p => p.PersonCode == viewerPersonCode);
        if (viewer == null) return [];
        
        return viewer.Role switch
        {
            Roles.Admin or Roles.Director => _dataStore.Persons.Select(p => p.PersonCode).ToList(),
            Roles.HRAttendance => _dataStore.Persons.Select(p => p.PersonCode).ToList(),
            Roles.DeptManager => _dataStore.Persons.Where(p => p.DepartmentId == viewer.DepartmentId)
                                                  .Select(p => p.PersonCode).ToList(),
            Roles.PM => GetProjectMemberCodes(viewerPersonCode),
            _ => [viewerPersonCode]
        };
    }

    public List<string> GetAccessibleProjectCodes(string viewerPersonCode)
    {
        var viewer = _dataStore.Persons.FirstOrDefault(p => p.PersonCode == viewerPersonCode);
        if (viewer == null) return [];
        
        return viewer.Role switch
        {
            Roles.Admin or Roles.Director => _dataStore.Projects.Select(p => p.ProjectCode).ToList(),
            Roles.HRAttendance => _dataStore.Projects.Select(p => p.ProjectCode).ToList(),
            Roles.DeptManager => GetDeptRelatedProjects(viewer.DepartmentId),
            Roles.PM => _dataStore.Projects.Where(p => p.ManagerCode == viewerPersonCode)
                                          .Select(p => p.ProjectCode).ToList(),
            _ => _dataStore.ProjectMembers.Where(pm => pm.PersonCode == viewerPersonCode)
                                         .Select(pm => pm.ProjectCode).ToList()
        };
    }

    public List<string> GetAccessibleDepartmentIds(string viewerPersonCode)
    {
        var viewer = _dataStore.Persons.FirstOrDefault(p => p.PersonCode == viewerPersonCode);
        if (viewer == null) return [];
        
        return viewer.Role switch
        {
            Roles.Admin or Roles.Director => _dataStore.Persons.Select(p => p.DepartmentId).Distinct().ToList(),
            Roles.HRAttendance => _dataStore.Persons.Select(p => p.DepartmentId).Distinct().ToList(),
            Roles.DeptManager => [viewer.DepartmentId],
            Roles.PM => GetManagedProjectDepartments(viewerPersonCode),
            _ => [viewer.DepartmentId]
        };
    }

    public bool IsAdminOrHR(string personCode)
    {
        var person = _dataStore.Persons.FirstOrDefault(p => p.PersonCode == personCode);
        return person != null && (person.Role == Roles.Admin || person.Role == Roles.HRAttendance);
    }

    public bool IsManager(string personCode)
    {
        var person = _dataStore.Persons.FirstOrDefault(p => p.PersonCode == personCode);
        return person != null && (person.Role == Roles.DeptManager || person.Role == Roles.PM);
    }

    private List<string> GetProjectMemberCodes(string pmCode)
    {
        var managedProjects = _dataStore.Projects.Where(p => p.ManagerCode == pmCode)
                                                .Select(p => p.ProjectCode).ToList();
        return _dataStore.ProjectMembers.Where(pm => managedProjects.Contains(pm.ProjectCode))
                                       .Select(pm => pm.PersonCode).Distinct().ToList();
    }

    private List<string> GetDeptRelatedProjects(string departmentId)
    {
        var deptMembers = _dataStore.Persons.Where(p => p.DepartmentId == departmentId)
                                            .Select(p => p.PersonCode).ToList();
        return _dataStore.ProjectMembers.Where(pm => deptMembers.Contains(pm.PersonCode))
                                       .Select(pm => pm.ProjectCode).Distinct().ToList();
    }

    private List<string> GetManagedProjectDepartments(string pmCode)
    {
        var managedProjects = _dataStore.Projects.Where(p => p.ManagerCode == pmCode)
                                                .Select(p => p.ProjectCode).ToList();
        var memberCodes = _dataStore.ProjectMembers.Where(pm => managedProjects.Contains(pm.ProjectCode))
                                                   .Select(pm => pm.PersonCode).ToList();
        return _dataStore.Persons.Where(p => memberCodes.Contains(p.PersonCode))
                                 .Select(p => p.DepartmentId).Distinct().ToList();
    }
}