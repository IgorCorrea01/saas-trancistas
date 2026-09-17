"use client";

import React from "react";
import Link from "next/link";
import { useAutenticacao } from "@/hooks/useAutenticacao";
import { Button } from "@/componentes/ui/button";
import { ExternalLink, Sparkles, LogOut } from "lucide-react";

export function CabecalhoPainel() {
  const { usuario, logout } = useAutenticacao();

  return (
    <header className="h-16 border-b border-border/80 bg-card/60 backdrop-blur-sm sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="md:hidden flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-bold text-sm text-foreground truncate max-w-[150px]">
            {usuario?.nomeEmpresa || "Studio Tranças"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {usuario?.slugEmpresa && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs sm:text-sm font-medium"
          >
            <Link href={`/${usuario.slugEmpresa}`} target="_blank">
              <span className="hidden sm:inline">Ver Link Público</span>
              <span className="sm:hidden">Link</span>
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
