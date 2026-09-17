using Aplicacao.Comum;
using Aplicacao.Solicitacoes.DTOs;
using Dominio.Enums;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Solicitacoes;

public class ListarSolicitacoesOrcamentoCasoDeUso
{
    private readonly IAppDbContext _context;

    public ListarSolicitacoesOrcamentoCasoDeUso(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<RespostaResultado<IReadOnlyList<SolicitacaoOrcamentoResposta>>> ExecutarAsync(
        StatusSolicitacaoOrcamento? statusFiltro = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.SolicitacoesOrcamento
            .Include(s => s.Cliente)
            .Include(s => s.Servico)
            .Include(s => s.Respostas)
            .AsNoTracking();

        if (statusFiltro.HasValue)
        {
            query = query.Where(s => s.Status == statusFiltro.Value);
        }

        var solicitacoes = await query
            .OrderByDescending(s => s.DataCriacao)
            .Select(s => new SolicitacaoOrcamentoResposta(
                s.Id,
                s.ClienteId,
                s.Cliente != null ? s.Cliente.Nome : string.Empty,
                s.Cliente != null ? s.Cliente.Telefone : string.Empty,
                s.ServicoId,
                s.Servico != null ? s.Servico.Nome : string.Empty,
                s.Servico != null ? s.Servico.PrecoBase : 0m,
                s.Status,
                s.Status.ToString(),
                s.Respostas.Count,
                s.Respostas.Count(r => !string.IsNullOrEmpty(r.CaminhoArquivo)),
                s.DataCriacao
            ))
            .ToListAsync(cancellationToken);

        return RespostaResultado<IReadOnlyList<SolicitacaoOrcamentoResposta>>.Ok(solicitacoes);
    }
}
