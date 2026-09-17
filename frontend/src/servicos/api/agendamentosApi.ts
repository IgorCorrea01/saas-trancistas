import { clienteApi } from "./clienteApi";
import {
  DisponibilidadeDiaResposta,
  CriarAgendamentoPublicoRequisicao,
  AgendamentoResposta,
  CriarBloqueioAgendaRequisicao,
  BloqueioAgendaResposta,
  AtualizarStatusAgendamentoRequisicao,
  StatusAgendamento,
} from "@/tipos/agendamentos";

export const agendamentosApi = {
  // Endpoints Públicos (Cliente)
  async consultarDisponibilidade(
    slugEmpresa: string,
    servicoId: string,
    data?: string
  ): Promise<DisponibilidadeDiaResposta> {
    const params = new URLSearchParams();
    params.append("servicoId", servicoId);
    if (data) {
      params.append("data", data);
    }
    const resposta = await clienteApi.get<DisponibilidadeDiaResposta>(
      `/api/publico/${slugEmpresa}/agenda/disponibilidade?${params.toString()}`
    );
    return resposta.data;
  },

  async criarPublico(
    dados: CriarAgendamentoPublicoRequisicao
  ): Promise<AgendamentoResposta> {
    const resposta = await clienteApi.post<AgendamentoResposta>(
      "/api/publico/agendamentos",
      dados
    );
    return resposta.data;
  },

  // Endpoints Autenticados (Painel da Profissional)
  async listar(filtros?: {
    dataInicio?: string;
    dataFim?: string;
    status?: StatusAgendamento;
  }): Promise<AgendamentoResposta[]> {
    const params = new URLSearchParams();
    if (filtros?.dataInicio) params.append("dataInicio", filtros.dataInicio);
    if (filtros?.dataFim) params.append("dataFim", filtros.dataFim);
    if (filtros?.status !== undefined) params.append("status", filtros.status.toString());

    const qs = params.toString();
    const url = qs ? `/api/agendamentos?${qs}` : "/api/agendamentos";
    const resposta = await clienteApi.get<AgendamentoResposta[]>(url);
    return resposta.data;
  },

  async obterPorId(id: string): Promise<AgendamentoResposta> {
    const resposta = await clienteApi.get<AgendamentoResposta>(`/api/agendamentos/${id}`);
    return resposta.data;
  },

  async atualizarStatus(
    id: string,
    dados: AtualizarStatusAgendamentoRequisicao
  ): Promise<AgendamentoResposta> {
    const resposta = await clienteApi.patch<AgendamentoResposta>(
      `/api/agendamentos/${id}/status`,
      dados
    );
    return resposta.data;
  },

  // Bloqueios de Agenda
  async listarBloqueios(filtros?: {
    dataInicio?: string;
    dataFim?: string;
  }): Promise<BloqueioAgendaResposta[]> {
    const params = new URLSearchParams();
    if (filtros?.dataInicio) params.append("dataInicio", filtros.dataInicio);
    if (filtros?.dataFim) params.append("dataFim", filtros.dataFim);

    const qs = params.toString();
    const url = qs ? `/api/bloqueios-agenda?${qs}` : "/api/bloqueios-agenda";
    const resposta = await clienteApi.get<BloqueioAgendaResposta[]>(url);
    return resposta.data;
  },

  async criarBloqueio(
    dados: CriarBloqueioAgendaRequisicao
  ): Promise<BloqueioAgendaResposta> {
    const resposta = await clienteApi.post<BloqueioAgendaResposta>(
      "/api/bloqueios-agenda",
      dados
    );
    return resposta.data;
  },

  async removerBloqueio(id: string): Promise<void> {
    await clienteApi.delete(`/api/bloqueios-agenda/${id}`);
  },
};
