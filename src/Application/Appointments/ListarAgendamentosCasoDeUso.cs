using Aplicacao.Appointments.DTOs;
using Aplicacao.Comum;
using Dominio.Enums;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Appointments;

public class ListarAgendamentosCasoDeUso
{
    private readonly IAppDbContext _context;

    public ListarAgendamentosCasoDeUso(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<RespostaResultado<IReadOnlyList<AgendamentoResposta>>> ExecutarAsync(
        DateTime? dataInicio = null,
        DateTime? dataFim = null,
        StatusAgendamento? status = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Agendamentos
            .Include(a => a.Cliente)
            .Include(a => a.Servico)
            .Include(a => a.Orcamento)
            .AsNoTracking();

        if (dataInicio.HasValue)
        {
            query = query.Where(a => a.DataInicio >= dataInicio.Value);
        }

        if (dataFim.HasValue)
        {
            query = query.Where(a => a.DataFim <= dataFim.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(a => a.Status == status.Value);
        }

        var agendamentos = await query
            .OrderBy(a => a.DataInicio)
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

        return RespostaResultado<IReadOnlyList<AgendamentoResposta>>.Ok(agendamentos);
    }
}
