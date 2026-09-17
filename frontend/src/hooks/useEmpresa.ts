import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { empresasApi } from "@/servicos/api/empresasApi";
import { AtualizarEmpresaRequisicao } from "@/tipos/empresa";
import { CHAVE_STORAGE_USUARIO } from "@/utilitarios/constantes";

export function useEmpresaAtual() {
  return useQuery({
    queryKey: ["empresa-atual"],
    queryFn: () => empresasApi.obterAtual(),
  });
}

export function useAtualizarEmpresa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: AtualizarEmpresaRequisicao) => empresasApi.atualizarAtual(dados),
    onSuccess: (empresaAtualizada) => {
      queryClient.invalidateQueries({ queryKey: ["empresa-atual"] });
      // Atualiza usuário salvo no localStorage se o slug/nome mudou
      if (typeof window !== "undefined") {
        const usuarioArmazenado = localStorage.getItem(CHAVE_STORAGE_USUARIO);
        if (usuarioArmazenado) {
          try {
            const usuario = JSON.parse(usuarioArmazenado);
            usuario.nomeEmpresa = empresaAtualizada.nome;
            usuario.slugEmpresa = empresaAtualizada.slug;
            localStorage.setItem(CHAVE_STORAGE_USUARIO, JSON.stringify(usuario));
          } catch {
            // ignore
          }
        }
      }
    },
  });
}
