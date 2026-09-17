import React from "react";
import { Input } from "@/componentes/ui/input";
import { PerguntaServicoResposta } from "@/tipos/servicos";

interface CampoTextoProps {
  pergunta: PerguntaServicoResposta;
  valor: string;
  onChange: (valor: string) => void;
  erro?: string;
}

export function CampoTexto({ pergunta, valor, onChange, erro }: CampoTextoProps) {
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
        type="text"
        placeholder="Digite sua resposta..."
        value={valor || ""}
        onChange={(e) => onChange(e.target.value)}
        erro={!!erro}
      />

      {erro && <p className="text-xs text-destructive font-medium">{erro}</p>}
    </div>
  );
}
