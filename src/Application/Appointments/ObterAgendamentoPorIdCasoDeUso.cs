using Aplicacao.Appointments.DTOs;
using Aplicacao.Comum;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Appointments;

public class ObterAgendamentoPorIdCasoDeUso
{
    private readonly IAppDbContext _context;

    public ObterAgendamentoPorIdCasoDeUso(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<RespostaResultado<AgendamentoResposta>> ExecutarAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return RespostaResultado<AgendamentoResposta>.Falha("Identificador do agendamento inválido.");

        var agendamento = await _context.Agendamentos
            .Include(a => a.Cliente)
            .Include(a => a.Servico)
            .Include(a => a.Orcamento)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

        if (agendamento == null)
            return RespostaResultado<AgendamentoResposta>.Falha("Agendamento não encontrado.");

        var resposta = new AgendamentoResposta(
            agendamento.Id,
            agendamento.ClienteId,
            agendamento.Cliente?.Nome ?? string.Empty,
            agendamento.Cliente?.Telefone ?? string.Empty,
            agendamento.ServicoId,
            agendamento.Servico?.Nome ?? string.Empty,
            agendamento.Servico?.DuracaoEstimadaMinutos ?? 0,
            agendamento.OrcamentoId,
            agendamento.Orcamento?.ValorFinal,
            agendamento.Orcamento?.ValorSinal,
            agendamento.DataInicio,
            agendamento.DataFim,
            agendamento.Status,
            agendamento.Status.ToString(),
            agendamento.Observacoes,
            agendamento.DataCriacao
        );

        return RespostaResultado<AgendamentoResposta>.Ok(resposta);
    }
}
