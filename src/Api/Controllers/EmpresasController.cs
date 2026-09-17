using Aplicacao.Empresas;
using Aplicacao.Empresas.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmpresasController : ControllerBase
{
    private readonly ObterEmpresaAtualCasoDeUso _obterEmpresaAtualCasoDeUso;
    private readonly AtualizarEmpresaAtualCasoDeUso _atualizarEmpresaAtualCasoDeUso;

    public EmpresasController(
        ObterEmpresaAtualCasoDeUso obterEmpresaAtualCasoDeUso,
        AtualizarEmpresaAtualCasoDeUso atualizarEmpresaAtualCasoDeUso)
    {
        _obterEmpresaAtualCasoDeUso = obterEmpresaAtualCasoDeUso;
        _atualizarEmpresaAtualCasoDeUso = atualizarEmpresaAtualCasoDeUso;
    }

    [HttpGet("atual")]
    public async Task<IActionResult> ObterEmpresaAtual(CancellationToken cancellationToken)
    {
        var resultado = await _obterEmpresaAtualCasoDeUso.ExecutarAsync(cancellationToken);
        if (!resultado.Sucesso)
            return NotFound(new { tipo = "nao_encontrado", mensagem = resultado.Mensagem });

        return Ok(resultado.Dados);
    }

    [HttpPut("atual")]
    public async Task<IActionResult> AtualizarEmpresaAtual([FromBody] AtualizarEmpresaRequisicao requisicao, CancellationToken cancellationToken)
    {
        var resultado = await _atualizarEmpresaAtualCasoDeUso.ExecutarAsync(requisicao, cancellationToken);
        if (!resultado.Sucesso)
            return BadRequest(new { tipo = "validacao", mensagem = resultado.Mensagem, erros = resultado.Erros });

        return Ok(resultado.Dados);
    }
}
