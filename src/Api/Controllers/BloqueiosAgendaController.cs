using Aplicacao.Appointments;
using Aplicacao.Appointments.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/bloqueios-agenda")]
[Authorize]
public class BloqueiosAgendaController : ControllerBase
{
    private readonly CriarBloqueioAgendaCasoDeUso _criarBloqueioAgendaCasoDeUso;
    private readonly ListarBloqueiosAgendaCasoDeUso _listarBloqueiosAgendaCasoDeUso;
    private readonly RemoverBloqueioAgendaCasoDeUso _removerBloqueioAgendaCasoDeUso;

    public BloqueiosAgendaController(
        CriarBloqueioAgendaCasoDeUso criarBloqueioAgendaCasoDeUso,
        ListarBloqueiosAgendaCasoDeUso listarBloqueiosAgendaCasoDeUso,
        RemoverBloqueioAgendaCasoDeUso removerBloqueioAgendaCasoDeUso)
    {
        _criarBloqueioAgendaCasoDeUso = criarBloqueioAgendaCasoDeUso;
        _listarBloqueiosAgendaCasoDeUso = listarBloqueiosAgendaCasoDeUso;
        _removerBloqueioAgendaCasoDeUso = removerBloqueioAgendaCasoDeUso;
    }

    [HttpGet]
    public async Task<IActionResult> Listar(
        [FromQuery] DateTime? dataInicio,
        [FromQuery] DateTime? dataFim,
        CancellationToken cancellationToken)
    {
        var resultado = await _listarBloqueiosAgendaCasoDeUso.ExecutarAsync(dataInicio, dataFim, cancellationToken);
        return Ok(resultado.Dados);
    }

    [HttpPost]
    public async Task<IActionResult> Criar(
        [FromBody] CriarBloqueioAgendaRequisicao requisicao,
        CancellationToken cancellationToken)
    {
        var resultado = await _criarBloqueioAgendaCasoDeUso.ExecutarAsync(requisicao, cancellationToken);
        if (!resultado.Sucesso)
            return BadRequest(new { tipo = "validacao", mensagem = resultado.Mensagem, erros = resultado.Erros });

        return Created(string.Empty, resultado.Dados);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Remover(Guid id, CancellationToken cancellationToken)
    {
        var resultado = await _removerBloqueioAgendaCasoDeUso.ExecutarAsync(id, cancellationToken);
        if (!resultado.Sucesso)
            return NotFound(new { tipo = "nao_encontrado", mensagem = resultado.Mensagem });

        return NoContent();
    }
}
