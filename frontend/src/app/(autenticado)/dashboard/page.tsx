"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAutenticacao } from "@/hooks/useAutenticacao";
import { usePerfilProfissional } from "@/hooks/usePerfilProfissional";
import { useDashboard } from "@/hooks/useDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
import { Badge } from "@/componentes/ui/badge";
import { Button } from "@/componentes/ui/button";
import { Skeleton } from "@/componentes/ui/skeleton";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import {
  formatarMoeda,
  formatarDataHora,
  formatarData,
  formatarHora,
  formatarDuracao,
  limparTelefone,
} from "@/utilitarios/formatadores";
import {
  STATUS_SOLICITACAO_CONFIG,
  STATUS_AGENDAMENTO_CONFIG,
} from "@/utilitarios/constantes";
import {
  Inbox,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CalendarCheck,
  Clock,
  ArrowRight,
  Sparkles,
  Camera,
  Percent,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Scissors,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  CalendarRange,
  Plus,
  ShieldCheck,
  RotateCcw,
  RefreshCw,
} from "lucide-react";

export interface MesFiltro {
  id: string;
  rotulo: string;
  rotuloCurto: string;
  ano: number;
  mes: number; // 0-indexed
  dataInicioIso: string;
  dataFimIso: string;
}

function gerarMesesDisponiveis(quantidade = 6): MesFiltro[] {
  const mesesNomes = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const mesesCurtos = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ];

  const hoje = new Date();
  const lista: MesFiltro[] = [];

  for (let i = 0; i < quantidade; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const ano = d.getFullYear();
    const mes = d.getMonth();

    const dataInicioIso = new Date(Date.UTC(ano, mes, 1, 0, 0, 0)).toISOString();
    const dataFimIso = new Date(Date.UTC(ano, mes + 1, 0, 23, 59, 59, 999)).toISOString();

    lista.push({
      id: `${ano}-${String(mes + 1).padStart(2, "0")}`,
      rotulo: `${mesesNomes[mes]} de ${ano}`,
      rotuloCurto: `${mesesCurtos[mes]}/${String(ano).slice(2)}`,
      ano,
      mes,
      dataInicioIso,
      dataFimIso,
    });
  }

  return lista;
}

