import { clienteApi } from "./clienteApi";
import { EmpresaResposta, AtualizarEmpresaRequisicao } from "@/tipos/empresa";

export const empresasApi = {
  async obterAtual(): Promise<EmpresaResposta> {
    const resposta = await clienteApi.get<EmpresaResposta>("/api/Empresas/atual");
    return resposta.data;
  },

  async atualizarAtual(dados: AtualizarEmpresaRequisicao): Promise<EmpresaResposta> {
    const resposta = await clienteApi.put<EmpresaResposta>("/api/Empresas/atual", dados);
    return resposta.data;
  },
};
