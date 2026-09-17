using Aplicacao.Dashboard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly ObterDashboardResumoCasoDeUso _obterDashboardResumoCasoDeUso;

    public DashboardController(ObterDashboardResumoCasoDeUso obterDashboardResumoCasoDeUso)
    {
        _obterDashboardResumoCasoDeUso = obterDashboardResumoCasoDeUso;
    }

    [HttpGet]
    public async Task<IActionResult> ObterResumo(
        [FromQuery] DateTime? dataInicio,
        [FromQuery] DateTime? dataFim,
        CancellationToken cancellationToken)
    {
        var resultado = await _obterDashboardResumoCasoDeUso.ExecutarAsync(dataInicio, dataFim, cancellationToken);
        return Ok(resultado.Dados);
    }
}
