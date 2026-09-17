using Dominio.Enums;

namespace Aplicacao.Appointments.DTOs;

public record SlotHorarioResposta(
    DateTime HorarioInicio,
    DateTime HorarioFim,
    string HorarioInicioFormatado,
    string HorarioFimFormatado,
    bool Disponivel,
    string? MotivoIndisponibilidade
);

public record DisponibilidadeDiaResposta(
    DateOnly Data,
    string DiaSemana,
    Guid ServicoId,
    string NomeServico,
    int DuracaoMinutos,
    IReadOnlyList<SlotHorarioResposta> Slots
);

public record CriarAgendamentoPublicoRequisicao(
    string TokenOrcamento,
    DateTime HorarioInicio,
    string? Observacoes
);

public record AgendamentoResposta(
    Guid Id,
    Guid ClienteId,
    string NomeCliente,
    string TelefoneCliente,
    Guid ServicoId,
    string NomeServico,
    int DuracaoMinutos,
    Guid? OrcamentoId,
    decimal? ValorFinal,
    decimal? ValorSinal,
    DateTime DataInicio,
    DateTime DataFim,
    StatusAgendamento Status,
    string StatusDescricao,
    string? Observacoes,
    DateTime DataCriacao
);

public record CriarBloqueioAgendaRequisicao(
    DateTime DataInicio,
    DateTime DataFim,
    string Motivo
);

public record BloqueioAgendaResposta(
    Guid Id,
    DateTime DataInicio,
    DateTime DataFim,
    string Motivo,
    DateTime DataCriacao
);

public record AtualizarStatusAgendamentoRequisicao(
    StatusAgendamento Status,
    string? Motivo
);
