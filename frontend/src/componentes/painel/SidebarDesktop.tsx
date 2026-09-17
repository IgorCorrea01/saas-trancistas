"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAutenticacao } from "@/hooks/useAutenticacao";
import { usePerfilProfissional } from "@/hooks/usePerfilProfissional";
import { cn } from "@/utilitarios/cn";
import {
  LayoutDashboard,
  Inbox,
  Calendar,
  Sparkles,
  ExternalLink,
  LogOut,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/componentes/ui/button";

export function SidebarDesktop() {
  const pathname = usePathname();
  const { usuario, logout } = useAutenticacao();
  const { perfil } = usePerfilProfissional();

  const nomeExibicao = perfil.nome || usuario?.nome || "Profissional";
  const studioExibicao = perfil.nomeStudio || usuario?.nomeEmpresa || "Studio Tranças";
  const slugExibicao = perfil.slug || usuario?.slugEmpresa || "meu-studio";

  const links = [
    {
      rotulo: "Dashboard",
      href: "/dashboard",
      icone: LayoutDashboard,
      ativo: pathname === "/dashboard",
    },
    {
      rotulo: "Solicitações",
      href: "/solicitacoes",
      icone: Inbox,
      ativo: pathname.startsWith("/solicitacoes"),
    },
    {
      rotulo: "Agenda",
      href: "/agenda",
      icone: Calendar,
      ativo: pathname.startsWith("/agenda"),
    },
    {
      rotulo: "Serviços",
      href: "/servicos",
      icone: Sparkles,
      ativo: pathname.startsWith("/servicos"),
    },
    {
      rotulo: "Configurações",
      href: "/configuracoes",
      icone: SlidersHorizontal,
      ativo: pathname.startsWith("/configuracoes"),
    },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-card border-r border-border/80 z-30">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-sm tracking-tight text-foreground truncate">
              {studioExibicao}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              Painel Profissional
            </span>
          </div>
        </div>
      </div>

      {/* Links de Navegação */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icone = link.icone;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                link.ativo
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icone className="h-4 w-4 shrink-0" />
              <span>{link.rotulo}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer com Link Público e Perfil da Profissional */}
      <div className="p-4 border-t border-border/60 space-y-3">
        {slugExibicao && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full justify-between text-xs h-9 bg-card hover:bg-muted"
          >
            <Link href={`/${slugExibicao}`} target="_blank">
              <span>Meu Link Público</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </Button>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 overflow-hidden pr-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0">
              {perfil.fotoPerfil ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={perfil.fotoPerfil}
                  alt={nomeExibicao}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-foreground">
                  {nomeExibicao.charAt(0)}
                </span>
              )}
            </div>

            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-foreground truncate">
                {nomeExibicao}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {usuario?.email}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
            title="Sair do painel"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
