using Aplicacao.Orcamentos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/publico/orcamentos")]
[AllowAnonymous]
public class PublicoOrcamentosController : ControllerBase
{
    private readonly ObterOrcamentoPorTokenPublicoCasoDeUso _obterOrcamentoPorTokenPublicoCasoDeUso;
    private readonly AceitarOrcamentoPublicoCasoDeUso _aceitarOrcamentoPublicoCasoDeUso;
    private readonly RecusarOrcamentoPublicoCasoDeUso _recusarOrcamentoPublicoCasoDeUso;

    public PublicoOrcamentosController(
        ObterOrcamentoPorTokenPublicoCasoDeUso obterOrcamentoPorTokenPublicoCasoDeUso,
        AceitarOrcamentoPublicoCasoDeUso aceitarOrcamentoPublicoCasoDeUso,
        RecusarOrcamentoPublicoCasoDeUso recusarOrcamentoPublicoCasoDeUso)
    {
        _obterOrcamentoPorTokenPublicoCasoDeUso = obterOrcamentoPorTokenPublicoCasoDeUso;
        _aceitarOrcamentoPublicoCasoDeUso = aceitarOrcamentoPublicoCasoDeUso;
        _recusarOrcamentoPublicoCasoDeUso = recusarOrcamentoPublicoCasoDeUso;
    }

    [HttpGet("{token}")]
    public async Task<IActionResult> ObterPorToken(string token, CancellationToken cancellationToken)
    {
        var resultado = await _obterOrcamentoPorTokenPublicoCasoDeUso.ExecutarAsync(token, cancellationToken);
        if (!resultado.Sucesso)
            return NotFound(new { tipo = "nao_encontrado", mensagem = resultado.Mensagem });

        return Ok(resultado.Dados);
    }

    [HttpPost("{token}/aceitar")]
    public async Task<IActionResult> Aceitar(string token, CancellationToken cancellationToken)
    {
        var resultado = await _aceitarOrcamentoPublicoCasoDeUso.ExecutarAsync(token, cancellationToken);
        if (!resultado.Sucesso)
            return BadRequest(new { tipo = "validacao", mensagem = resultado.Mensagem });

        return Ok(resultado.Dados);
    }

    [HttpPost("{token}/recusar")]
    public async Task<IActionResult> Recusar(string token, CancellationToken cancellationToken)
    {
        var resultado = await _recusarOrcamentoPublicoCasoDeUso.ExecutarAsync(token, cancellationToken);
        if (!resultado.Sucesso)
            return BadRequest(new { tipo = "validacao", mensagem = resultado.Mensagem });

        return Ok(resultado.Dados);
    }
}
