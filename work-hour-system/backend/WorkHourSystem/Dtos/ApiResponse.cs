namespace WorkHourSystem.Dtos;

public class ApiResponse<T>
{
    public int Code { get; set; }
    public T? Data { get; set; }
    public string Message { get; set; } = string.Empty;

    public static ApiResponse<T> Success(T data) => new() { Code = 200, Data = data };
    public static ApiResponse<T> Success(T data, string message) => new() { Code = 200, Data = data, Message = message };
    public static ApiResponse<T> Error(int code, string message) => new() { Code = code, Message = message };
    public static ApiResponse<T> NotFound(string message = "Not found") => new() { Code = 404, Message = message };
    public static ApiResponse<T> BadRequest(string message) => new() { Code = 400, Message = message };
}