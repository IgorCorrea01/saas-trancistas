"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utilitarios/cn";
import { LayoutDashboard, Inbox, Calendar, Sparkles, SlidersHorizontal } from "lucide-react";

export function BarraNavegacaoMobile() {
  const pathname = usePathname();

  const links = [
    {
      rotulo: "Início",
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
      rotulo: "Config",
      href: "/configuracoes",
      icone: SlidersHorizontal,
      ativo: pathname.startsWith("/configuracoes"),
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/80 pb-safe">
      <nav className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {links.map((link) => {
          const Icone = link.icone;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-medium transition-colors touch-manipulation",
                link.ativo
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-7 rounded-full mb-0.5 transition-colors",
                  link.ativo && "bg-primary/15 text-primary"
                )}
              >
                <Icone className="h-5 w-5 stroke-[2]" />
              </div>
              <span className="text-[11px] leading-tight">{link.rotulo}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
