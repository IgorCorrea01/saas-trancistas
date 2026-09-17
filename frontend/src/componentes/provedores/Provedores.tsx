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
            staleTime: 1000 * 60 * 2, // 2 minutos de cache
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
