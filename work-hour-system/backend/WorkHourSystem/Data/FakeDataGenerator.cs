using WorkHourSystem.Constants;
using WorkHourSystem.Models;

namespace WorkHourSystem.Data;

public static class FakeDataGenerator
{
    private static readonly string[] Departments = { "技术部", "产品部", "市场部", "人力资源部", "财务部" };
    private static readonly string[] DepartmentIds = { "TECH", "PROD", "MKT", "HR", "FIN" };
    private static readonly string[] ProjectNames = { "电商平台重构", "移动端App开发", "数据分析平台", "CRM系统升级", "ERP实施项目", "供应链管理系统", "智能客服系统", "数据中台建设", "云服务迁移", "数字化转型项目" };
    private static readonly string[] FirstNames = { "张", "李", "王", "赵", "刘", "陈", "杨", "黄", "周", "吴" };
    private static readonly string[] LastNames = { "伟", "强", "芳", "敏", "静", "磊", "丽", "军", "洋", "波" };
    private static readonly Random Random = new();

    public static void GenerateData(InMemoryDataStore store)
    {
        GeneratePersons(store);
        GenerateProjects(store);
        GenerateProjectMembers(store);
        GenerateAttendances(store);
        GenerateOaProcessSnapshots(store);
        GenerateWorkHours(store);
    }

    private static void GeneratePersons(InMemoryDataStore store)
    {
        var roles = new[] { Roles.Employee, Roles.PM, Roles.DeptManager, Roles.HRAttendance, Roles.Admin, Roles.Director };
        
        for (int i = 0; i < 30; i++)
        {
            var deptIndex = i % Departments.Length;
            var person = new Person
            {
                PersonCode = $"EMP{i.ToString("D4")}",
                Name = FirstNames[Random.Next(FirstNames.Length)] + LastNames[Random.Next(LastNames.Length)],
                DepartmentId = DepartmentIds[deptIndex],
                DepartmentName = Departments[deptIndex],
                Email = $"emp{i:D4}@company.com",
                Status = 1,
                Role = GetRoleForPerson(i)
            };
            store.Persons.Add(person);
        }
    }

    private static string GetRoleForPerson(int index)
    {
        if (index == 0) return Roles.Admin;
        if (index == 1) return Roles.Director;
        if (index >= 2 && index <= 6) return Roles.DeptManager;
        if (index >= 7 && index <= 10) return Roles.PM;
        if (index >= 11 && index <= 13) return Roles.HRAttendance;
        return Roles.Employee;
    }

    private static void GenerateProjects(InMemoryDataStore store)
    {
        var pmCodes = store.Persons.Where(p => p.Role == Roles.PM).Select(p => p.PersonCode).ToList();
        
        for (int i = 0; i < ProjectNames.Length; i++)
        {
            var project = new Project
            {
                ProjectCode = $"PRJ{i.ToString("D3")}",
                ProjectName = ProjectNames[i],
                ManagerCode = pmCodes[Random.Next(pmCodes.Count)],
                Status = Random.Next(10) < 8 ? 1 : 0,
                StartDate = DateTime.Now.AddMonths(-Random.Next(6)),
                EndDate = Random.Next(10) < 3 ? DateTime.Now.AddMonths(Random.Next(3)) : null
            };
            store.Projects.Add(project);
        }
    }

    private static void GenerateProjectMembers(InMemoryDataStore store)
    {
        var employees = store.Persons.Where(p => p.Role == Roles.Employee || p.Role == Roles.PM).ToList();
        
        foreach (var project in store.Projects)
        {
            var memberCount = Random.Next(3, 8);
            var selectedEmployees = employees.OrderBy(_ => Random.Next()).Take(memberCount).ToList();
            
            foreach (var emp in selectedEmployees)
            {
                store.ProjectMembers.Add(new ProjectMember
                {
                    ProjectCode = project.ProjectCode,
                    PersonCode = emp.PersonCode,
                    Role = emp.PersonCode == project.ManagerCode ? "项目经理" : "成员"
                });
            }
        }
    }

