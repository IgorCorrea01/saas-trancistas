import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { solicitacoesApi } from "@/servicos/api/solicitacoesApi";
import { StatusSolicitacaoOrcamento } from "@/tipos/solicitacoes";

export function useSolicitacoes(status?: StatusSolicitacaoOrcamento) {
  return useQuery({
    queryKey: ["solicitacoes", status],
    queryFn: () => solicitacoesApi.listar(status),
    staleTime: 1000 * 15,
    refetchInterval: 20000, // Atualiza solicitações a cada 20 segundos
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

export function useSolicitacaoDetalhes(id: string) {
  return useQuery({
    queryKey: ["solicitacao-detalhes", id],
    queryFn: () => solicitacoesApi.obterPorId(id),
    enabled: !!id,
    staleTime: 1000 * 15,
    refetchInterval: 20000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

export function useCriarSolicitacaoPublica(slugEmpresa: string) {
  return useMutation({
    mutationFn: (formData: FormData) =>
      solicitacoesApi.criarPublico(slugEmpresa, formData),
  });
}

export function useAtualizarStatusSolicitacao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: StatusSolicitacaoOrcamento;
    }) => solicitacoesApi.atualizarStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["solicitacoes"] });
      queryClient.invalidateQueries({ queryKey: ["solicitacao-detalhes", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
