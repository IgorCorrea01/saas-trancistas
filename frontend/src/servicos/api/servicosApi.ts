import { clienteApi } from "./clienteApi";
import {
  ServicoResposta,
  ServicoDetalhesResposta,
  CriarServicoRequisicao,
  AtualizarServicoRequisicao,
  ConfigurarFormularioRequisicao,
} from "@/tipos/servicos";

export const servicosApi = {
  // Endpoints Públicos
  async listarPublicoPorSlug(slugEmpresa: string): Promise<ServicoDetalhesResposta[]> {
    const resposta = await clienteApi.get<ServicoDetalhesResposta[]>(
      `/api/publico/${slugEmpresa}/servicos`
    );
    return resposta.data;
  },

  async obterServicoPublico(
    slugEmpresa: string,
    id: string
  ): Promise<ServicoDetalhesResposta> {
    const resposta = await clienteApi.get<ServicoDetalhesResposta>(
      `/api/publico/${slugEmpresa}/servicos/${id}`
    );
    return resposta.data;
  },

  // Endpoints Autenticados (Painel da Profissional)
  async listarAutenticado(apenasAtivos?: boolean): Promise<ServicoResposta[]> {
    const params = new URLSearchParams();
    if (apenasAtivos !== undefined) {
      params.append("apenasAtivos", String(apenasAtivos));
    }
    const queryString = params.toString() ? `?${params.toString()}` : "";
    const resposta = await clienteApi.get<ServicoResposta[]>(`/api/servicos${queryString}`);
    return resposta.data;
  },

  async obterPorId(id: string): Promise<ServicoDetalhesResposta> {
    const resposta = await clienteApi.get<ServicoDetalhesResposta>(`/api/servicos/${id}`);
    return resposta.data;
  },

  async criar(dados: CriarServicoRequisicao): Promise<ServicoResposta> {
    const resposta = await clienteApi.post<ServicoResposta>("/api/servicos", dados);
    return resposta.data;
  },

  async atualizar(id: string, dados: AtualizarServicoRequisicao): Promise<ServicoResposta> {
    const resposta = await clienteApi.put<ServicoResposta>(`/api/servicos/${id}`, dados);
    return resposta.data;
  },

  async alternarStatus(id: string, ativo: boolean): Promise<ServicoResposta> {
    const resposta = await clienteApi.patch<ServicoResposta>(`/api/servicos/${id}/status`, {
      ativo,
    });
    return resposta.data;
  },

  async remover(id: string): Promise<void> {
    await clienteApi.delete(`/api/servicos/${id}`);
  },

  async configurarFormulario(
    id: string,
    dados: ConfigurarFormularioRequisicao
  ): Promise<ServicoDetalhesResposta> {
    const resposta = await clienteApi.put<ServicoDetalhesResposta>(
      `/api/servicos/${id}/formulario`,
      dados
    );
    return resposta.data;
  },

  async gerarCatalogoPadrao(): Promise<ServicoDetalhesResposta[]> {
    const resposta = await clienteApi.post<ServicoDetalhesResposta[]>(
      "/api/servicos/gerar-padrao"
    );
    return resposta.data;
  },
};
