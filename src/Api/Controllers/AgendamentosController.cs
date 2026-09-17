using Aplicacao.Appointments;
using Aplicacao.Appointments.DTOs;
using Dominio.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/agendamentos")]
[Authorize]
public class AgendamentosController : ControllerBase
{
    private readonly ListarAgendamentosCasoDeUso _listarAgendamentosCasoDeUso;
    private readonly ObterAgendamentoPorIdCasoDeUso _obterAgendamentoPorIdCasoDeUso;
    private readonly AtualizarStatusAgendamentoCasoDeUso _atualizarStatusAgendamentoCasoDeUso;

    public AgendamentosController(
        ListarAgendamentosCasoDeUso listarAgendamentosCasoDeUso,
        ObterAgendamentoPorIdCasoDeUso obterAgendamentoPorIdCasoDeUso,
        AtualizarStatusAgendamentoCasoDeUso atualizarStatusAgendamentoCasoDeUso)
    {
        _listarAgendamentosCasoDeUso = listarAgendamentosCasoDeUso;
        _obterAgendamentoPorIdCasoDeUso = obterAgendamentoPorIdCasoDeUso;
        _atualizarStatusAgendamentoCasoDeUso = atualizarStatusAgendamentoCasoDeUso;
    }

    [HttpGet]
    public async Task<IActionResult> Listar(
        [FromQuery] DateTime? dataInicio,
        [FromQuery] DateTime? dataFim,
        [FromQuery] StatusAgendamento? status,
        CancellationToken cancellationToken)
    {
        var resultado = await _listarAgendamentosCasoDeUso.ExecutarAsync(dataInicio, dataFim, status, cancellationToken);
        return Ok(resultado.Dados);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> ObterPorId(Guid id, CancellationToken cancellationToken)
    {
        var resultado = await _obterAgendamentoPorIdCasoDeUso.ExecutarAsync(id, cancellationToken);
        if (!resultado.Sucesso)
            return NotFound(new { tipo = "nao_encontrado", mensagem = resultado.Mensagem });

        return Ok(resultado.Dados);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> AtualizarStatus(
        Guid id,
        [FromBody] AtualizarStatusAgendamentoRequisicao requisicao,
        CancellationToken cancellationToken)
    {
        var resultado = await _atualizarStatusAgendamentoCasoDeUso.ExecutarAsync(id, requisicao, cancellationToken);
        if (!resultado.Sucesso)
            return BadRequest(new { tipo = "validacao", mensagem = resultado.Mensagem });

        return Ok(resultado.Dados);
    }
}
