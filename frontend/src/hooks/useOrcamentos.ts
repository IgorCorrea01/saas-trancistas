import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orcamentosApi } from "@/servicos/api/orcamentosApi";
import { CriarOrcamentoRequisicao } from "@/tipos/orcamentos";

export function useOrcamentoPorSolicitacao(solicitacaoId: string) {
  return useQuery({
    queryKey: ["orcamento-solicitacao", solicitacaoId],
    queryFn: () => orcamentosApi.obterPorSolicitacaoId(solicitacaoId),
    enabled: !!solicitacaoId,
    retry: false, // Se não tiver orçamento gerado ainda, 404 é esperado
  });
}

export function useOrcamentoPublico(token: string) {
  return useQuery({
    queryKey: ["orcamento-publico", token],
    queryFn: () => orcamentosApi.obterPublicoPorToken(token),
    enabled: !!token,
  });
}

export function useCriarOrcamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: CriarOrcamentoRequisicao) => orcamentosApi.criar(dados),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["solicitacoes"] });
      queryClient.invalidateQueries({ queryKey: ["solicitacao-detalhes", variables.solicitacaoOrcamentoId] });
      queryClient.invalidateQueries({ queryKey: ["orcamento-solicitacao", variables.solicitacaoOrcamentoId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useAceitarOrcamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => orcamentosApi.aceitarPublico(token),
    onSuccess: (_, token) => {
      queryClient.invalidateQueries({ queryKey: ["orcamento-publico", token] });
    },
  });
}

export function useRecusarOrcamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => orcamentosApi.recusarPublico(token),
    onSuccess: (_, token) => {
      queryClient.invalidateQueries({ queryKey: ["orcamento-publico", token] });
    },
  });
}
