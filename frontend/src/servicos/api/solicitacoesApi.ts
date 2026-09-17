import { clienteApi } from "./clienteApi";
import {
  SolicitacaoOrcamentoResposta,
  SolicitacaoOrcamentoDetalhesResposta,
  StatusSolicitacaoOrcamento,
} from "@/tipos/solicitacoes";

export const solicitacoesApi = {
  // Endpoint Público: Envio da solicitação com fotos via Multipart/Form-Data
  async criarPublico(
    slugEmpresa: string,
    formData: FormData
  ): Promise<SolicitacaoOrcamentoResposta> {
    const resposta = await clienteApi.post<SolicitacaoOrcamentoResposta>(
      `/api/publico/${slugEmpresa}/solicitacoes`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return resposta.data;
  },

  // Endpoints Autenticados (Painel da Profissional)
  async listar(status?: StatusSolicitacaoOrcamento): Promise<SolicitacaoOrcamentoResposta[]> {
    const params = new URLSearchParams();
    if (status !== undefined) {
      params.append("status", String(status));
    }
    const queryString = params.toString() ? `?${params.toString()}` : "";
    const resposta = await clienteApi.get<SolicitacaoOrcamentoResposta[]>(
      `/api/solicitacoes-orcamento${queryString}`
    );
    return resposta.data;
  },

  async obterPorId(id: string): Promise<SolicitacaoOrcamentoDetalhesResposta> {
    const resposta = await clienteApi.get<SolicitacaoOrcamentoDetalhesResposta>(
      `/api/solicitacoes-orcamento/${id}`
    );
    return resposta.data;
  },

  async atualizarStatus(
    id: string,
    status: StatusSolicitacaoOrcamento
  ): Promise<{ mensagem: string }> {
    const resposta = await clienteApi.patch<{ mensagem: string }>(
      `/api/solicitacoes-orcamento/${id}/status`,
      { status }
    );
    return resposta.data;
  },
};
