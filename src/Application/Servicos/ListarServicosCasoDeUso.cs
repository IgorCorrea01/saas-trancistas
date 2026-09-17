using Aplicacao.Comum;
using Aplicacao.Servicos.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Servicos;

public class ListarServicosCasoDeUso
{
    private readonly IAppDbContext _context;

    public ListarServicosCasoDeUso(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<RespostaResultado<IReadOnlyList<ServicoResposta>>> ListarAutenticadoAsync(bool? apenasAtivos = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Servicos
            .Include(s => s.Perguntas)
            .AsNoTracking();

        if (apenasAtivos.HasValue)
        {
            query = query.Where(s => s.Ativo == apenasAtivos.Value);
        }

        var servicos = await query
            .OrderBy(s => s.Nome)
            .Select(s => new ServicoResposta(
                s.Id,
                s.Nome,
                s.Descricao,
                s.PrecoBase,
                s.DuracaoEstimadaMinutos,
                s.Ativo,
                s.Perguntas.Count,
                s.DataCriacao
            ))
            .ToListAsync(cancellationToken);

        return RespostaResultado<IReadOnlyList<ServicoResposta>>.Ok(servicos);
    }

    public async Task<RespostaResultado<IReadOnlyList<ServicoDetalhesResposta>>> ListarPublicoPorSlugEmpresaAsync(string slugEmpresa, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(slugEmpresa))
            return RespostaResultado<IReadOnlyList<ServicoDetalhesResposta>>.Falha("Slug da empresa inválido.");

        var slugNormalizado = slugEmpresa.Trim().ToLowerInvariant();

        // Localiza a empresa sem query filter
        var empresa = await _context.Empresas
            .IgnoreQueryFilters()
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Slug == slugNormalizado && e.Ativa, cancellationToken);

        if (empresa == null)
            return RespostaResultado<IReadOnlyList<ServicoDetalhesResposta>>.Falha("Empresa de tranças não encontrada ou inativa.");

        // Consulta serviços ativos da empresa
        var servicos = await _context.Servicos
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(s => s.EmpresaId == empresa.Id && s.Ativo)
            .Include(s => s.Perguntas.OrderBy(p => p.Ordem))
                .ThenInclude(p => p.Opcoes.OrderBy(o => o.Ordem))
            .OrderBy(s => s.Nome)
            .ToListAsync(cancellationToken);

        var listaResposta = servicos.Select(servico => new ServicoDetalhesResposta(
            servico.Id,
            servico.Nome,
            servico.Descricao,
            servico.PrecoBase,
            servico.DuracaoEstimadaMinutos,
            servico.Ativo,
            servico.DataCriacao,
            servico.DataAtualizacao,
            servico.Perguntas
                .OrderBy(p => p.Ordem)
                .Select(p => new PerguntaServicoResposta(
                    p.Id,
                    p.Enunciado,
                    p.DescricaoAjuda,
                    p.Tipo,
                    p.Tipo.ToString(),
                    p.Obrigatoria,
                    p.Ordem,
                    p.Opcoes.OrderBy(o => o.Ordem).Select(o => new OpcaoPerguntaResposta(o.Id, o.Texto, o.Ordem)).ToList()
                )).ToList()
        )).ToList();

        return RespostaResultado<IReadOnlyList<ServicoDetalhesResposta>>.Ok(listaResposta);
    }
}
