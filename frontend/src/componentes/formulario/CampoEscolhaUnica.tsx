import React from "react";
import { PerguntaServicoResposta } from "@/tipos/servicos";
import { cn } from "@/utilitarios/cn";
import { Check } from "lucide-react";

interface CampoEscolhaUnicaProps {
  pergunta: PerguntaServicoResposta;
  opcaoSelecionadaId?: string;
  onChange: (opcaoId: string) => void;
  erro?: string;
}

export function CampoEscolhaUnica({
  pergunta,
  opcaoSelecionadaId,
  onChange,
  erro,
}: CampoEscolhaUnicaProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground flex items-center justify-between">
        <span>{pergunta.enunciado}</span>
        {pergunta.obrigatoria && <span className="text-xs text-primary font-normal">* Obrigatória</span>}
      </label>

      {pergunta.descricaoAjuda && (
        <p className="text-xs text-muted-foreground">{pergunta.descricaoAjuda}</p>
      )}

      <div className="space-y-2">
        {pergunta.opcoes.map((opcao) => {
          const selecionada = opcaoSelecionadaId === opcao.id;
          return (
            <button
              key={opcao.id}
              type="button"
              onClick={() => onChange(opcao.id)}
              className={cn(
                "w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-sm font-medium transition-all active:scale-[0.99] touch-manipulation",
                selecionada
                  ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs"
                  : "border-border/80 bg-card text-foreground hover:bg-muted/40"
              )}
            >
              <span>{opcao.texto}</span>
              <div
                className={cn(
                  "h-5 w-5 rounded-full border flex items-center justify-center transition-colors shrink-0",
                  selecionada
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/40 bg-background"
                )}
              >
                {selecionada && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>

      {erro && <p className="text-xs text-destructive font-medium">{erro}</p>}
    </div>
  );
}
