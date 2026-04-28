using WorkHourSystem.Models;

namespace WorkHourSystem.Data;

public class InMemoryDataStore
{
    public List<Person> Persons { get; } = [];
    public List<Project> Projects { get; } = [];
    public List<ProjectMember> ProjectMembers { get; } = [];
    public List<Attendance> Attendances { get; } = [];
    public List<OaProcessSnapshot> OaProcessSnapshots { get; } = [];
    public List<WorkHour> WorkHours { get; } = [];
}