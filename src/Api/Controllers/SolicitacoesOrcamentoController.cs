using Aplicacao.Solicitacoes;
using Dominio.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/solicitacoes-orcamento")]
[Authorize]
public class SolicitacoesOrcamentoController : ControllerBase
{
    private readonly ListarSolicitacoesOrcamentoCasoDeUso _listarSolicitacoesOrcamentoCasoDeUso;
    private readonly ObterSolicitacaoOrcamentoPorIdCasoDeUso _obterSolicitacaoOrcamentoPorIdCasoDeUso;
    private readonly AtualizarStatusSolicitacaoCasoDeUso _atualizarStatusSolicitacaoCasoDeUso;

    public SolicitacoesOrcamentoController(
        ListarSolicitacoesOrcamentoCasoDeUso listarSolicitacoesOrcamentoCasoDeUso,
        ObterSolicitacaoOrcamentoPorIdCasoDeUso obterSolicitacaoOrcamentoPorIdCasoDeUso,
        AtualizarStatusSolicitacaoCasoDeUso atualizarStatusSolicitacaoCasoDeUso)
    {
        _listarSolicitacoesOrcamentoCasoDeUso = listarSolicitacoesOrcamentoCasoDeUso;
        _obterSolicitacaoOrcamentoPorIdCasoDeUso = obterSolicitacaoOrcamentoPorIdCasoDeUso;
        _atualizarStatusSolicitacaoCasoDeUso = atualizarStatusSolicitacaoCasoDeUso;
    }

    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] StatusSolicitacaoOrcamento? status, CancellationToken cancellationToken)
    {
        var resultado = await _listarSolicitacoesOrcamentoCasoDeUso.ExecutarAsync(status, cancellationToken);
        return Ok(resultado.Dados);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> ObterPorId(Guid id, CancellationToken cancellationToken)
    {
        var resultado = await _obterSolicitacaoOrcamentoPorIdCasoDeUso.ExecutarAsync(id, cancellationToken);
        if (!resultado.Sucesso)
            return NotFound(new { tipo = "nao_encontrado", mensagem = resultado.Mensagem });

        return Ok(resultado.Dados);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> AtualizarStatus(Guid id, [FromBody] AtualizarStatusSolicitacaoRequisicao requisicao, CancellationToken cancellationToken)
    {
        var resultado = await _atualizarStatusSolicitacaoCasoDeUso.ExecutarAsync(id, requisicao.Status, cancellationToken);
        if (!resultado.Sucesso)
            return BadRequest(new { tipo = "validacao", mensagem = resultado.Mensagem });

        return Ok(new { mensagem = resultado.Mensagem });
    }
}

public record AtualizarStatusSolicitacaoRequisicao(StatusSolicitacaoOrcamento Status);
