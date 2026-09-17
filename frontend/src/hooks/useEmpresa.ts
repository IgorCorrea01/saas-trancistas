import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { empresasApi } from "@/servicos/api/empresasApi";
import { AtualizarEmpresaRequisicao } from "@/tipos/empresa";

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
      const usuarioArmazenado = localStorage.getItem("@trancas:usuario");
      if (usuarioArmazenado) {
        try {
          const usuario = JSON.parse(usuarioArmazenado);
          usuario.empresaNome = empresaAtualizada.nome;
          usuario.empresaSlug = empresaAtualizada.slug;
          localStorage.setItem("@trancas:usuario", JSON.stringify(usuario));
        } catch {
          // ignore
        }
      }
    },
  });
}
