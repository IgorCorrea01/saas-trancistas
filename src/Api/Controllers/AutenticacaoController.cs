using System.Security.Claims;
using Aplicacao.Autenticacao;
using Aplicacao.Autenticacao.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AutenticacaoController : ControllerBase
{
    private readonly RegistrarEmpresaCasoDeUso _registrarEmpresaCasoDeUso;
    private readonly AutenticarUsuarioCasoDeUso _autenticarUsuarioCasoDeUso;
    private readonly ObterPerfilUsuarioCasoDeUso _obterPerfilUsuarioCasoDeUso;

    public AutenticacaoController(
        RegistrarEmpresaCasoDeUso registrarEmpresaCasoDeUso,
        AutenticarUsuarioCasoDeUso autenticarUsuarioCasoDeUso,
        ObterPerfilUsuarioCasoDeUso obterPerfilUsuarioCasoDeUso)
    {
        _registrarEmpresaCasoDeUso = registrarEmpresaCasoDeUso;
        _autenticarUsuarioCasoDeUso = autenticarUsuarioCasoDeUso;
        _obterPerfilUsuarioCasoDeUso = obterPerfilUsuarioCasoDeUso;
    }

    [HttpPost("registrar")]
    [AllowAnonymous]
    public async Task<IActionResult> Registrar([FromBody] RegistrarEmpresaRequisicao requisicao, CancellationToken cancellationToken)
    {
        var resultado = await _registrarEmpresaCasoDeUso.ExecutarAsync(requisicao, cancellationToken);
        if (!resultado.Sucesso)
            return BadRequest(new { tipo = "validacao", mensagem = resultado.Mensagem, erros = resultado.Erros });

        return Created(string.Empty, resultado.Dados);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequisicao requisicao, CancellationToken cancellationToken)
    {
        var resultado = await _autenticarUsuarioCasoDeUso.ExecutarAsync(requisicao, cancellationToken);
        if (!resultado.Sucesso)
            return BadRequest(new { tipo = "autenticacao", mensagem = resultado.Mensagem, erros = resultado.Erros });

        return Ok(resultado.Dados);
    }

    [HttpGet("perfil")]
    [Authorize]
    public async Task<IActionResult> ObterPerfil(CancellationToken cancellationToken)
    {
        var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !Guid.TryParse(usuarioIdClaim, out var usuarioId))
            return Unauthorized(new { tipo = "nao_autorizado", mensagem = "Token de autenticação inválido." });

        var resultado = await _obterPerfilUsuarioCasoDeUso.ExecutarAsync(usuarioId, cancellationToken);
        if (!resultado.Sucesso)
            return NotFound(new { tipo = "nao_encontrado", mensagem = resultado.Mensagem });

        return Ok(resultado.Dados);
    }
}
