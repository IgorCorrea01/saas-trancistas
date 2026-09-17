using Aplicacao.Appointments.DTOs;
using Aplicacao.Comum;
using Aplicacao.Dashboard.DTOs;
using Aplicacao.Solicitacoes.DTOs;
using Dominio.Enums;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Dashboard;

public class ObterDashboardResumoCasoDeUso
{
    private readonly IAppDbContext _context;

    public ObterDashboardResumoCasoDeUso(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<RespostaResultado<DashboardResumoResposta>> ExecutarAsync(
        DateTime? dataInicio = null,
        DateTime? dataFim = null,
        CancellationToken cancellationToken = default)
    {
        // 1. Solicitações
        var querySolicitacoes = _context.SolicitacoesOrcamento
            .Include(s => s.Cliente)
            .Include(s => s.Servico)
            .Include(s => s.Respostas)
            .AsNoTracking();

        if (dataInicio.HasValue)
            querySolicitacoes = querySolicitacoes.Where(s => s.DataCriacao >= dataInicio.Value);

        if (dataFim.HasValue)
            querySolicitacoes = querySolicitacoes.Where(s => s.DataCriacao <= dataFim.Value);

        var totalSolicitacoes = await querySolicitacoes.CountAsync(cancellationToken);
        var solicitacoesAguardando = await querySolicitacoes.CountAsync(s => s.Status == StatusSolicitacaoOrcamento.AguardandoAnalise, cancellationToken);
        var solicitacoesEmAnalise = await querySolicitacoes.CountAsync(s => s.Status == StatusSolicitacaoOrcamento.EmAnalise, cancellationToken);

        // 2. Orçamentos
        var queryOrcamentos = _context.Orcamentos.AsNoTracking();

        if (dataInicio.HasValue)
            queryOrcamentos = queryOrcamentos.Where(o => o.DataCriacao >= dataInicio.Value);

        if (dataFim.HasValue)
            queryOrcamentos = queryOrcamentos.Where(o => o.DataCriacao <= dataFim.Value);

        var totalOrcamentos = await queryOrcamentos.CountAsync(cancellationToken);
        var orcamentosAceitos = await queryOrcamentos.CountAsync(o => o.Status == StatusOrcamento.Aceito, cancellationToken);
        var orcamentosRecusados = await queryOrcamentos.CountAsync(o => o.Status == StatusOrcamento.Recusado, cancellationToken);

        var taxaConversao = totalOrcamentos > 0
            ? Math.Round(((decimal)orcamentosAceitos / totalOrcamentos) * 100, 2)
            : 0m;

        // 3. Faturamento (Orçamentos aceitos)
        var orcamentosAceitosLista = await queryOrcamentos
            .Where(o => o.Status == StatusOrcamento.Aceito)
            .ToListAsync(cancellationToken);

        var faturamentoTotal = orcamentosAceitosLista.Sum(o => o.ValorFinal);
        var totalSinais = orcamentosAceitosLista.Sum(o => o.ValorSinal);
        var totalRestante = orcamentosAceitosLista.Sum(o => o.ValorRestanteNoAtendimento);

        // 4. Agendamentos
        var queryAgendamentos = _context.Agendamentos
            .Include(a => a.Cliente)
            .Include(a => a.Servico)
            .Include(a => a.Orcamento)
            .AsNoTracking();

        if (dataInicio.HasValue)
            queryAgendamentos = queryAgendamentos.Where(a => a.DataInicio >= dataInicio.Value);

        if (dataFim.HasValue)
            queryAgendamentos = queryAgendamentos.Where(a => a.DataInicio <= dataFim.Value);

        var totalAgendamentos = await queryAgendamentos.CountAsync(cancellationToken);
        var agendamentosConfirmados = await queryAgendamentos.CountAsync(a => a.Status == StatusAgendamento.Confirmado, cancellationToken);
        var agendamentosConcluidos = await queryAgendamentos.CountAsync(a => a.Status == StatusAgendamento.Concluido, cancellationToken);

        var metricas = new DashboardMetricasResposta(
            totalSolicitacoes,
            solicitacoesAguardando,
            solicitacoesEmAnalise,
            totalOrcamentos,
            orcamentosAceitos,
            orcamentosRecusados,
            taxaConversao,
            totalAgendamentos,
            agendamentosConfirmados,
            agendamentosConcluidos,
            faturamentoTotal,
            totalSinais,
            totalRestante
        );

        // 5. Próximos Agendamentos (a partir de hoje)
        var agora = DateTime.UtcNow;
        var proximosAgendamentos = await _context.Agendamentos
            .Include(a => a.Cliente)
            .Include(a => a.Servico)
            .Include(a => a.Orcamento)
            .AsNoTracking()
            .Where(a => a.DataFim >= agora && a.Status != StatusAgendamento.Cancelado)
            .OrderBy(a => a.DataInicio)
            .Take(5)
            .Select(a => new AgendamentoResposta(
                a.Id,
                a.ClienteId,
                a.Cliente != null ? a.Cliente.Nome : string.Empty,
                a.Cliente != null ? a.Cliente.Telefone : string.Empty,
                a.ServicoId,
                a.Servico != null ? a.Servico.Nome : string.Empty,
                a.Servico != null ? a.Servico.DuracaoEstimadaMinutos : 0,
                a.OrcamentoId,
                a.Orcamento != null ? a.Orcamento.ValorFinal : (decimal?)null,
                a.Orcamento != null ? a.Orcamento.ValorSinal : (decimal?)null,
                a.DataInicio,
                a.DataFim,
                a.Status,
                a.Status.ToString(),
                a.Observacoes,
                a.DataCriacao
            ))
            .ToListAsync(cancellationToken);

        // 6. Últimas Solicitações Recebidas
        var ultimasSolicitacoes = await _context.SolicitacoesOrcamento
            .Include(s => s.Cliente)
            .Include(s => s.Servico)
            .Include(s => s.Respostas)
            .AsNoTracking()
            .OrderByDescending(s => s.DataCriacao)
            .Take(5)
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

        var resumo = new DashboardResumoResposta(
            metricas,
            proximosAgendamentos,
            ultimasSolicitacoes
        );

        return RespostaResultado<DashboardResumoResposta>.Ok(resumo);
    }
}
