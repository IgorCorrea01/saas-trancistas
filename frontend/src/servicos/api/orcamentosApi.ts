import { clienteApi } from "./clienteApi";
import {
  OrcamentoResposta,
  OrcamentoPublicoResposta,
  CriarOrcamentoRequisicao,
} from "@/tipos/orcamentos";

export const orcamentosApi = {
  // Endpoints Autenticados (Painel da Profissional)
  async criar(dados: CriarOrcamentoRequisicao): Promise<OrcamentoResposta> {
    const resposta = await clienteApi.post<OrcamentoResposta>("/api/orcamentos", dados);
    return resposta.data;
  },

  async obterPorId(id: string): Promise<OrcamentoResposta> {
    const resposta = await clienteApi.get<OrcamentoResposta>(`/api/orcamentos/${id}`);
    return resposta.data;
  },

  async obterPorSolicitacaoId(solicitacaoId: string): Promise<OrcamentoResposta> {
    const resposta = await clienteApi.get<OrcamentoResposta>(
      `/api/orcamentos/solicitacao/${solicitacaoId}`
    );
    return resposta.data;
  },

  // Endpoints Públicos (Cliente)
  async obterPublicoPorToken(token: string): Promise<OrcamentoPublicoResposta> {
    const resposta = await clienteApi.get<OrcamentoPublicoResposta>(
      `/api/publico/orcamentos/${token}`
    );
    return resposta.data;
  },

  async aceitarPublico(token: string): Promise<OrcamentoResposta> {
    const resposta = await clienteApi.post<OrcamentoResposta>(
      `/api/publico/orcamentos/${token}/aceitar`
    );
    return resposta.data;
  },

  async recusarPublico(token: string): Promise<OrcamentoResposta> {
    const resposta = await clienteApi.post<OrcamentoResposta>(
      `/api/publico/orcamentos/${token}/recusar`
    );
    return resposta.data;
  },
};
