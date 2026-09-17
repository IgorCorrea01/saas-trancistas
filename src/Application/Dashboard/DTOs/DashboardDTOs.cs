using Aplicacao.Appointments.DTOs;
using Aplicacao.Solicitacoes.DTOs;

namespace Aplicacao.Dashboard.DTOs;

public record DashboardMetricasResposta(
    int TotalSolicitacoes,
    int SolicitacoesAguardandoAnalise,
    int SolicitacoesEmAnalise,
    int OrcamentosEnviados,
    int OrcamentosAceitos,
    int OrcamentosRecusados,
    decimal TaxaConversaoPercentual,
    int AgendamentosTotal,
    int AgendamentosConfirmados,
    int AgendamentosConcluidos,
    decimal FaturamentoTotal,
    decimal TotalSinaisRecebidos,
    decimal TotalRestanteReceber
);

public record DashboardResumoResposta(
    DashboardMetricasResposta Metricas,
    IReadOnlyList<AgendamentoResposta> ProximosAgendamentos,
    IReadOnlyList<SolicitacaoOrcamentoResposta> UltimasSolicitacoes
);
