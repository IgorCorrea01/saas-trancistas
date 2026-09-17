"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Phone,
  ArrowRight,
  Info,
  MessageCircle,
  Copy,
  Check,
  QrCode,
  Wallet,
} from "lucide-react";
import { useOrcamentoPublico } from "@/hooks/useOrcamentos";
import { useCatalogoPublico } from "@/hooks/useServicos";
import { useDisponibilidade, useCriarAgendamentoPublico } from "@/hooks/useAgenda";
import { StatusOrcamento } from "@/tipos/orcamentos";
import { SlotHorarioResposta, AgendamentoResposta } from "@/tipos/agendamentos";
import { formatarMoeda, formatarDataCurta, formatarDuracaoMinutos } from "@/utilitarios/formatadores";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/componentes/ui/card";
import { Badge } from "@/componentes/ui/badge";
import { Skeleton } from "@/componentes/ui/skeleton";

export default function PaginaAgendamentoPublico() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const { data: orcamento, isLoading: carregandoOrcamento } = useOrcamentoPublico(token);
  const slugEmpresa = orcamento?.slugEmpresa || "";

  const { data: catalogo } = useCatalogoPublico(slugEmpresa);

  // Encontra o ID do serviço correspondente
  const servicoCorrespondente = useMemo(() => {
    if (!catalogo || !orcamento) return null;
    return catalogo.find((s) => s.nome.toLowerCase() === orcamento.nomeServico.toLowerCase()) || catalogo[0];
  }, [catalogo, orcamento]);

  const servicoId = servicoCorrespondente?.id || "";

  // Próximos 14 dias para o seletor
  const diasDisponiveis = useMemo(() => {
    const lista = [];
    const hoje = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(hoje);
      d.setDate(hoje.getDate() + i);
      const isoString = d.toISOString().split("T")[0];
      const diaSemanaCurto = d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
      const diaNumero = d.getDate();
      const mesCurto = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
      lista.push({
        dataIso: isoString,
        dataObj: d,
        diaSemanaCurto: diaSemanaCurto.toUpperCase(),
        diaNumero,
        mesCurto: mesCurto.toUpperCase(),
      });
    }
    return lista;
  }, []);

  const [dataSelecionada, setDataSelecionada] = useState<string>(
    diasDisponiveis[0]?.dataIso || ""
  );
  const [slotSelecionado, setSlotSelecionado] = useState<SlotHorarioResposta | null>(null);
  const [observacoes, setObservacoes] = useState("");
  const [agendamentoConcluido, setAgendamentoConcluido] = useState<AgendamentoResposta | null>(null);
  const [erroAgendamento, setErroAgendamento] = useState<string | null>(null);
  const [pixCopiado, setPixCopiado] = useState(false);

  // Extrai chave Pix se presente nas formas de pagamento
  const extrairChavePix = (texto?: string | null) => {
    if (!texto) return null;
    const matchPix = texto.match(/(?:pix|chave)\s*(?:pix)?[:\s]+([^\s,;()|]+)/i);
    if (matchPix && matchPix[1]) return matchPix[1];
    const matchEmail = texto.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (matchEmail) return matchEmail[0];
    const matchNum = texto.match(/\b(?:\d{2,3}\.?\d{3}\.?\d{3}-?\d{2}|\(?\d{2}\)?\s*9?\d{4}-?\d{4})\b/);
    if (matchNum) return matchNum[0];
    return null;
  };

  const chavePixEncontrada = extrairChavePix(orcamento?.formasPagamento);

  const handleCopiarPix = (textoParaCopiar: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(textoParaCopiar);
      setPixCopiado(true);
      setTimeout(() => setPixCopiado(false), 2500);
    }
  };

  const { data: disponibilidade, isLoading: carregandoDisponibilidade } = useDisponibilidade(
    slugEmpresa,
    servicoId,
    dataSelecionada
  );

  const criarAgendamentoMutation = useCriarAgendamentoPublico();

  const handleConfirmarAgendamento = async () => {
    if (!slotSelecionado) return;
    setErroAgendamento(null);

    try {
      const resultado = await criarAgendamentoMutation.mutateAsync({
        tokenOrcamento: token,
        horarioInicio: slotSelecionado.horarioInicio,
        observacoes: observacoes.trim() || undefined,
      });
      setAgendamentoConcluido(resultado);
    } catch (err: any) {
      setErroAgendamento(
        err?.response?.data?.mensagem ||
          "Não foi possível confirmar o agendamento neste horário. Tente outro horário."
      );
    }
  };

  if (carregandoOrcamento) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-4">
          <Skeleton className="h-10 w-48 mx-auto" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!orcamento) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-6 space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <CardTitle className="text-xl">Proposta não encontrada</CardTitle>
          <CardDescription>
            Não foi possível carregar os dados desta proposta para agendamento.
          </CardDescription>
        </Card>
      </div>
    );
  }

  // Se o agendamento acabou de ser confirmado
  if (agendamentoConcluido) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-slate-50 to-slate-100 py-10 px-4">
        <div className="max-w-lg mx-auto space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Agendamento Confirmado!
            </h1>
            <p className="text-sm text-slate-500">
              Seu horário está reservado com sucesso no estúdio.
            </p>
          </div>

          <Card className="border-emerald-200 bg-white shadow-lg rounded-2xl overflow-hidden text-left">
            <div className="bg-emerald-600 text-white p-4 text-center">
              <span className="text-xs uppercase tracking-wider font-semibold opacity-90">
                Resumo da sua Reserva
              </span>
              <h3 className="text-lg font-bold mt-0.5">{orcamento.nomeEmpresa}</h3>
            </div>

            <CardContent className="p-6 space-y-4 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500">Cliente</span>
                <span className="font-semibold text-slate-900">{agendamentoConcluido.nomeCliente}</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500">Serviço</span>
                <span className="font-semibold text-slate-900">{agendamentoConcluido.nomeServico}</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500">Data e Horário</span>
                <span className="font-semibold text-slate-900 text-right">
                  {new Date(agendamentoConcluido.dataInicio).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                  })}
                  <br />
                  <span className="text-emerald-700 font-bold">
                    {new Date(agendamentoConcluido.dataInicio).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    às{" "}
                    {new Date(agendamentoConcluido.dataFim).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500">Sinal para Reserva</span>
                <span className="font-bold text-rose-600">
                  {formatarMoeda(agendamentoConcluido.valorSinal || orcamento.valorSinal)}
                </span>
              </div>

              {/* Pix Card for Signal Payment */}
              {chavePixEncontrada ? (
                <div className="bg-gradient-to-r from-emerald-50/90 to-teal-50/90 border border-emerald-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      Chave Pix para Pagamento do Sinal
                    </span>
                    <Badge className="bg-emerald-600 text-white font-semibold text-[10px]">
                      {formatarMoeda(agendamentoConcluido.valorSinal || orcamento.valorSinal)}
                    </Badge>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                    <div className="min-w-0 space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                        Chave Pix
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 break-all block">
                        {chavePixEncontrada}
                      </span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleCopiarPix(chavePixEncontrada)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-bold gap-1.5 shrink-0 self-start sm:self-auto shadow-xs"
                    >
                      {pixCopiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {pixCopiado ? "Chave Copiada!" : "Copiar Chave Pix"}
                    </Button>
                  </div>

                  <p className="text-[11px] text-emerald-800">
                    Copie a chave acima, faça o Pix no seu app do banco e envie o comprovante no WhatsApp abaixo.
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    Próximo Passo: Pagamento do Sinal ({formatarMoeda(agendamentoConcluido.valorSinal || orcamento.valorSinal)})
                  </p>
                  <p>
                    {orcamento.formasPagamento || "Efetue o pagamento do sinal para garantir sua vaga na data escolhida."}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Olá! Acabei de agendar meu atendimento de ${agendamentoConcluido.nomeServico} no ${orcamento.nomeEmpresa} para ${new Date(agendamentoConcluido.dataInicio).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })} às ${new Date(agendamentoConcluido.dataInicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}. Segue o comprovante do sinal de ${formatarMoeda(agendamentoConcluido.valorSinal || orcamento.valorSinal)}!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-xl font-bold text-xs transition-colors shadow-md shadow-emerald-200"
                >
                  <MessageCircle className="w-4 h-4" />
                  Enviar Comprovante do Sinal no WhatsApp
                </a>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-slate-400">
            Guarde os detalhes desta confirmação. Até o dia do seu atendimento!
          </p>
        </div>
      </div>
    );
  }

  // Verifica se o orçamento não foi aceito ainda
  if (orcamento.status !== StatusOrcamento.Aceito) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-6 space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <CardTitle className="text-xl">Proposta não confirmada</CardTitle>
          <CardDescription>
            Você precisa aceitar a proposta de orçamento antes de escolher um horário na agenda.
          </CardDescription>
          <Button
            onClick={() => router.push(`/orcamento/${token}`)}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-10 w-full"
          >
            Ver Proposta de Orçamento
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 via-slate-50 to-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-1">
          <Badge
            variant="outline"
            className="bg-white/80 text-rose-700 border-rose-200 px-3 py-1 text-xs font-semibold gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {orcamento.nomeEmpresa}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 pt-1">
            Escolha seu Horário
          </h1>
          <p className="text-sm text-slate-500">
            {orcamento.nomeServico} • Duração estimada de ~
            {formatarDuracaoMinutos(orcamento.duracaoEstimadaMinutos)}
          </p>
        </div>

        {erroAgendamento && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs text-red-700 flex items-start gap-2 shadow-sm">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{erroAgendamento}</span>
          </div>
        )}

        {/* Date Selector Carousel */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            1. Selecione o Dia
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {diasDisponiveis.map((dia) => {
              const selecionado = dataSelecionada === dia.dataIso;
              return (
                <button
                  key={dia.dataIso}
                  onClick={() => {
                    setDataSelecionada(dia.dataIso);
                    setSlotSelecionado(null);
                  }}
                  className={`shrink-0 w-16 h-20 rounded-2xl border flex flex-col items-center justify-center p-1 transition-all text-center ${
                    selecionado
                      ? "bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-200 scale-105"
                      : "bg-white border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-rose-50/50"
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold tracking-wider ${
                      selecionado ? "text-rose-100" : "text-slate-400"
                    }`}
                  >
                    {dia.diaSemanaCurto}
                  </span>
                  <span className="text-lg font-extrabold leading-tight my-0.5">
                    {dia.diaNumero}
                  </span>
                  <span
                    className={`text-[10px] font-medium ${
                      selecionado ? "text-rose-100" : "text-slate-400"
                    }`}
                  >
                    {dia.mesCurto}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots Grid */}
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardHeader className="pb-3 pt-5 px-5">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>2. Horários de Início Disponíveis</span>
              <span className="text-xs font-normal lowercase text-slate-400">
                {disponibilidade?.diaSemana || ""}
              </span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              O horário reserva o período integral necessário para suas tranças (~
              {formatarDuracaoMinutos(orcamento.duracaoEstimadaMinutos)}).
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 pt-0 space-y-4">
            {carregandoDisponibilidade ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            ) : !disponibilidade?.slots || disponibilidade.slots.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Nenhum horário configurado para este dia. Escolha outra data acima.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {disponibilidade.slots.map((slot, index) => {
                  const isSelected =
                    slotSelecionado?.horarioInicio === slot.horarioInicio;
                  const isAvailable = slot.disponivel;

                  return (
                    <button
                      key={index}
                      disabled={!isAvailable}
                      onClick={() => setSlotSelecionado(slot)}
                      className={`relative p-3 rounded-xl border text-left transition-all min-h-[52px] flex flex-col justify-center ${
                        isSelected
                          ? "bg-rose-50 border-rose-600 ring-2 ring-rose-500/20 text-rose-950 shadow-xs"
                          : isAvailable
                          ? "bg-white border-slate-200 hover:border-rose-400 hover:bg-rose-50/30 text-slate-800"
                          : "bg-slate-50 border-slate-200/60 text-slate-400 cursor-not-allowed opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">
                          {slot.horarioInicioFormatado}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-rose-600" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        até {slot.horarioFimFormatado}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Slot Recap & Notes */}
        {slotSelecionado && (
          <div className="space-y-4 bg-white border border-rose-100 rounded-2xl p-5 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Horário Selecionado:</p>
                <p className="text-sm font-bold text-slate-900">
                  {new Date(slotSelecionado.horarioInicio).toLocaleDateString("pt-BR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "long",
                  })}{" "}
                  das {slotSelecionado.horarioInicioFormatado} às{" "}
                  {slotSelecionado.horarioFimFormatado}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 block">
                Observações ou Recados para o atendimento (opcional)
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Prefiro começar pontualmente às 09h..."
                rows={2}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <Button
              onClick={handleConfirmarAgendamento}
              disabled={criarAgendamentoMutation.isPending}
              className="w-full h-13 text-sm font-bold bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl shadow-md shadow-rose-200 gap-2"
            >
              {criarAgendamentoMutation.isPending ? (
                "Confirmando sua vaga..."
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar Agendamento
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </>
              )}
            </Button>
          </div>
        )}

        <div className="text-center pt-2 pb-6">
          <p className="text-[11px] text-slate-400">
            {orcamento.nomeEmpresa} • Agendamento Inteligente sem Conflitos
          </p>
        </div>
      </div>
    </div>
  );
}
