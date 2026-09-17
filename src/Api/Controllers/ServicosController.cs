using Aplicacao.Servicos;
using Aplicacao.Servicos.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ServicosController : ControllerBase
{
    private readonly CriarServicoCasoDeUso _criarServicoCasoDeUso;
    private readonly AtualizarServicoCasoDeUso _atualizarServicoCasoDeUso;
    private readonly ObterServicoPorIdCasoDeUso _obterServicoPorIdCasoDeUso;
    private readonly ListarServicosCasoDeUso _listarServicosCasoDeUso;
    private readonly AlternarStatusServicoCasoDeUso _alternarStatusServicoCasoDeUso;
    private readonly RemoverServicoCasoDeUso _removerServicoCasoDeUso;
    private readonly ConfigurarFormularioServicoCasoDeUso _configurarFormularioServicoCasoDeUso;
    private readonly CriarServicosPadraoTrancistaCasoDeUso _criarServicosPadraoTrancistaCasoDeUso;

    public ServicosController(
        CriarServicoCasoDeUso criarServicoCasoDeUso,
        AtualizarServicoCasoDeUso atualizarServicoCasoDeUso,
        ObterServicoPorIdCasoDeUso obterServicoPorIdCasoDeUso,
        ListarServicosCasoDeUso listarServicosCasoDeUso,
        AlternarStatusServicoCasoDeUso alternarStatusServicoCasoDeUso,
        RemoverServicoCasoDeUso removerServicoCasoDeUso,
        ConfigurarFormularioServicoCasoDeUso configurarFormularioServicoCasoDeUso,
        CriarServicosPadraoTrancistaCasoDeUso criarServicosPadraoTrancistaCasoDeUso)
    {
        _criarServicoCasoDeUso = criarServicoCasoDeUso;
        _atualizarServicoCasoDeUso = atualizarServicoCasoDeUso;
        _obterServicoPorIdCasoDeUso = obterServicoPorIdCasoDeUso;
        _listarServicosCasoDeUso = listarServicosCasoDeUso;
        _alternarStatusServicoCasoDeUso = alternarStatusServicoCasoDeUso;
        _removerServicoCasoDeUso = removerServicoCasoDeUso;
        _configurarFormularioServicoCasoDeUso = configurarFormularioServicoCasoDeUso;
        _criarServicosPadraoTrancistaCasoDeUso = criarServicosPadraoTrancistaCasoDeUso;
    }

    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] bool? apenasAtivos, CancellationToken cancellationToken)
    {
        var resultado = await _listarServicosCasoDeUso.ListarAutenticadoAsync(apenasAtivos, cancellationToken);
        return Ok(resultado.Dados);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> ObterPorId(Guid id, CancellationToken cancellationToken)
    {
        var resultado = await _obterServicoPorIdCasoDeUso.ExecutarAsync(id, cancellationToken);
        if (!resultado.Sucesso)
            return NotFound(new { tipo = "nao_encontrado", mensagem = resultado.Mensagem });

        return Ok(resultado.Dados);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] CriarServicoRequisicao requisicao, CancellationToken cancellationToken)
    {
        var resultado = await _criarServicoCasoDeUso.ExecutarAsync(requisicao, cancellationToken);
        if (!resultado.Sucesso)
            return BadRequest(new { tipo = "validacao", mensagem = resultado.Mensagem, erros = resultado.Erros });

        return CreatedAtAction(nameof(ObterPorId), new { id = resultado.Dados!.Id }, resultado.Dados);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Atualizar(Guid id, [FromBody] AtualizarServicoRequisicao requisicao, CancellationToken cancellationToken)
    {
        var resultado = await _atualizarServicoCasoDeUso.ExecutarAsync(id, requisicao, cancellationToken);
        if (!resultado.Sucesso)
            return BadRequest(new { tipo = "validacao", mensagem = resultado.Mensagem, erros = resultado.Erros });

        return Ok(resultado.Dados);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> AlternarStatus(Guid id, [FromBody] AlternarStatusServicoRequisicao requisicao, CancellationToken cancellationToken)
    {
        var resultado = await _alternarStatusServicoCasoDeUso.ExecutarAsync(id, requisicao.Ativo, cancellationToken);
        if (!resultado.Sucesso)
            return BadRequest(new { tipo = "validacao", mensagem = resultado.Mensagem });

        return Ok(resultado.Dados);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Remover(Guid id, CancellationToken cancellationToken)
    {
        var resultado = await _removerServicoCasoDeUso.ExecutarAsync(id, cancellationToken);
        if (!resultado.Sucesso)
            return NotFound(new { tipo = "nao_encontrado", mensagem = resultado.Mensagem });

        return NoContent();
    }

    [HttpPut("{id:guid}/formulario")]
    public async Task<IActionResult> ConfigurarFormulario(Guid id, [FromBody] ConfigurarFormularioRequisicao requisicao, CancellationToken cancellationToken)
    {
        var resultado = await _configurarFormularioServicoCasoDeUso.ExecutarAsync(id, requisicao, cancellationToken);
        if (!resultado.Sucesso)
            return BadRequest(new { tipo = "validacao", mensagem = resultado.Mensagem, erros = resultado.Erros });

        return Ok(resultado.Dados);
    }

    [HttpPost("gerar-padrao")]
    public async Task<IActionResult> GerarCatalogoPadrao(CancellationToken cancellationToken)
    {
        var resultado = await _criarServicosPadraoTrancistaCasoDeUso.ExecutarAsync(cancellationToken);
        if (!resultado.Sucesso)
            return BadRequest(new { tipo = "validacao", mensagem = resultado.Mensagem });

        return Ok(resultado.Dados);
    }
}

public record AlternarStatusServicoRequisicao(bool Ativo);
