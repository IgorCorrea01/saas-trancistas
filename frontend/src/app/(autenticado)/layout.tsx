import React from "react";
import { RotaProtegida } from "@/componentes/painel/RotaProtegida";
import { SidebarDesktop } from "@/componentes/painel/SidebarDesktop";
import { BarraNavegacaoMobile } from "@/componentes/painel/BarraNavegacaoMobile";
import { CabecalhoPainel } from "@/componentes/painel/CabecalhoPainel";

export default function LayoutAutenticado({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RotaProtegida>
      <div className="min-h-screen flex bg-background text-foreground">
        {/* Sidebar Desktop */}
        <SidebarDesktop />

        {/* Conteúdo Principal */}
        <div className="flex-1 flex flex-col md:pl-64 min-w-0 pb-20 md:pb-8">
          <CabecalhoPainel />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
            {children}
          </main>
        </div>

        {/* Barra Inferior Mobile */}
        <BarraNavegacaoMobile />
      </div>
    </RotaProtegida>
  );
}
