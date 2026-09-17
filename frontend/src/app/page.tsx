"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { clienteApi } from "@/servicos/api/clienteApi";
import { Button } from "@/componentes/ui/button";
import { Badge } from "@/componentes/ui/badge";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CalendarCheck,
  Camera,
  CheckCircle2,
  Clock,
  MessageCircle,
  Scissors,
  Wallet,
  Smartphone,
  Check,
  TrendingUp,
  FileText,
  UserCheck,
  Layers,
  ChevronRight,
  Lock,
  ArrowDown,
  Store,
  ExternalLink,
  Shield
} from "lucide-react";

interface StatusSaude {
  status: string;
  ambiente: string;
  dataHora: string;
}

export default function PaginaInicial() {
  const { data: saude } = useQuery<StatusSaude>({
    queryKey: ["saude-api"],
    queryFn: async () => {
      const resp = await clienteApi.get<StatusSaude>("/api/saude");
      return resp.data;
    },
    staleTime: 60000,
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F5] text-slate-900 selection:bg-rose-200 selection:text-rose-900 font-sans">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER / NAVBAR
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-rose-200/50 bg-[#FAF7F5]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-rose-800 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-tight">
                Trança<span className="text-rose-800">Flow</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                Para Trancistas & Espaços de Beleza
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#como-funciona" className="hover:text-rose-900 transition-colors">
              Como Funciona
            </a>
            <a href="#fluxo-trancista" className="hover:text-rose-900 transition-colors">
              Do Instagram à Cadeira
            </a>
            <a href="#funcionalidades" className="hover:text-rose-900 transition-colors">
              Funcionalidades
            </a>
            <a href="#catalogo" className="hover:text-rose-900 transition-colors">
              Catálogo
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Button asChild variant="ghost" size="sm" className="font-semibold text-slate-700 hover:text-rose-900 hover:bg-rose-100/50 text-sm">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm" className="font-semibold bg-rose-800 hover:bg-rose-900 text-white shadow-xs text-sm rounded-xl px-4">
              <Link href="/registrar" className="gap-1.5">
                <span>Começar agora</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ─────────────────────────────────────────────────────────────
            2. HERO SECTION
        ───────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-10 pb-16 md:pt-20 md:pb-24">
          {/* Subtle Ambient Shapes */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-rose-200/40 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="absolute top-40 right-10 w-[300px] h-[300px] bg-amber-100/60 rounded-full blur-2xl -z-10 pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              
              {/* Left Column: Copy & CTAs */}
              <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 border border-rose-200 text-rose-900 text-xs sm:text-sm font-semibold">
                  <Sparkles className="h-3.5 w-3.5 text-rose-700" />
                  <span>Feito para profissionais de beleza</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-extrabold tracking-tight text-slate-900 leading-[1.14]">
                  Seu atendimento começa{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-800 via-rose-700 to-amber-800">
                    antes da cadeira.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Receba pedidos de orçamento completos, analise as informações da cliente, envie seu orçamento e organize o agendamento em um só lugar.
                </p>

                {/* CTAs */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 max-w-md mx-auto lg:mx-0">
                  <Button asChild size="lg" className="w-full sm:w-auto h-13 px-8 text-base font-bold bg-rose-800 hover:bg-rose-900 text-white shadow-md rounded-xl gap-2">
                    <Link href="/registrar">
                      <span>Começar agora</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-13 px-6 text-base font-semibold border-rose-200 text-slate-700 hover:bg-rose-50 bg-white rounded-xl">
                    <a href="#como-funciona">Ver como funciona</a>
                  </Button>
                </div>

                {/* Trust Text */}
                <div className="pt-2 flex items-center justify-center lg:justify-start gap-2 text-xs font-medium text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-rose-700" />
                  <span>Orçamento, clientes e agenda em um só lugar.</span>
                </div>
              </div>

              {/* Right Column: Visual Composition Mockups */}
              <div className="lg:col-span-6 relative">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  
                  {/* Card 1: Mobile Showcase Mockup (Public Page) */}
                  <div className="bg-white rounded-3xl border border-rose-100 shadow-xl p-4 sm:p-5 space-y-3.5 max-w-sm mx-auto transition-transform hover:-translate-y-1 duration-300">
                    {/* Header Studio */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="h-10 w-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-sm">
                          ✨
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-slate-900">Isa Braids</span>
                            <Badge variant="sucesso" className="text-[9px] py-0 px-1.5 font-bold uppercase">
                              Online
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono">trancaflow.app/isa-braids</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-rose-700 font-semibold">Catálogo</span>
                    </div>

                    {/* Service Item 1 */}
                    <div className="p-3 rounded-2xl bg-[#FAF7F5] border border-rose-100 flex items-center justify-between gap-3">
                      <div>
                        <strong className="text-xs font-bold text-slate-800 block">Knotless Braids (Sem Nó)</strong>
                        <span className="text-[11px] text-slate-500">Leveza e caimento natural</span>
                      </div>
                      <span className="text-xs font-bold text-rose-900 shrink-0">A partir de R$ 320</span>
                    </div>

                    {/* Service Item 2 */}
                    <div className="p-3 rounded-2xl bg-[#FAF7F5] border border-rose-100 flex items-center justify-between gap-3">
                      <div>
                        <strong className="text-xs font-bold text-slate-800 block">French Curl Braids</strong>
                        <span className="text-[11px] text-slate-500">Pontas espiraladas sedosas</span>
                      </div>
                      <span className="text-xs font-bold text-rose-900 shrink-0">A partir de R$ 350</span>
                    </div>

                    <div className="pt-1">
                      <div className="w-full py-2.5 rounded-xl bg-rose-800 text-white text-center text-xs font-bold shadow-xs">
                        Solicitar Orçamento
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Floating Notification (Nova Solicitação com Foto) */}
                  <div className="mt-3 sm:absolute sm:-bottom-6 sm:-left-6 bg-white rounded-2xl border border-rose-200/80 shadow-lg p-3.5 sm:max-w-[270px] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Novo Pedido Recebido
                      </span>
                      <span className="text-[10px] text-slate-400">Há 5 min</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0">
                        <Camera className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">Camila Oliveira</p>
                        <p className="text-[11px] text-slate-500 truncate">Foto da raiz + Box Braids Longa</p>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Floating Agenda Slot Confirmation */}
                  <div className="mt-3 sm:absolute sm:-top-6 sm:-right-4 bg-white rounded-2xl border border-slate-200/90 shadow-lg p-3 sm:max-w-[230px] hidden sm:block">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <CalendarCheck className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-800">Sábado • 09:00</p>
                        <p className="text-[10px] text-emerald-700 font-medium">Horário travado (sem conflito)</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            3. SEÇÃO DE PROBLEMA: ANTES vs DEPOIS
        ───────────────────────────────────────────────────────────── */}
        <section className="py-16 bg-white border-y border-rose-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Organização de Atendimento</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Menos conversa perdida. Mais atendimento organizado.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Você não precisa abandonar o WhatsApp. O TrançaFlow organiza os pedidos antes, para você responder com rapidez e profissionalismo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              
              {/* ANTES */}
              <div className="p-6 sm:p-7 rounded-3xl bg-[#FAF7F5] border border-slate-200/80 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                    Antes
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    O caos do Direct e das conversas soltas
                  </h3>
                  <ul className="space-y-3 pt-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2.5">
                      <span className="text-slate-400 font-bold">✕</span>
                      <span>Mensagens espalhadas entre Instagram e WhatsApp</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-slate-400 font-bold">✕</span>
                      <span>Perguntas repetidas sobre tamanho, volume, cor e modelo</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-slate-400 font-bold">✕</span>
                      <span>Fotos do cabelo perdidas no meio da conversa do dia a dia</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-slate-400 font-bold">✕</span>
                      <span>Agenda manual no papel ou bloco de notas com risco de erro</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-slate-400 font-bold">✕</span>
                      <span>Dificuldade para acompanhar quais orçamentos foram respondidos</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 border-t border-slate-200/60 text-xs text-slate-500 italic">
                  Resultado: tempo precioso perdido em conversas que não viram atendimento.
                </div>
              </div>

              {/* DEPOIS */}
              <div className="p-6 sm:p-7 rounded-3xl bg-rose-50/70 border border-rose-200 space-y-4 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-800 text-white text-xs font-bold uppercase tracking-wider">
                    Com o TrançaFlow
                  </div>
                  <h3 className="text-base font-bold text-rose-950">
                    Atendimento estruturado do primeiro contato ao agendamento
                  </h3>
                  <ul className="space-y-3 pt-2 text-sm text-slate-800">
                    <li className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-rose-700 shrink-0 mt-0.5" />
                      <span><strong>Solicitação organizada:</strong> a cliente envia tudo de uma só vez pelo link</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-rose-700 shrink-0 mt-0.5" />
                      <span><strong>Formulário personalizado:</strong> perguntas de diagnóstico feitas sob medida</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-rose-700 shrink-0 mt-0.5" />
                      <span><strong>Fotos reunidas:</strong> foto do cabelo atual e referência salvas na ficha</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-rose-700 shrink-0 mt-0.5" />
                      <span><strong>Orçamento profissional:</strong> valor total, sinal e condições claras</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-rose-700 shrink-0 mt-0.5" />
                      <span><strong>Agenda integrada:</strong> prevenção automática contra conflitos de horários</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 border-t border-rose-200 text-xs font-semibold text-rose-900">
                  Resultado: postura profissional, cliente segura e mais orçamentos fechados.
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            4. SEÇÃO "COMO FUNCIONA" (4 Etapas com Linha Visual)
        ───────────────────────────────────────────────────────────── */}
        <section id="como-funciona" className="py-16 md:py-24 bg-[#FAF7F5]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Passo a Passo Simples</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                Como funciona o TrançaFlow?
              </h2>
              <p className="text-sm text-slate-600">
                Uma jornada intuitiva para a sua cliente e controle absoluto para você.
              </p>
            </div>

            {/* Steps Container */}
            <div className="relative">
              {/* Horizontal Connecting Line for Desktop */}
              <div className="hidden md:block absolute top-1/2 left-8 right-8 h-0.5 bg-rose-200 -translate-y-6 z-0" />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                
                {/* 01 */}
                <div className="p-6 rounded-3xl bg-white border border-rose-100 shadow-xs flex flex-col items-start space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-rose-800 text-white flex items-center justify-center font-extrabold text-base shadow-xs">
                    01
                  </div>
                  <h3 className="font-bold text-base text-slate-900">
                    Cliente acessa seu link
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Você coloca seu link próprio na bio do Instagram ou envia no WhatsApp quando alguém pedir orçamento.
                  </p>
                </div>

                {/* 02 */}
                <div className="p-6 rounded-3xl bg-white border border-rose-100 shadow-xs flex flex-col items-start space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-rose-800 text-white flex items-center justify-center font-extrabold text-base shadow-xs">
                    02
                  </div>
                  <h3 className="font-bold text-base text-slate-900">
                    Responde o formulário e envia fotos
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    A cliente escolhe o estilo, informa tamanho, volume, cor e anexa foto do cabelo atual e referência.
                  </p>
                </div>

                {/* 03 */}
                <div className="p-6 rounded-3xl bg-white border border-rose-100 shadow-xs flex flex-col items-start space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-rose-800 text-white flex items-center justify-center font-extrabold text-base shadow-xs">
                    03
                  </div>
                  <h3 className="font-bold text-base text-slate-900">
                    Você analisa e monta o orçamento
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Com todas as fotos e detalhes na tela, você define o preço, o valor do sinal, materiais e envia a proposta.
                  </p>
                </div>

                {/* 04 */}
                <div className="p-6 rounded-3xl bg-white border border-rose-100 shadow-xs flex flex-col items-start space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-rose-800 text-white flex items-center justify-center font-extrabold text-base shadow-xs">
                    04
                  </div>
                  <h3 className="font-bold text-base text-slate-900">
                    Cliente aceita e agenda o horário
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    A cliente aceita as condições, escolhe uma data disponível na sua agenda e garante o atendimento.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            5. SEÇÃO ESPECÍFICA: "DO INSTAGRAM PARA A CADEIRA"
        ───────────────────────────────────────────────────────────── */}
        <section id="fluxo-trancista" className="py-16 md:py-20 bg-rose-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-700/30 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-widest">Fluxo Completo</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                Do Instagram para a cadeira.
              </h2>
              <p className="text-sm text-rose-100/80">
                A jornada do seu atendimento descomplicada passo a passo:
              </p>
            </div>

            {/* Flow Visual Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 text-center">
              
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs flex flex-col items-center justify-center space-y-2">
                <div className="h-8 w-8 rounded-full bg-rose-800 text-white flex items-center justify-center text-xs font-bold">1</div>
                <strong className="text-xs font-bold block">Instagram / WhatsApp</strong>
                <span className="text-[11px] text-rose-200">Primeiro contato</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs flex flex-col items-center justify-center space-y-2">
                <div className="h-8 w-8 rounded-full bg-rose-800 text-white flex items-center justify-center text-xs font-bold">2</div>
                <strong className="text-xs font-bold block">Link Personalizado</strong>
                <span className="text-[11px] text-rose-200">Seu catálogo online</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs flex flex-col items-center justify-center space-y-2">
                <div className="h-8 w-8 rounded-full bg-rose-800 text-white flex items-center justify-center text-xs font-bold">3</div>
                <strong className="text-xs font-bold block">Formulário & Fotos</strong>
                <span className="text-[11px] text-rose-200">Diagnóstico capilar</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs flex flex-col items-center justify-center space-y-2">
                <div className="h-8 w-8 rounded-full bg-rose-800 text-white flex items-center justify-center text-xs font-bold">4</div>
                <strong className="text-xs font-bold block">Orçamento & Sinal</strong>
                <span className="text-[11px] text-rose-200">Definido por você</span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-xs flex flex-col items-center justify-center space-y-2">
                <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">5</div>
                <strong className="text-xs font-bold block">Agendamento & Cadeira</strong>
                <span className="text-[11px] text-emerald-200">Atendimento confirmado</span>
              </div>

            </div>

            <div className="mt-10 text-center">
              <p className="text-xs sm:text-sm text-rose-200 max-w-lg mx-auto leading-relaxed">
                Você nunca mais precisa adivinhar o tamanho do cabelo da cliente ou cobrar na hora da pressa.
              </p>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            6. SEÇÃO "SEU LINK" & CATÁLOGO
        ───────────────────────────────────────────────────────────── */}
        <section id="catalogo" className="py-16 md:py-24 bg-white border-b border-rose-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Sua Vitrine Exclusiva</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                Seu catálogo personalizado para enviar às clientes
              </h2>
              <p className="text-sm text-slate-600">
                Apresente seus estilos com elegância e profissionalismo.
              </p>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* 1. Box Braids */}
              <div className="p-5 rounded-3xl bg-[#FAF7F5] border border-rose-100 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-rose-100 text-rose-900 border-rose-200 font-semibold text-[11px]">
                    Clássico & Protetor
                  </Badge>
                  <Scissors className="h-4 w-4 text-rose-700" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Box Braids Tradicionais</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tranças soltas com fibra sintética, ideais para estilo protetor, alta durabilidade e versatilidade.
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-rose-100/80 text-xs">
                  <span className="text-slate-500">Valor estimado</span>
                  <strong className="font-bold text-rose-900">A partir de R$ 250</strong>
                </div>
              </div>

              {/* 2. Knotless Braids */}
              <div className="p-5 rounded-3xl bg-[#FAF7F5] border border-rose-100 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-rose-100 text-rose-900 border-rose-200 font-semibold text-[11px]">
                    Sem Nó • Leveza
                  </Badge>
                  <Scissors className="h-4 w-4 text-rose-700" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Knotless Braids</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Técnica moderna sem nó na raiz, proporcionando caimento natural e conforto sem tração excessiva.
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-rose-100/80 text-xs">
                  <span className="text-slate-500">Valor estimado</span>
                  <strong className="font-bold text-rose-900">A partir de R$ 320</strong>
                </div>
              </div>

              {/* 3. French Curl Braids */}
              <div className="p-5 rounded-3xl bg-[#FAF7F5] border border-rose-100 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-rose-100 text-rose-900 border-rose-200 font-semibold text-[11px]">
                    Tendência • Cachos Franceses
                  </Badge>
                  <Scissors className="h-4 w-4 text-rose-700" />
                </div>
                <h3 className="font-bold text-base text-slate-900">French Curl Braids</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tranças com mechas e pontas espiraladas sedosas em fibra francesa com movimento impecável.
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-rose-100/80 text-xs">
                  <span className="text-slate-500">Valor estimado</span>
                  <strong className="font-bold text-rose-900">A partir de R$ 350</strong>
                </div>
              </div>

              {/* 4. Nagô */}
              <div className="p-5 rounded-3xl bg-[#FAF7F5] border border-rose-100 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-rose-100 text-rose-900 border-rose-200 font-semibold text-[11px]">
                    Rasteira • Tiara • Desenhos
                  </Badge>
                  <Scissors className="h-4 w-4 text-rose-700" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Nagô / Trança Rasteira</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tranças coladas no couro cabeludo, retas ou com desenhos personalizados e geométricos.
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-rose-100/80 text-xs">
                  <span className="text-slate-500">Valor estimado</span>
                  <strong className="font-bold text-rose-900">A partir de R$ 120</strong>
                </div>
              </div>

              {/* 5. Gypsy / Boho */}
              <div className="p-5 rounded-3xl bg-[#FAF7F5] border border-rose-100 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-rose-100 text-rose-900 border-rose-200 font-semibold text-[11px]">
                    Volume • Cachos Orgânicos
                  </Badge>
                  <Scissors className="h-4 w-4 text-rose-700" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Gypsy / Boho Braids</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Combinação de tranças com mechas de cabelo orgânico ondulado saindo no comprimento e pontas.
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-rose-100/80 text-xs">
                  <span className="text-slate-500">Valor estimado</span>
                  <strong className="font-bold text-rose-900">A partir de R$ 380</strong>
                </div>
              </div>

              {/* 6. Twist */}
              <div className="p-5 rounded-3xl bg-[#FAF7F5] border border-rose-100 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-rose-100 text-rose-900 border-rose-200 font-semibold text-[11px]">
                    Passion & Senegalese
                  </Badge>
                  <Scissors className="h-4 w-4 text-rose-700" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Twist / Passion Twist</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tranças torcidas de duas mechas (Two-Strand Twist), com toque aveludado e acabamento leve.
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-rose-100/80 text-xs">
                  <span className="text-slate-500">Valor estimado</span>
                  <strong className="font-bold text-rose-900">A partir de R$ 280</strong>
                </div>
              </div>

            </div>

            <div className="mt-8 text-center text-xs text-slate-500">
              * Valores, fotos, perguntas e serviços totalmente personalizáveis no seu painel.
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            7. SEÇÃO DE FUNCIONALIDADES (As 6 Funcionalidades Reais)
        ───────────────────────────────────────────────────────────── */}
        <section id="funcionalidades" className="py-16 md:py-24 bg-[#FAF7F5]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Recursos Feitos Sob Medida</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                Tudo o que você precisa no seu dia a dia
              </h2>
              <p className="text-sm text-slate-600">
                Ferramentas práticas para descomplicar cada etapa do seu trabalho.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* 1. Formulário Personalizado */}
              <div className="p-6 rounded-3xl bg-white border border-rose-100 shadow-xs space-y-3">
                <div className="h-10 w-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Formulário Personalizado</h3>
                <p className="text-xs font-semibold text-rose-800 italic">"Pergunte exatamente o que você precisa saber."</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Perguntas de diagnóstico capilar para cada serviço: tamanho, volume, cor, quem fornece o material, foto da raiz e referências.
                </p>
              </div>

              {/* 2. Orçamento Profissional */}
              <div className="p-6 rounded-3xl bg-white border border-rose-100 shadow-xs space-y-3">
                <div className="h-10 w-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                  <Wallet className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Orçamento Profissional</h3>
                <p className="text-xs font-semibold text-rose-800 italic">"Você define o valor. O sistema organiza o resto."</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Defina o valor total, o valor de sinal, materiais inclusos, validade da proposta e formas de pagamento. A decisão de preço é 100% sua.
                </p>
              </div>

              {/* 3. Agenda Integrada */}
              <div className="p-6 rounded-3xl bg-white border border-rose-100 shadow-xs space-y-3">
                <div className="h-10 w-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Agenda & Bloqueios</h3>
                <p className="text-xs font-semibold text-rose-800 italic">"Depois do orçamento, é só escolher o melhor horário."</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Controle de dias de atendimento, horários disponíveis, duração calculada do serviço e prevenção automática de sobreposições.
                </p>
              </div>

              {/* 4. Ficha da Cliente */}
              <div className="p-6 rounded-3xl bg-white border border-rose-100 shadow-xs space-y-3">
                <div className="h-10 w-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                  <UserCheck className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Ficha da Cliente</h3>
                <p className="text-xs font-semibold text-rose-800 italic">"Todas as informações importantes em um só lugar."</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dados de contato, histórico de solicitações, fotos enviadas, modelo realizado e observações para atendimentos futuros.
                </p>
              </div>

              {/* 5. Ações de WhatsApp */}
              <div className="p-6 rounded-3xl bg-white border border-rose-100 shadow-xs space-y-3">
                <div className="h-10 w-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Ações de WhatsApp</h3>
                <p className="text-xs font-semibold text-rose-800 italic">"Continue atendendo onde suas clientes já estão."</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Envie o link do orçamento com 1 clique, compartilhe instruções de atendimento e acione a cliente no WhatsApp sem digitar do zero.
                </p>
              </div>

              {/* 6. Dashboard */}
              <div className="p-6 rounded-3xl bg-white border border-rose-100 shadow-xs space-y-3">
                <div className="h-10 w-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Painel & Métricas</h3>
                <p className="text-xs font-semibold text-rose-800 italic">"Saiba o que precisa da sua atenção."</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Acompanhe solicitações pendentes de análise, orçamentos aguardando resposta, próximos atendimentos e valores previstos no mês.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            8. SEÇÃO DE BENEFÍCIOS OBJETIVOS
        ───────────────────────────────────────────────────────────── */}
        <section className="py-14 bg-white border-y border-rose-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F5] border border-rose-100 flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  Economize tempo no atendimento.
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F5] border border-rose-100 flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                  <Camera className="h-4 w-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  Receba informações completas antes de responder.
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F5] border border-rose-100 flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                  <UserCheck className="h-4 w-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  Tenha suas clientes organizadas.
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F5] border border-rose-100 flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                  <CalendarCheck className="h-4 w-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  Evite conflitos na agenda.
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F5] border border-rose-100 flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  Envie orçamentos mais profissionais.
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F5] border border-rose-100 flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                  <Store className="h-4 w-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  Tenha seu próprio link de atendimento.
                </span>
              </div>

            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            9. SEÇÃO "PARA QUEM É"
        ───────────────────────────────────────────────────────────── */}
        <section className="py-16 md:py-20 bg-[#FAF7F5]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Público-Alvo</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Feito para quem transforma beleza em negócio.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              Desenvolvido com foco no dia a dia de trancistas autônomas, estúdios afro e profissionais de tranças que valorizam seu tempo e a experiência de suas clientes.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <span className="px-4 py-2 rounded-full bg-white border border-rose-200 text-rose-900 font-semibold text-xs sm:text-sm shadow-xs">
                ✨ Trancistas Autônomas
              </span>
              <span className="px-4 py-2 rounded-full bg-white border border-rose-200 text-rose-900 font-semibold text-xs sm:text-sm shadow-xs">
                ✨ Estúdios & Salões Afro
              </span>
              <span className="px-4 py-2 rounded-full bg-white border border-rose-200 text-rose-900 font-semibold text-xs sm:text-sm shadow-xs">
                ✨ Profissionais de Tranças e Extensões
              </span>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            10. SEGURANÇA E CONFIANÇA
        ───────────────────────────────────────────────────────────── */}
        <section className="py-10 bg-white border-y border-rose-100 text-xs text-slate-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-around gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-rose-700 shrink-0" />
              <span>Dados organizados e salvos com segurança</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-rose-700 shrink-0" />
              <span>Acesso seguro ao painel profissional</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-rose-700 shrink-0" />
              <span>Ambiente profissional para você e suas clientes</span>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            11. PREÇO / CTA FINAL DE CONVERSÃO
        ───────────────────────────────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-[#FAF7F5]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-rose-900 via-rose-800 to-amber-950 text-white text-center shadow-xl space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-rose-200 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Transforme pedidos de orçamento em atendimentos</span>
              </div>

              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Comece a organizar seus atendimentos.
              </h2>

              <p className="text-sm sm:text-base text-rose-100/90 max-w-xl mx-auto leading-relaxed">
                Crie seu catálogo agora mesmo, personalize suas perguntas e envie seu link exclusivo para suas clientes.
              </p>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
                <Button asChild size="lg" className="w-full sm:w-auto h-13 px-8 text-base font-bold bg-white text-rose-950 hover:bg-rose-50 shadow-md rounded-xl">
                  <Link href="/registrar">
                    Começar agora
                  </Link>
                </Button>
                <Button asChild size="lg" className="w-full sm:w-auto h-13 px-7 text-base font-semibold border-2 border-white/40 bg-white/10 text-white hover:bg-white/25 hover:text-white rounded-xl backdrop-blur-xs transition-colors">
                  <Link href="/login">
                    Já possuo conta
                  </Link>
                </Button>
              </div>

              <p className="text-xs text-rose-200/80 pt-1">
                Acesso imediato • Funciona no celular • Sem necessidade de maquininha
              </p>

            </div>
          </div>
        </section>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          12. FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-rose-200/60 bg-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-rose-800 text-white flex items-center justify-center font-bold text-xs">
                  ✨
                </div>
                <span className="font-extrabold text-base text-slate-900">
                  Trança<span className="text-rose-800">Flow</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">
                A ferramenta profissional de atendimento, orçamento e agendamento para trancistas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 font-medium">
              <a href="#como-funciona" className="hover:text-rose-900 transition-colors">
                Como Funciona
              </a>
              <a href="#funcionalidades" className="hover:text-rose-900 transition-colors">
                Funcionalidades
              </a>
              <a href="#catalogo" className="hover:text-rose-900 transition-colors">
                Catálogo
              </a>
              <Link href="/login" className="hover:text-rose-900 transition-colors font-bold text-rose-800">
                Acessar Painel
              </Link>
              <Link href="/registrar" className="hover:text-rose-900 transition-colors font-bold text-rose-800">
                Criar Conta
              </Link>
            </div>

          </div>

          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} TrançaFlow. Todos os direitos reservados.</p>

            <div className="flex items-center gap-4 text-slate-500">
              <span>Termos de Uso</span>
              <span>•</span>
              <span>Política de Privacidade</span>
              <span>•</span>
              <span>Suporte ao Profissional</span>
              {saude?.status && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium ml-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Sistema Online
                </span>
              )}
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
