using Aplicacao.Appointments;
using Aplicacao.Appointments.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[AllowAnonymous]
public class PublicoAgendamentosController : ControllerBase
{
    private readonly ConsultarHorariosDisponiveisCasoDeUso _consultarHorariosDisponiveisCasoDeUso;
    private readonly CriarAgendamentoPublicoCasoDeUso _criarAgendamentoPublicoCasoDeUso;

    public PublicoAgendamentosController(
        ConsultarHorariosDisponiveisCasoDeUso consultarHorariosDisponiveisCasoDeUso,
        CriarAgendamentoPublicoCasoDeUso criarAgendamentoPublicoCasoDeUso)
    {
        _consultarHorariosDisponiveisCasoDeUso = consultarHorariosDisponiveisCasoDeUso;
        _criarAgendamentoPublicoCasoDeUso = criarAgendamentoPublicoCasoDeUso;
    }

    [HttpGet("api/publico/{slugEmpresa}/agenda/disponibilidade")]
    public async Task<IActionResult> ConsultarDisponibilidade(
        string slugEmpresa,
        [FromQuery] Guid servicoId,
        [FromQuery] DateOnly data,
        CancellationToken cancellationToken)
    {
        var dataConsulta = data == default ? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)) : data;
        var resultado = await _consultarHorariosDisponiveisCasoDeUso.ExecutarAsync(slugEmpresa, servicoId, dataConsulta, cancellationToken);
        if (!resultado.Sucesso)
            return NotFound(new { tipo = "nao_encontrado", mensagem = resultado.Mensagem });

        return Ok(resultado.Dados);
    }

    [HttpPost("api/publico/agendamentos")]
    public async Task<IActionResult> AgendarPublico(
        [FromBody] CriarAgendamentoPublicoRequisicao requisicao,
        CancellationToken cancellationToken)
    {
        var resultado = await _criarAgendamentoPublicoCasoDeUso.ExecutarAsync(requisicao, cancellationToken);
        if (!resultado.Sucesso)
            return BadRequest(new { tipo = "validacao", mensagem = resultado.Mensagem, erros = resultado.Erros });

        return Created(string.Empty, resultado.Dados);
    }
}
