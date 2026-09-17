using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SaudeController : ControllerBase
{
    private readonly IHostEnvironment _environment;

    public SaudeController(IHostEnvironment environment)
    {
        _environment = environment;
    }

    [HttpGet]
    public IActionResult ObterStatus()
    {
        return Ok(new
        {
            status = "Saudavel",
            ambiente = _environment.EnvironmentName,
            dataHora = DateTime.UtcNow
        });
    }
}
