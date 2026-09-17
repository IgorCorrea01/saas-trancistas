using Aplicacao.Orcamentos;
using Aplicacao.Orcamentos.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/orcamentos")]
[Authorize]
public class OrcamentosController : ControllerBase
{
    private readonly CriarOrcamentoCasoDeUso _criarOrcamentoCasoDeUso;
    private readonly ObterOrcamentoPorIdCasoDeUso _obterOrcamentoPorIdCasoDeUso;
    private readonly ObterOrcamentoPorSolicitacaoIdCasoDeUso _obterOrcamentoPorSolicitacaoIdCasoDeUso;

    public OrcamentosController(
        CriarOrcamentoCasoDeUso criarOrcamentoCasoDeUso,
        ObterOrcamentoPorIdCasoDeUso obterOrcamentoPorIdCasoDeUso,
        ObterOrcamentoPorSolicitacaoIdCasoDeUso obterOrcamentoPorSolicitacaoIdCasoDeUso)
    {
        _criarOrcamentoCasoDeUso = criarOrcamentoCasoDeUso;
        _obterOrcamentoPorIdCasoDeUso = obterOrcamentoPorIdCasoDeUso;
        _obterOrcamentoPorSolicitacaoIdCasoDeUso = obterOrcamentoPorSolicitacaoIdCasoDeUso;
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] CriarOrcamentoRequisicao requisicao, CancellationToken cancellationToken)
    {
        var resultado = await _criarOrcamentoCasoDeUso.ExecutarAsync(requisicao, cancellationToken);
        if (!resultado.Sucesso)
            return BadRequest(new { tipo = "validacao", mensagem = resultado.Mensagem, erros = resultado.Erros });

        return CreatedAtAction(nameof(ObterPorId), new { id = resultado.Dados!.Id }, resultado.Dados);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> ObterPorId(Guid id, CancellationToken cancellationToken)
    {
        var resultado = await _obterOrcamentoPorIdCasoDeUso.ExecutarAsync(id, cancellationToken);
        if (!resultado.Sucesso)
            return NotFound(new { tipo = "nao_encontrado", mensagem = resultado.Mensagem });

        return Ok(resultado.Dados);
    }

    [HttpGet("solicitacao/{solicitacaoId:guid}")]
    public async Task<IActionResult> ObterPorSolicitacaoId(Guid solicitacaoId, CancellationToken cancellationToken)
    {
        var resultado = await _obterOrcamentoPorSolicitacaoIdCasoDeUso.ExecutarAsync(solicitacaoId, cancellationToken);
        if (!resultado.Sucesso)
            return NotFound(new { tipo = "nao_encontrado", mensagem = resultado.Mensagem });

        return Ok(resultado.Dados);
    }
}