    private static void GenerateAttendances(InMemoryDataStore store)
    {
        var today = DateTime.Today;
        
        foreach (var person in store.Persons)
        {
            for (int i = 6; i >= 0; i--)
            {
                var date = today.AddDays(-i);
                var status = GetAttendanceStatus(date.DayOfWeek);
                
                var attendance = new Attendance
                {
                    PersonCode = person.PersonCode,
                    Date = date,
                    Status = status,
                    CheckIn = status == "present" ? new TimeSpan(8 + Random.Next(3), 0, 0) : null,
                    CheckOut = status == "present" ? new TimeSpan(17 + Random.Next(2), 0, 0) : null,
                    LeaveType = status != "present" ? (status == "leave" ? "年假" : "事假") : string.Empty,
                    LeaveDuration = status != "present" ? (decimal)(4 + Random.Next(5)) : null,
                    LeaveStatus = status != "present" ? (Random.Next(10) < 7 ? "approved" : "pending") : string.Empty
                };
                store.Attendances.Add(attendance);
            }
        }
    }

    private static string GetAttendanceStatus(DayOfWeek dayOfWeek)
    {
        if (dayOfWeek == DayOfWeek.Saturday || dayOfWeek == DayOfWeek.Sunday)
            return "absent";
        
        var rand = Random.Next(100);
        if (rand < 85) return "present";
        if (rand < 95) return "leave";
        return "absent";
    }

    private static void GenerateOaProcessSnapshots(InMemoryDataStore store)
    {
        var today = DateTime.Today;
        var employees = store.Persons.Where(p => p.Role == Roles.Employee).ToList();
        
        foreach (var person in employees.Take(5))
        {
            store.OaProcessSnapshots.Add(new OaProcessSnapshot
            {
                Id = Guid.NewGuid().ToString(),
                PersonCode = person.PersonCode,
                Type = Random.Next(2) == 0 ? "leave" : "trip",
                ProcessDate = today.AddDays(Random.Next(-2, 3)),
                Status = "pending",
                DurationHours = 4 + Random.Next(5)
            });
        }
    }

    private static void GenerateWorkHours(InMemoryDataStore store)
    {
        var today = DateTime.Today;
        var employees = store.Persons.Where(p => p.Status == 1).ToList();
        var descriptions = new[] { "需求分析", "代码开发", "Bug修复", "代码审查", "会议讨论", "文档编写", "测试验证", "线上问题处理", "技术调研", "项目复盘" };
        
        foreach (var person in employees)
        {
            var projects = store.ProjectMembers.Where(pm => pm.PersonCode == person.PersonCode)
                                              .Select(pm => pm.ProjectCode).ToList();
            
            for (int i = 14; i >= 0; i--)
            {
                var date = today.AddDays(-i);
                var hasOaPending = store.OaProcessSnapshots.Any(op => 
                    op.PersonCode == person.PersonCode && 
                    op.ProcessDate.Date == date.Date && 
                    op.Status == "pending");
                
                if (!hasOaPending && projects.Any() && date.DayOfWeek != DayOfWeek.Saturday && date.DayOfWeek != DayOfWeek.Sunday)
                {
                    var hoursFilled = 0m;
                    var projectCount = Random.Next(1, 4);
                    
                    foreach (var projectCode in projects.OrderBy(_ => Random.Next()).Take(projectCount))
                    {
                        if (hoursFilled >= 8) break;
                        
                        var hours = Math.Min((decimal)(Random.Next(2, 9) * 0.5), 8 - hoursFilled);
                        hoursFilled += hours;
                        
                        var isToday = i == 0;
                        var isYesterday = i == 1;
                        
                        store.WorkHours.Add(new WorkHour
                        {
                            Id = Guid.NewGuid().ToString(),
                            PersonCode = person.PersonCode,
                            ProjectCode = projectCode,
                            WorkDate = date,
                            Hours = hours,
                            Description = descriptions[Random.Next(descriptions.Length)],
                            WorkType = Random.Next(10) < 3 ? "overtime" : "normal",
                            Source = "manual",
                            Status = isToday ? "draft" : (isYesterday ? (Random.Next(10) < 5 ? "draft" : "submitted") : (Random.Next(10) < 2 ? "submitted" : "approved")),
                            SubmitTime = !isToday ? DateTime.Now.AddDays(-i).AddHours(Random.Next(17, 21)) : DateTime.MinValue
                        });
                    }
                }
            }
        }
    }
}