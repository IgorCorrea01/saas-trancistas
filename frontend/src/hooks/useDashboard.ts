import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/servicos/api/dashboardApi";
import { DashboardResumoResposta } from "@/tipos/dashboard";

export function useDashboard(dataInicio?: string, dataFim?: string) {
  return useQuery<DashboardResumoResposta>({
    queryKey: ["dashboard", dataInicio, dataFim],
    queryFn: () => dashboardApi.obterResumo(dataInicio, dataFim),
    staleTime: 1000 * 15, // 15 segundos
    refetchInterval: 20000, // Atualiza automaticamente a cada 20 segundos em segundo plano
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}
