export enum StatusAgendamento {
  Agendado = 1,
  Confirmado = 2,
  Concluido = 3,
  Cancelado = 4,
  NaoCompareceu = 5,
}

export interface SlotHorarioResposta {
  horarioInicio: string;
  horarioFim: string;
  horarioInicioFormatado: string;
  horarioFimFormatado: string;
  disponivel: boolean;
  motivoIndisponibilidade?: string | null;
}

export interface DisponibilidadeDiaResposta {
  data: string;
  diaSemana: string;
  servicoId: string;
  nomeServico: string;
  duracaoMinutos: number;
  slots: SlotHorarioResposta[];
}

export interface AgendamentoResposta {
  id: string;
  clienteId: string;
  nomeCliente: string;
  telefoneCliente: string;
  servicoId: string;
  nomeServico: string;
  duracaoMinutos: number;
  orcamentoId?: string | null;
  valorFinal?: number | null;
  valorSinal?: number | null;
  dataInicio: string;
  dataFim: string;
  status: StatusAgendamento;
  statusDescricao: string;
  observacoes?: string | null;
  dataCriacao: string;
}

export interface CriarAgendamentoPublicoRequisicao {
  tokenOrcamento: string;
  horarioInicio: string;
  observacoes?: string | null;
}

export interface CriarBloqueioAgendaRequisicao {
  dataInicio: string;
  dataFim: string;
  motivo: string;
}

export interface BloqueioAgendaResposta {
  id: string;
  dataInicio: string;
  dataFim: string;
  motivo: string;
  dataCriacao: string;
}

export interface AtualizarStatusAgendamentoRequisicao {
  status: StatusAgendamento;
  motivo?: string | null;
}
