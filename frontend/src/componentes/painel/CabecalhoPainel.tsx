"use client";

import React from "react";
import Link from "next/link";
import { useAutenticacao } from "@/hooks/useAutenticacao";
import { useEmpresaAtual } from "@/hooks/useEmpresa";
import { Button } from "@/componentes/ui/button";
import { ExternalLink, Sparkles, LogOut } from "lucide-react";

export function CabecalhoPainel() {
  const { usuario, logout } = useAutenticacao();
  const { data: empresa } = useEmpresaAtual();

  const slugExibicao = empresa?.slug || usuario?.slugEmpresa;
  const nomeStudioExibicao = empresa?.nome || usuario?.nomeEmpresa || "Studio de Tranças";

  return (
    <header className="h-16 border-b border-border/80 bg-card/60 backdrop-blur-sm sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-foreground truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {nomeStudioExibicao}
            </span>
            <span className="text-[10px] text-muted-foreground hidden sm:block">
              Painel TrançaFlow
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {slugExibicao && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs sm:text-sm font-medium"
          >
            <Link href={`/${slugExibicao}`} target="_blank">
              <span className="hidden sm:inline">Ver Catálogo</span>
              <span className="sm:hidden">Catálogo</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="md:hidden h-9 px-2 text-muted-foreground hover:text-destructive"
          title="Sair"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
