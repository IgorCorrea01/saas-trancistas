import { clienteApi } from "./clienteApi";
import { DashboardResumoResposta } from "@/tipos/dashboard";

export const dashboardApi = {
  async obterResumo(dataInicio?: string, dataFim?: string): Promise<DashboardResumoResposta> {
    const params = new URLSearchParams();
    if (dataInicio) params.append("dataInicio", dataInicio);
    if (dataFim) params.append("dataFim", dataFim);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const resposta = await clienteApi.get<DashboardResumoResposta>(`/api/dashboard${queryString}`);
    return resposta.data;
  },
};
