import React from "react";
import { PerguntaServicoResposta } from "@/tipos/servicos";
import { cn } from "@/utilitarios/cn";
import { Check, X } from "lucide-react";

interface CampoSimNaoProps {
  pergunta: PerguntaServicoResposta;
  valor?: string; // "Sim" ou "Não"
  onChange: (valor: string) => void;
  erro?: string;
}

export function CampoSimNao({ pergunta, valor, onChange, erro }: CampoSimNaoProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground flex items-center justify-between">
        <span>{pergunta.enunciado}</span>
        {pergunta.obrigatoria && <span className="text-xs text-primary font-normal">* Obrigatória</span>}
      </label>

      {pergunta.descricaoAjuda && (
        <p className="text-xs text-muted-foreground">{pergunta.descricaoAjuda}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange("Sim")}
          className={cn(
            "flex items-center justify-center gap-2 h-12 rounded-xl border text-sm font-semibold transition-all active:scale-[0.99] touch-manipulation",
            valor === "Sim"
              ? "border-primary bg-primary/10 text-primary shadow-xs"
              : "border-border/80 bg-card text-foreground hover:bg-muted/40"
          )}
        >
          <Check className="h-4 w-4" />
          <span>Sim</span>
        </button>

        <button
          type="button"
          onClick={() => onChange("Não")}
          className={cn(
            "flex items-center justify-center gap-2 h-12 rounded-xl border text-sm font-semibold transition-all active:scale-[0.99] touch-manipulation",
            valor === "Não"
              ? "border-primary bg-primary/10 text-primary shadow-xs"
              : "border-border/80 bg-card text-foreground hover:bg-muted/40"
          )}
        >
          <X className="h-4 w-4" />
          <span>Não</span>
        </button>
      </div>

      {erro && <p className="text-xs text-destructive font-medium">{erro}</p>}
    </div>
  );
}
