namespace API;

public class GoogleAuthResponseDto
{
    public bool IsAuthSuccessful { get; set; }
    // public string? ErrorMessage { get; set; }
    // public string? Token { get; set; }
    public string? Provider { get; set; }
    public string? DisplayName { get; set; }
}
