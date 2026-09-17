"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAutenticacao } from "@/hooks/useAutenticacao";
import { Skeleton } from "@/componentes/ui/skeleton";

export function RotaProtegida({ children }: { children: React.ReactNode }) {
  const { estaAutenticado, carregando } = useAutenticacao();
  const router = useRouter();

  useEffect(() => {
    if (!carregando && !estaAutenticado) {
      router.push("/login");
    }
  }, [estaAutenticado, carregando, router]);

  if (carregando) {
    return (
      <div className="min-h-screen flex flex-col p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-14 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!estaAutenticado) {
    return null;
  }

  return <>{children}</>;
}
