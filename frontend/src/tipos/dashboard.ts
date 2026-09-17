import { AgendamentoResposta } from "./agendamentos";
import { SolicitacaoOrcamentoResposta } from "./solicitacoes";

export interface DashboardMetricasResposta {
  totalSolicitacoes: number;
  solicitacoesAguardandoAnalise: number;
  solicitacoesEmAnalise: number;
  orcamentosEnviados: number;
  orcamentosAceitos: number;
  orcamentosRecusados: number;
  taxaConversaoPercentual: number;
  agendamentosTotal: number;
  agendamentosConfirmados: number;
  agendamentosConcluidos: number;
  faturamentoTotal: number;
  totalSinaisRecebidos: number;
  totalRestanteReceber: number;
}

export interface DashboardResumoResposta {
  metricas: DashboardMetricasResposta;
  proximosAgendamentos: AgendamentoResposta[];
  ultimasSolicitacoes: SolicitacaoOrcamentoResposta[];
}
