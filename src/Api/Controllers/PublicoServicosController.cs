using Aplicacao.Comum;
using Aplicacao.Servicos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Route("api/publico/{slugEmpresa}/servicos")]
[AllowAnonymous]
public class PublicoServicosController : ControllerBase
{
    private readonly ListarServicosCasoDeUso _listarServicosCasoDeUso;
    private readonly IAppDbContext _context;

    public PublicoServicosController(ListarServicosCasoDeUso listarServicosCasoDeUso, IAppDbContext context)
    {
        _listarServicosCasoDeUso = listarServicosCasoDeUso;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> ListarCatalogo(string slugEmpresa, CancellationToken cancellationToken)
    {
        var resultado = await _listarServicosCasoDeUso.ListarPublicoPorSlugEmpresaAsync(slugEmpresa, cancellationToken);
        if (!resultado.Sucesso)
            return NotFound(new { tipo = "nao_encontrado", mensagem = resultado.Mensagem });

        return Ok(resultado.Dados);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> ObterServico(string slugEmpresa, Guid id, CancellationToken cancellationToken)
    {
        var slugNormalizado = slugEmpresa.Trim().ToLowerInvariant();

        var empresa = await _context.Empresas
            .IgnoreQueryFilters()
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Slug == slugNormalizado && e.Ativa, cancellationToken);

        if (empresa == null)
            return NotFound(new { tipo = "nao_encontrado", mensagem = "Empresa de tranças não encontrada." });

        var servico = await _context.Servicos
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Include(s => s.Perguntas.OrderBy(p => p.Ordem))
                .ThenInclude(p => p.Opcoes.OrderBy(o => o.Ordem))
            .FirstOrDefaultAsync(s => s.Id == id && s.EmpresaId == empresa.Id && s.Ativo, cancellationToken);

        if (servico == null)
            return NotFound(new { tipo = "nao_encontrado", mensagem = "Serviço de trança não encontrado ou inativo." });

        var perguntasDto = servico.Perguntas
            .OrderBy(p => p.Ordem)
            .Select(p => new Aplicacao.Servicos.DTOs.PerguntaServicoResposta(
                p.Id,
                p.Enunciado,
                p.DescricaoAjuda,
                p.Tipo,
                p.Tipo.ToString(),
                p.Obrigatoria,
                p.Ordem,
                p.Opcoes.OrderBy(o => o.Ordem).Select(o => new Aplicacao.Servicos.DTOs.OpcaoPerguntaResposta(o.Id, o.Texto, o.Ordem)).ToList()
            )).ToList();

        var resposta = new Aplicacao.Servicos.DTOs.ServicoDetalhesResposta(
            servico.Id,
            servico.Nome,
            servico.Descricao,
            servico.PrecoBase,
            servico.DuracaoEstimadaMinutos,
            servico.Ativo,
            servico.DataCriacao,
            servico.DataAtualizacao,
            perguntasDto
        );

        return Ok(resposta);
    }
}
