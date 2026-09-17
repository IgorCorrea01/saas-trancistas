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
  AlertCircle
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
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-foreground leading-tight">
                Trança<span className="text-primary">Flow</span>
              </span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Para Trancistas & Espaços Afro
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#como-funciona" className="hover:text-foreground transition-colors">
              Como Funciona
            </a>
            <a href="#recursos" className="hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="#vantagens" className="hover:text-foreground transition-colors">
              Vantagens
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Button asChild variant="ghost" size="sm" className="font-semibold text-sm">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm" className="font-semibold shadow-xs text-sm">
              <Link href="/registrar" className="gap-1.5">
                <span>Criar Catálogo</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[250px] h-[250px] bg-amber-500/10 rounded-full blur-2xl -z-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-500">
            <Sparkles className="h-4 w-4" />
            <span>A plataforma feita exclusivamente para Trancistas</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.12]">
            Pare de perder horas no Direct.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-rose-700 to-amber-700">
              Orçamentos, Sinal Pix e Agenda
            </span>{" "}
            em um só link.
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Sua cliente envia fotos do cabelo e modelo desejado pelo celular. Você precifica em segundos com sinal garantido, bloqueio automático de horário e lembretes prontos no WhatsApp.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <Button asChild size="lg" className="w-full sm:w-auto h-13 px-8 text-base font-bold shadow-md gap-2">
              <Link href="/registrar">
                <span>Criar Meu Catálogo Grátis</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-13 px-6 text-base font-semibold border-border">
              <Link href="/login">Acessar Meu Painel</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 pt-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            Sem necessidade de maquininha • Catálogo online exclusivo • Funciona no celular
          </p>

          {/* Interactive Visual Showcase / Mockup */}
          <div className="pt-8 max-w-3xl mx-auto">
            <div className="relative p-2 sm:p-3 rounded-2xl bg-gradient-to-b from-border/80 via-border/40 to-background border border-border shadow-xl">
              <div className="bg-card rounded-xl p-4 sm:p-6 text-left border border-border/60 shadow-xs">
                {/* Header Mockup */}
                <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      ✨
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Studio Afro Queen</h4>
                      <p className="text-[11px] text-muted-foreground">trancas.app/studio-afro-queen</p>
                    </div>
                  </div>
                  <Badge variant="sucesso" className="text-[10px] uppercase font-bold">
                    Orçamento Aprovado
                  </Badge>
                </div>

                {/* Body Mockup Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-secondary/50 border border-border/40">
                    <span className="text-muted-foreground block mb-1">Trança Escolhida</span>
                    <strong className="text-foreground text-sm font-semibold flex items-center gap-1">
                      <Scissors className="h-3.5 w-3.5 text-primary" />
                      Box Braids Chanel
                    </strong>
                    <span className="text-[11px] text-muted-foreground block mt-0.5">Duração estimada: 4h</span>
                  </div>

                  <div className="p-3 rounded-lg bg-secondary/50 border border-border/40">
                    <span className="text-muted-foreground block mb-1">Valor & Sinal Pix</span>
                    <div className="flex items-baseline gap-1.5">
                      <strong className="text-foreground text-sm font-bold">R$ 280,00</strong>
                      <span className="text-primary font-semibold text-[11px]">(Sinal: R$ 100,00)</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">✓ Chave Pix gerada</span>
                  </div>

                  <div className="p-3 rounded-lg bg-secondary/50 border border-border/40">
                    <span className="text-muted-foreground block mb-1">Data & Horário</span>
                    <strong className="text-foreground text-sm font-semibold flex items-center gap-1">
                      <CalendarCheck className="h-3.5 w-3.5 text-primary" />
                      Sábado, 09:00
                    </strong>
                    <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">✓ Agenda travada sem conflito</span>
                  </div>
                </div>

                {/* Footer Mockup */}
                <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                    Lembrete de 24h configurado para envio via WhatsApp
                  </span>
                  <span className="font-semibold text-primary">Zero Overbooking Garantido</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dores vs Solução */}
      <section id="vantagens" className="py-14 bg-secondary/30 border-y border-border/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Você perde tempo respondendo as mesmas coisas no WhatsApp?
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Veja a diferença de gerenciar seus atendimentos com um sistema feito sob medida:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Antes */}
            <div className="p-6 rounded-2xl bg-card border border-destructive/20 space-y-4">
              <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                <AlertCircle className="h-5 w-5" />
                <span>Atendimento Manual no Direct / WhatsApp</span>
              </div>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">✕</span>
                  <span>Pedir fotos do cabelo repetidamente e perder mensagens no chat.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">✕</span>
                  <span>Clientes desmarcando em cima da hora sem pagar sinal de reserva.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">✕</span>
                  <span>Erros de cálculo de duração e clientes esperando horas no estúdio.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">✕</span>
                  <span>Esquecer de enviar endereço, como chegar e lembrete no dia anterior.</span>
                </li>
              </ul>
            </div>

            {/* Com o TrançaFlow */}
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/30 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Sparkles className="h-5 w-5" />
                <span>Com o TrançaFlow</span>
              </div>
              <ul className="space-y-2.5 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span><strong>Link único de catálogo</strong> com fotos, tamanhos e formulário automático.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span><strong>Sinal Pix garantido</strong> antes de travar o horário na sua agenda.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span><strong>Bloqueio inteligente por tempo</strong> prevenindo qualquer sobreposição.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span><strong>Modelos de WhatsApp com 1 clique</strong> (Lembretes, Como Chegar e Pós-Trança).</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona em 3 Passos */}
      <section id="como-funciona" className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold text-primary tracking-wider uppercase">Passo a Passo</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
              Como funciona na prática?
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Simplicidade para sua cliente solicitar e controle total para você atender.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                1
              </div>
              <h3 className="font-bold text-base text-foreground">Compartilhe seu Link</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Coloque seu link personalizado na bio do Instagram ou envie no WhatsApp. Suas clientes acessam seu catálogo visual 24 horas por dia.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                2
              </div>
              <h3 className="font-bold text-base text-foreground">Receba a Solicitação</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A cliente preenche os detalhes da trança, envia foto do cabelo natural e escolhe a data preferida de atendimento.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                3
              </div>
              <h3 className="font-bold text-base text-foreground">Envie o Valor com Sinal</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Você define o valor e o sinal em 1 clique. A cliente recebe o link para pagar o Pix e o horário é bloqueado na sua agenda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos Principais */}
      <section id="recursos" className="py-16 bg-secondary/20 border-y border-border/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold text-primary tracking-wider uppercase">Recursos Feitos Para Você</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
              Tudo que seu estúdio precisa
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Camera className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm text-foreground">Upload de Fotos do Cabelo</h4>
              <p className="text-xs text-muted-foreground">
                Avalie o tamanho real do cabelo e a referência desejada antes de passar o preço.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Wallet className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm text-foreground">Cobrança de Sinal Automática</h4>
              <p className="text-xs text-muted-foreground">
                Gere cobrança com Pix copia e cola e garanta que a cliente compareça ao agendamento.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm text-foreground">Anti-Overbooking por Duração</h4>
              <p className="text-xs text-muted-foreground">
                Tranças longas de 5h ou 8h bloqueiam automaticamente a quantidade de slots necessários.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm text-foreground">Disparos Rápidos de WhatsApp</h4>
              <p className="text-xs text-muted-foreground">
                Envie lembrete de 24h, instruções de como chegar e guia de cuidados pós-trança em 1 toque.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm text-foreground">Métricas & Faturamento</h4>
              <p className="text-xs text-muted-foreground">
                Acompanhe o total faturado no mês, agendamentos confirmados e histórico de clientes.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Smartphone className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm text-foreground">100% Otimizado para Mobile</h4>
              <p className="text-xs text-muted-foreground">
                Interface leve e fluida para você usar direto no navegador do celular, sem precisar baixar apps pesados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary via-rose-800 to-amber-900 text-white text-center shadow-xl space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Pronta para profissionalizar seus orçamentos e encher sua agenda?
            </h2>
            <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto">
              Crie seu catálogo agora mesmo em menos de 2 minutos e comece a receber solicitações organizadas.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="w-full sm:w-auto h-13 px-8 text-base font-bold bg-white text-rose-900 hover:bg-slate-100 shadow-md">
                <Link href="/registrar">
                  Cadastrar Meu Negócio Agora
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-13 px-6 text-base font-semibold border-white/40 text-white hover:bg-white/10">
                <Link href="/login">
                  Já tenho conta
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/60 bg-card py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">TrançaFlow</span>
            <span>• Plataforma de Gestão para Trancistas</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-foreground transition-colors">
              Painel Profissional
            </Link>
            <Link href="/registrar" className="hover:text-foreground transition-colors">
              Criar Conta
            </Link>
            {saude?.status && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Sistema Online ({saude.ambiente})
              </span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
