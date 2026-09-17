import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { agendamentosApi } from "@/servicos/api/agendamentosApi";
import {
  CriarAgendamentoPublicoRequisicao,
  CriarBloqueioAgendaRequisicao,
  AtualizarStatusAgendamentoRequisicao,
  StatusAgendamento,
} from "@/tipos/agendamentos";

export function useDisponibilidade(
  slugEmpresa: string,
  servicoId: string,
  data?: string
) {
  return useQuery({
    queryKey: ["disponibilidade", slugEmpresa, servicoId, data],
    queryFn: () =>
      agendamentosApi.consultarDisponibilidade(slugEmpresa, servicoId, data),
    enabled: !!slugEmpresa && !!servicoId,
  });
}

export function useCriarAgendamentoPublico() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: CriarAgendamentoPublicoRequisicao) =>
      agendamentosApi.criarPublico(dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disponibilidade"] });
      queryClient.invalidateQueries({ queryKey: ["agendamentos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useAgendamentos(filtros?: {
  dataInicio?: string;
  dataFim?: string;
  status?: StatusAgendamento;
}) {
  return useQuery({
    queryKey: ["agendamentos", filtros?.dataInicio, filtros?.dataFim, filtros?.status],
    queryFn: () => agendamentosApi.listar(filtros),
    staleTime: 1000 * 15,
    refetchInterval: 20000, // Atualiza agenda a cada 20 segundos
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

export function useAgendamento(id: string) {
  return useQuery({
    queryKey: ["agendamento-detalhes", id],
    queryFn: () => agendamentosApi.obterPorId(id),
    enabled: !!id,
    staleTime: 1000 * 15,
    refetchInterval: 20000,
  });
}

export function useAtualizarStatusAgendamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      dados,
    }: {
      id: string;
      dados: AtualizarStatusAgendamentoRequisicao;
    }) => agendamentosApi.atualizarStatus(id, dados),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos"] });
      queryClient.invalidateQueries({
        queryKey: ["agendamento-detalhes", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["disponibilidade"] });
    },
  });
}

export function useBloqueios(filtros?: {
  dataInicio?: string;
  dataFim?: string;
}) {
  return useQuery({
    queryKey: ["bloqueios-agenda", filtros?.dataInicio, filtros?.dataFim],
    queryFn: () => agendamentosApi.listarBloqueios(filtros),
    staleTime: 1000 * 15,
    refetchInterval: 20000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

export function useCriarBloqueio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: CriarBloqueioAgendaRequisicao) =>
      agendamentosApi.criarBloqueio(dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bloqueios-agenda"] });
      queryClient.invalidateQueries({ queryKey: ["disponibilidade"] });
    },
  });
}

export function useRemoverBloqueio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => agendamentosApi.removerBloqueio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bloqueios-agenda"] });
      queryClient.invalidateQueries({ queryKey: ["disponibilidade"] });
    },
  });
}
