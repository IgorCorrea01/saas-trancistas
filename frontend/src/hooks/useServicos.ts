import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { servicosApi } from "@/servicos/api/servicosApi";
import {
  CriarServicoRequisicao,
  AtualizarServicoRequisicao,
  ConfigurarFormularioRequisicao,
} from "@/tipos/servicos";

export function useCatalogoPublico(slugEmpresa: string) {
  return useQuery({
    queryKey: ["catalogo-publico", slugEmpresa],
    queryFn: () => servicosApi.listarPublicoPorSlug(slugEmpresa),
    enabled: !!slugEmpresa,
    staleTime: 1000 * 60 * 5, // 5 minutos de cache no catálogo da cliente
  });
}

export function useServicoPublicoDetalhes(slugEmpresa: string, id: string) {
  return useQuery({
    queryKey: ["servico-publico-detalhes", slugEmpresa, id],
    queryFn: () => servicosApi.obterServicoPublico(slugEmpresa, id),
    enabled: !!slugEmpresa && !!id,
  });
}

export function useServicos(apenasAtivos?: boolean) {
  return useQuery({
    queryKey: ["servicos", apenasAtivos],
    queryFn: () => servicosApi.listarAutenticado(apenasAtivos),
  });
}

export function useServicoDetalhes(id: string) {
  return useQuery({
    queryKey: ["servico-detalhes", id],
    queryFn: () => servicosApi.obterPorId(id),
    enabled: !!id,
  });
}

export function useCriarServico() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: CriarServicoRequisicao) => servicosApi.criar(dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useAtualizarServico() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: AtualizarServicoRequisicao }) =>
      servicosApi.atualizar(id, dados),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["servicos"] });
      queryClient.invalidateQueries({ queryKey: ["servico-detalhes", variables.id] });
    },
  });
}

export function useAlternarStatusServico() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) =>
      servicosApi.alternarStatus(id, ativo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicos"] });
    },
  });
}

export function useRemoverServico() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => servicosApi.remover(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicos"] });
    },
  });
}

export function useConfigurarFormulario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      dados,
    }: {
      id: string;
      dados: ConfigurarFormularioRequisicao;
    }) => servicosApi.configurarFormulario(id, dados),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["servicos"] });
      queryClient.invalidateQueries({ queryKey: ["servico-detalhes", variables.id] });
    },
  });
}

export function useGerarCatalogoPadrao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => servicosApi.gerarCatalogoPadrao(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
