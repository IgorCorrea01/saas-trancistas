using Aplicacao.Appointments.DTOs;
using Aplicacao.Comum;
using Dominio.Enums;
using Microsoft.EntityFrameworkCore;

namespace Aplicacao.Appointments;

public class AtualizarStatusAgendamentoCasoDeUso
{
    private readonly IAppDbContext _context;

    public AtualizarStatusAgendamentoCasoDeUso(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<RespostaResultado<AgendamentoResposta>> ExecutarAsync(
        Guid id,
        AtualizarStatusAgendamentoRequisicao requisicao,
        CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return RespostaResultado<AgendamentoResposta>.Falha("Identificador do agendamento inválido.");

        if (requisicao == null)
            return RespostaResultado<AgendamentoResposta>.Falha("Dados da requisição inválidos.");

        var agendamento = await _context.Agendamentos
            .Include(a => a.Cliente)
            .Include(a => a.Servico)
            .Include(a => a.Orcamento)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

        if (agendamento == null)
            return RespostaResultado<AgendamentoResposta>.Falha("Agendamento não encontrado.");

        switch (requisicao.Status)
        {
            case StatusAgendamento.Confirmado:
                agendamento.Confirmar();
                break;
            case StatusAgendamento.Concluido:
                agendamento.Concluir();
                break;
            case StatusAgendamento.Cancelado:
                agendamento.Cancelar(requisicao.Motivo);
                break;
            case StatusAgendamento.NaoCompareceu:
                agendamento.MarcarNaoCompareceu();
                break;
            default:
                return RespostaResultado<AgendamentoResposta>.Falha("Transição de status inválida.");
        }

        await _context.SaveChangesAsync(cancellationToken);

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

        return RespostaResultado<AgendamentoResposta>.Ok(resposta, $"Status do agendamento atualizado para '{requisicao.Status}'.");
    }
}
