"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/componentes/ui/dialog";
import { Button } from "@/componentes/ui/button";
import { Badge } from "@/componentes/ui/badge";
import { useModelosWhatsApp } from "@/hooks/useModelosWhatsApp";
import { usePerfilProfissional } from "@/hooks/usePerfilProfissional";
import { formatarMoeda, formatarData, formatarHora, limparTelefone } from "@/utilitarios/formatadores";
import {
  MessageCircle,
  Bell,
  MapPin,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  Send,
} from "lucide-react";

export interface DadosAgendamentoWhatsApp {
  id?: string | null;
  nomeCliente: string;
  telefoneCliente: string;
  nomeServico: string;
  dataInicio: string;
  dataFim?: string | null;
  valorSinal?: number | null;
  valorFinal?: number | null;
  valorRestante?: number | null;
  tokenOrcamento?: string | null;
}

interface ModalAcoesWhatsAppProps {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  agendamento: DadosAgendamentoWhatsApp | null;
}

export function ModalAcoesWhatsApp({
  aberto,
  onOpenChange,
  agendamento,
}: ModalAcoesWhatsAppProps) {
  const { formatarMensagem } = useModelosWhatsApp();
  const { perfil } = usePerfilProfissional();

  const [abaSelecionada, setAbaSelecionada] = useState<
    "lembrete24h" | "comoChegar" | "cuidadosPosTranca" | "retornoManutencao"
  >("lembrete24h");

  const [textoEditavel, setTextoEditavel] = useState("");
  const [copiado, setCopiado] = useState(false);

  React.useEffect(() => {
    if (agendamento && aberto) {
      const dataFormatada = formatarData(agendamento.dataInicio);
      const horaFormatada = formatarHora(agendamento.dataInicio);
      const saldoRestante =
        agendamento.valorRestante !== undefined
          ? formatarMoeda(agendamento.valorRestante)
          : agendamento.valorFinal && agendamento.valorSinal
          ? formatarMoeda(Math.max(0, agendamento.valorFinal - agendamento.valorSinal))
          : "R$ 0,00";

      const urlCatalogo =
        typeof window !== "undefined"
          ? `${window.location.origin}/${perfil.slug || "meu-studio"}`
          : "";

      const msg = formatarMensagem(abaSelecionada, {
        nomeCliente: agendamento.nomeCliente,
        nomeStudio: perfil.nomeStudio,
        nomeServico: agendamento.nomeServico,
        dataAtendimento: dataFormatada,
        horario: horaFormatada,
        valorRestante: saldoRestante,
        urlCatalogo,
      });

      setTextoEditavel(msg);
    }
  }, [abaSelecionada, agendamento, aberto, perfil, formatarMensagem]);

  if (!agendamento) return null;

  const telLimpo = limparTelefone(agendamento.telefoneCliente);
  const linkWhatsApp = telLimpo
    ? `https://wa.me/55${telLimpo}?text=${encodeURIComponent(textoEditavel)}`
    : "#";

  const handleCopiarTexto = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(textoEditavel);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border-slate-200">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <DialogTitle className="text-base font-bold text-white">
                Disparos Rápidos de WhatsApp
              </DialogTitle>
            </div>
            <Badge className="bg-white/20 text-white border-none font-medium text-xs">
              {agendamento.nomeCliente}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-emerald-100 mt-1">
            {agendamento.nomeServico} • {formatarData(agendamento.dataInicio)} às {formatarHora(agendamento.dataInicio)}
          </DialogDescription>
        </div>

        <div className="p-5 space-y-4">
          {/* Seletor de Modelo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setAbaSelecionada("lembrete24h")}
              className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                abaSelecionada === "lembrete24h"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Lembrete 24h</span>
            </button>

            <button
              type="button"
              onClick={() => setAbaSelecionada("comoChegar")}
              className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                abaSelecionada === "comoChegar"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Como Chegar</span>
            </button>

            <button
              type="button"
              onClick={() => setAbaSelecionada("cuidadosPosTranca")}
              className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                abaSelecionada === "cuidadosPosTranca"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pós-Trança</span>
            </button>

            <button
              type="button"
              onClick={() => setAbaSelecionada("retornoManutencao")}
              className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                abaSelecionada === "retornoManutencao"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retorno (40d)</span>
            </button>
          </div>

          {/* Área de Edição da Mensagem */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Texto da Mensagem (você pode editar antes de enviar):
              </label>
              <button
                type="button"
                onClick={handleCopiarTexto}
                className="text-xs text-emerald-700 font-semibold flex items-center gap-1 hover:underline"
              >
                {copiado ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copiado ? "Copiado!" : "Copiar Texto"}
              </button>
            </div>
            <textarea
              value={textoEditavel}
              onChange={(e) => setTextoEditavel(e.target.value)}
              rows={6}
              className="w-full text-xs rounded-2xl border border-slate-200 p-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 leading-relaxed font-sans"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto text-xs h-10 rounded-xl"
            >
              Fechar
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                asChild
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-10 px-5 font-bold rounded-xl gap-2 shadow-md shadow-emerald-200"
              >
                <a href={linkWhatsApp} target="_blank" rel="noopener noreferrer">
                  <Send className="w-3.5 h-3.5" />
                  Enviar Mensagem no WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