export default function PaginaDashboard() {
  const { usuario } = useAutenticacao();
  const { perfil } = usePerfilProfissional();
  const [linkCopiado, setLinkCopiado] = useState(false);

  // Lista dos últimos meses disponíveis
  const mesesDisponiveis = useMemo(() => gerarMesesDisponiveis(6), []);
  const [mesSelecionadoIndex, setMesSelecionadoIndex] = useState<number>(0); // 0 = Mês atual padrão

  const mesAtualFiltro = mesesDisponiveis[mesSelecionadoIndex];

  // Gera o mês anterior ao selecionado para comparação discreta
  const mesAnteriorFiltro = useMemo(() => {
    if (mesSelecionadoIndex + 1 < mesesDisponiveis.length) {
      return mesesDisponiveis[mesSelecionadoIndex + 1];
    }
    const d = new Date(mesAtualFiltro.ano, mesAtualFiltro.mes - 1, 1);
    const ano = d.getFullYear();
    const mes = d.getMonth();
    return {
      id: `${ano}-${String(mes + 1).padStart(2, "0")}`,
      rotulo: `${ano}-${mes}`,
      rotuloCurto: `${ano}-${mes}`,
      ano,
      mes,
      dataInicioIso: new Date(Date.UTC(ano, mes, 1, 0, 0, 0)).toISOString(),
      dataFimIso: new Date(Date.UTC(ano, mes + 1, 0, 23, 59, 59, 999)).toISOString(),
    };
  }, [mesesDisponiveis, mesSelecionadoIndex, mesAtualFiltro]);

  // Consulta do mês selecionado
  const {
    data: dashboard,
    isLoading: carregandoMes,
    isFetching: atualizandoDashboard,
    refetch: recarregarDashboard,
    error,
  } = useDashboard(mesAtualFiltro.dataInicioIso, mesAtualFiltro.dataFimIso);

  // Consulta do mês anterior para comparativo
  const { data: dashboardAnterior } = useDashboard(
    mesAnteriorFiltro.dataInicioIso,
    mesAnteriorFiltro.dataFimIso
  );

  const nomeExibicao = perfil.nome || usuario?.nome || "Profissional";
  const primeiroNome = nomeExibicao.split(" ")[0];
  const urlCatalogo =
    typeof window !== "undefined"
      ? `${window.location.origin}/${perfil.slug || usuario?.slugEmpresa || "meu-studio"}`
      : `/${perfil.slug || "meu-studio"}`;

  const handleCopiarLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(urlCatalogo);
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 2000);
    }
  };

  // Cálculos de métricas do mês selecionado
  const faturamentoMes = dashboard?.metricas.faturamentoTotal || 0;
  const orcamentosAceitosMes = dashboard?.metricas.orcamentosAceitos || 0;
  const agendamentosTotalMes = dashboard?.metricas.agendamentosTotal || 0;

  // Ticket Médio do mês selecionado
  const ticketMedioMes =
    orcamentosAceitosMes > 0
      ? faturamentoMes / orcamentosAceitosMes
      : agendamentosTotalMes > 0
      ? faturamentoMes / agendamentosTotalMes
      : 0;

  // Métricas do mês anterior para comparação
  const faturamentoAnterior = dashboardAnterior?.metricas.faturamentoTotal || 0;
  const orcamentosAceitosAnterior = dashboardAnterior?.metricas.orcamentosAceitos || 0;
  const agendamentosTotalAnterior = dashboardAnterior?.metricas.agendamentosTotal || 0;

  const ticketMedioAnterior =
    orcamentosAceitosAnterior > 0
      ? faturamentoAnterior / orcamentosAceitosAnterior
      : agendamentosTotalAnterior > 0
      ? faturamentoAnterior / agendamentosTotalAnterior
      : 0;

  // Variação percentual de faturamento
  const diffFaturamentoPercentual =
    faturamentoAnterior > 0
      ? ((faturamentoMes - faturamentoAnterior) / faturamentoAnterior) * 100
      : faturamentoMes > 0
      ? 100
      : 0;

  // Variação percentual de ticket médio
  const diffTicketMedioPercentual =
    ticketMedioAnterior > 0
      ? ((ticketMedioMes - ticketMedioAnterior) / ticketMedioAnterior) * 100
      : ticketMedioMes > 0
      ? 100
      : 0;

  if (carregandoMes && !dashboard) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="h-4 w-72 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <EstadoVazio
        titulo="Erro ao carregar dashboard"
        descricao="Não foi possível obter as métricas do seu estúdio. Verifique sua conexão."
        acaoTexto="Tentar novamente"
        onAcao={() => window.location.reload()}
      />
    );
  }

  const { metricas, proximosAgendamentos, ultimasSolicitacoes } = dashboard;
  const proximoAtendimento =
    proximosAgendamentos && proximosAgendamentos.length > 0 ? proximosAgendamentos[0] : null;
  const telProximoCliente = proximoAtendimento ? limparTelefone(proximoAtendimento.telefoneCliente) : "";

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 pb-10">
      {/* Header Principal com Foto da Profissional & Seletor de Período Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-rose-50/90 via-white to-pink-50/50 p-5 sm:p-6 rounded-3xl border border-rose-100 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-rose-200 shadow-md bg-white flex items-center justify-center shrink-0">
              {perfil.fotoPerfil ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={perfil.fotoPerfil}
                  alt={nomeExibicao}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-rose-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold">
                  {primeiroNome.charAt(0)}
                </div>
              )}
            </div>
            <span
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-2xs"
              title="Estúdio Aberto"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Olá, {primeiroNome}! ✨
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {perfil.nomeStudio || "Studio de Tranças"}
            </p>
            <p className="text-[11px] text-slate-400">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
              })}
            </p>
          </div>
        </div>

        {/* Atalhos Rápidos & Seletor Discreto de Mês */}
        <div className="flex items-center gap-2 flex-wrap sm:self-center">
          {/* Dropdown Compacto e Elegante de Meses */}
          <div className="relative inline-flex items-center">
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <select
              value={mesSelecionadoIndex}
              onChange={(e) => setMesSelecionadoIndex(Number(e.target.value))}
              className="h-9 pl-8 pr-8 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer appearance-none"
            >
              {mesesDisponiveis.map((m, idx) => (
                <option key={m.id} value={idx}>
                  {idx === 0 ? `Mês Atual (${m.rotulo})` : m.rotulo}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => recarregarDashboard()}
              disabled={atualizandoDashboard}
              className="text-xs h-9 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium gap-1.5 rounded-xl shadow-2xs"
              title="Atualizar dados agora"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${atualizandoDashboard ? "animate-spin text-rose-600" : "text-slate-500"}`} />
              <span className="hidden sm:inline">{atualizandoDashboard ? "Atualizando..." : "Atualizar"}</span>
            </Button>

            <Button
              onClick={handleCopiarLink}
              variant="outline"
              size="sm"
              className="text-xs h-9 bg-white border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold gap-1.5 rounded-xl shadow-2xs"
            >
              {linkCopiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {linkCopiado ? "Link Copiado!" : "Copiar Link"}
            </Button>

          <Button asChild size="sm" variant="ghost" className="text-xs h-9 text-slate-600 font-medium gap-1 rounded-xl">
            <Link href={`/${perfil.slug || usuario?.slugEmpresa || "meu-studio"}`} target="_blank">
              <ExternalLink className="w-3.5 h-3.5" />
              Ver Catálogo
            </Link>
          </Button>
        </div>
      </div>

      {/* Aviso caso esteja visualizando um mês anterior */}
      {mesSelecionadoIndex > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-2 text-xs text-amber-900 animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <span className="font-bold">📅 Visualizando Histórico:</span>
            <span>Você está vendo os dados fechados de <strong>{mesAtualFiltro.rotulo}</strong>.</span>
          </div>

          <button
            type="button"
            onClick={() => setMesSelecionadoIndex(0)}
            className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-200/60 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors text-xs shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Voltar para Mês Atual</span>
          </button>
        </div>
      )}

      {/* Destaques Operacionais Imediatos: Solicitações Pendentes & Próximo Atendimento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Card: Solicitações Aguardando Análise */}
        <Card
          className={`rounded-2xl border transition-all ${
            metricas.solicitacoesAguardandoAnalise > 0
              ? "border-amber-300 bg-gradient-to-br from-amber-50/60 to-orange-50/30 shadow-xs"
              : "border-slate-200 bg-white shadow-xs"
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Inbox className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Solicitações Pendentes
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Fotos de clientes aguardando seu orçamento
                  </CardDescription>
                </div>
              </div>

              {metricas.solicitacoesAguardandoAnalise > 0 && (
                <Badge className="bg-amber-600 text-white font-bold text-xs px-2.5 py-0.5">
                  {metricas.solicitacoesAguardandoAnalise}{" "}
                  {metricas.solicitacoesAguardandoAnalise === 1 ? "nova" : "novas"}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {metricas.solicitacoesAguardandoAnalise > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-700 leading-relaxed">
                  Você tem{" "}
                  <strong>{metricas.solicitacoesAguardandoAnalise} solicitações</strong> com fotos
                  enviadas prontas para análise capilar e precificação.
                </p>

                <Button
                  asChild
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-11 rounded-xl gap-2 shadow-xs"
                >
                  <Link href="/solicitacoes">
                    <Inbox className="w-4 h-4" />
                    Analisar Pedidos Agora
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2 py-1">
                <p className="text-xs text-slate-500">
                  Nenhuma solicitação pendente no momento. Todas as clientes foram respondidas!
                </p>
                <Button asChild variant="outline" size="sm" className="text-xs h-9 rounded-xl border-slate-200">
                  <Link href="/solicitacoes">Ver Histórico de Solicitações</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card: Próximo Atendimento na Agenda */}
        <Card className="rounded-2xl border-slate-200 bg-white shadow-xs overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Próximo Atendimento
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Compromisso mais próximo na sua agenda
                  </CardDescription>
                </div>
              </div>

              <Button asChild variant="ghost" size="sm" className="text-xs text-rose-600 font-semibold h-8">
                <Link href="/agenda">Abrir Agenda</Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {proximoAtendimento ? (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">
                      {proximoAtendimento.nomeCliente}
                    </span>
                    <span className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-0.5">
                      <Scissors className="w-3.5 h-3.5" />
                      {proximoAtendimento.nomeServico} (~{formatarDuracao(proximoAtendimento.duracaoMinutos)})
                    </span>
                  </div>

                  <Badge className="bg-rose-600 text-white font-bold text-xs">
                    {formatarHora(proximoAtendimento.dataInicio)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatarData(proximoAtendimento.dataInicio)}
                  </span>
                  {proximoAtendimento.valorFinal && (
                    <span className="font-semibold text-slate-800">
                      Total: {formatarMoeda(proximoAtendimento.valorFinal)}
                    </span>
                  )}
                </div>

                {telProximoCliente && (
                  <a
                    href={`https://wa.me/55${telProximoCliente}?text=Olá ${encodeURIComponent(
                      proximoAtendimento.nomeCliente
                    )}, tudo bem? Falo do estúdio sobre seu horário agendado!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold p-2.5 rounded-xl transition-colors shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chamar Cliente no WhatsApp
                  </a>
                )}
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <p className="text-xs text-slate-500">
                  Nenhum atendimento agendado para as próximas horas.
                </p>
                <Button asChild variant="outline" size="sm" className="text-xs h-9 rounded-xl border-slate-200">
                  <Link href="/agenda">Ver Calendário Completo</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grid de 4 KPIs Financeiros e Operacionais do Mês */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Faturamento Total do Mês */}
        <Card className="p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-300 transition-colors bg-white rounded-2xl shadow-xs">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Faturamento ({mesAtualFiltro.rotulo.split(" ")[0]})</span>
              <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-slate-900">
              {formatarMoeda(metricas.faturamentoTotal)}
            </div>

            {/* Badge Discreto de Comparação */}
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              {diffFaturamentoPercentual >= 0 ? (
                <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  +{diffFaturamentoPercentual.toFixed(1)}%
                </span>
              ) : (
                <span className="inline-flex items-center text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                  <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  {diffFaturamentoPercentual.toFixed(1)}%
                </span>
              )}
              <span className="text-[11px] text-slate-400">vs mês anterior</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Sinais (Pix): {formatarMoeda(metricas.totalSinaisRecebidos)}</span>
            <span>Na Cadeira: {formatarMoeda(metricas.totalRestanteReceber)}</span>
          </div>
        </Card>

        {/* 2. Ticket Médio Mensal */}
        <Card className="p-4 sm:p-5 flex flex-col justify-between hover:border-purple-300 transition-colors bg-white rounded-2xl shadow-xs">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Ticket Médio por Trança</span>
              <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Scissors className="h-4 w-4" />
              </div>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-slate-900">
              {formatarMoeda(ticketMedioMes)}
            </div>

            {/* Comparação do Ticket Médio */}
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              {diffTicketMedioPercentual >= 0 ? (
                <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  +{diffTicketMedioPercentual.toFixed(1)}%
                </span>
              ) : (
                <span className="inline-flex items-center text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                  <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  {diffTicketMedioPercentual.toFixed(1)}%
                </span>
              )}
              <span className="text-[11px] text-slate-400">por cliente</span>
            </div>
          </div>

          <p className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400 truncate">
            {orcamentosAceitosMes > 0
              ? `${orcamentosAceitosMes} trança(s) fechada(s)`
              : "Sem tranças fechadas no período"}
          </p>
        </Card>

        {/* 3. Taxa de Conversão */}
        <Card className="p-4 sm:p-5 flex flex-col justify-between hover:border-amber-300 transition-colors bg-white rounded-2xl shadow-xs">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Taxa de Conversão</span>
              <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Percent className="h-4 w-4" />
              </div>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-slate-900">
              {metricas.taxaConversaoPercentual}%
            </div>

            <p className="text-[11px] text-slate-500 mt-2">
              {metricas.orcamentosAceitos} aceitos de {metricas.orcamentosEnviados} propostas
            </p>
          </div>

          <p className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400">
            {metricas.orcamentosRecusados > 0
              ? `${metricas.orcamentosRecusados} não aceito(s)`
              : "Zero recusas no mês"}
          </p>
        </Card>

        {/* 4. Total de Agendamentos */}
        <Card className="p-4 sm:p-5 flex flex-col justify-between hover:border-indigo-300 transition-colors bg-white rounded-2xl shadow-xs">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Agendamentos no Mês</span>
              <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CalendarCheck className="h-4 w-4" />
              </div>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-slate-900">
              {metricas.agendamentosTotal}
            </div>

            <p className="text-[11px] text-slate-500 mt-2">
              {metricas.agendamentosConfirmados} confirmados • {metricas.agendamentosConcluidos} concluídos
            </p>
          </div>

          <p className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400">
            Total na cadeira do estúdio
          </p>
        </Card>
      </div>

      {/* Solicitações de Orçamento Recentes */}
      <Card className="flex flex-col shadow-xs rounded-2xl bg-white border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Últimas Solicitações Recebidas
            </CardTitle>
            <CardDescription className="text-xs">
              Pedidos de clientes para avaliação de fotos e precificação
            </CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-xs text-rose-600 font-semibold gap-1">
            <Link href="/solicitacoes">
              Ver todas <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent className="space-y-3">
          {ultimasSolicitacoes.length === 0 ? (
            <EstadoVazio
              icone={Inbox}
              titulo="Nenhuma solicitação no período"
              descricao="Compartilhe o link do seu catálogo nas redes sociais e WhatsApp para receber novos orçamentos."
              className="py-8"
            />
          ) : (
            ultimasSolicitacoes.map((sol) => {
              const configStatus = STATUS_SOLICITACAO_CONFIG[sol.status];
              return (
                <Link
                  key={sol.id}
                  href={`/solicitacoes/${sol.id}`}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-rose-200 hover:bg-rose-50/30 transition-all group"
                >
                  <div className="space-y-1 overflow-hidden pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 group-hover:text-rose-600 transition-colors">
                        {sol.nomeCliente}
                      </span>
                      {sol.totalFotos > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                          <Camera className="h-3 w-3" />
                          {sol.totalFotos} {sol.totalFotos === 1 ? "foto" : "fotos"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {sol.nomeServico} • {formatarDataHora(sol.dataCriacao)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={configStatus?.variante || "secondary"} className="text-[11px]">
                      {configStatus?.rotulo || sol.statusDescricao}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
                  </div>
                </Link>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
