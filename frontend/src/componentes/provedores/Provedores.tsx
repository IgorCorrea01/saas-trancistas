"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProvedorAutenticacao } from "@/contextos/AutenticacaoContexto";

export function Provedores({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30, // 30 segundos de cache ativo
            gcTime: 1000 * 60 * 10, // 10 minutos para coleta de lixo
            refetchOnWindowFocus: false, // Evita refetch agressivo no mobile
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ProvedorAutenticacao>{children}</ProvedorAutenticacao>
    </QueryClientProvider>
  );
}
