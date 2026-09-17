import * as React from "react";
import { LucideIcon, Sparkles } from "lucide-react";
import { Button } from "@/componentes/ui/button";
import { cn } from "@/utilitarios/cn";

interface EstadoVazioProps {
  icone?: LucideIcon;
  titulo: string;
  descricao: string;
  acaoTexto?: string;
  onAcao?: () => void;
  className?: string;
}

export function EstadoVazio({
  icone: Icone = Sparkles,
  titulo,
  descricao,
  acaoTexto,
  onAcao,
  className,
}: EstadoVazioProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border/80 bg-muted/20 animate-in fade-in-50",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        <Icone className="h-7 w-7 stroke-[1.75]" />
      </div>
      <h4 className="text-base sm:text-lg font-semibold text-foreground mb-1">
        {titulo}
      </h4>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {descricao}
      </p>
      {acaoTexto && onAcao && (
        <Button onClick={onAcao} size="sm" variant="outline">
          {acaoTexto}
        </Button>
      )}
    </div>
  );
}
