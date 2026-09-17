import React from "react";
import { Input } from "@/componentes/ui/input";
import { PerguntaServicoResposta } from "@/tipos/servicos";

interface CampoNumeroProps {
  pergunta: PerguntaServicoResposta;
  valor: string;
  onChange: (valor: string) => void;
  erro?: string;
}

export function CampoNumero({ pergunta, valor, onChange, erro }: CampoNumeroProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-foreground flex items-center justify-between">
        <span>{pergunta.enunciado}</span>
        {pergunta.obrigatoria && <span className="text-xs text-primary font-normal">* Obrigatória</span>}
      </label>

      {pergunta.descricaoAjuda && (
        <p className="text-xs text-muted-foreground">{pergunta.descricaoAjuda}</p>
      )}

      <Input
        type="number"
        placeholder="Informe um número..."
        value={valor || ""}
        onChange={(e) => onChange(e.target.value)}
        erro={!!erro}
      />

      {erro && <p className="text-xs text-destructive font-medium">{erro}</p>}
    </div>
  );
}
