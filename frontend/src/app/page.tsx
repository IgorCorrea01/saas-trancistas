"use client";

import { useQuery } from "@tanstack/react-query";
import { clienteApi } from "@/servicos/api/clienteApi";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
import { Badge } from "@/componentes/ui/badge";
import { Sparkles, ArrowRight, ShieldCheck, CalendarCheck, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface StatusSaude {
  status: string;
  ambiente: string;
  dataHora: string;
}

export default function PaginaInicial() {
  const { data: saude, isLoading, isError } = useQuery<StatusSaude>({
    queryKey: ["saude-api"],
    queryFn: async () => {
      const resp = await clienteApi.get<StatusSaude>("/api/saude");
      return resp.data;
    },
  });

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full">
      {/* Hero Section Mobile-First */}
      <div className="text-center space-y-4 max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          <span>SaaS para Trancistas & Serviços Personalizados</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
          Orçamentos e Agendamentos sem complicação
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Sua cliente envia fotos e informações pelo celular, você precifica com sinal em segundos e a agenda previne qualquer conflito de horário.
        </p>

        {/* Status da API em Tempo Real */}
        <div className="pt-2 flex items-center justify-center gap-2">
          {isLoading ? (
            <Badge variant="secondary" className="animate-pulse">
              Verificando conexão com a API...
            </Badge>
          ) : isError ? (
            <Badge variant="destructive" className="gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              API Offline no momento
            </Badge>
          ) : (
            <Badge variant="sucesso" className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              API {saude?.status} ({saude?.ambiente})
            </Badge>
          )}
        </div>
      </div>

      {/* Grid de Acesso Rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
        <Card className="hover:border-primary/50 transition-all shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <ShieldCheck className="h-5 w-5" />
              <span>Espaço da Profissional</span>
            </div>
            <CardTitle className="text-xl">Painel de Gestão</CardTitle>
            <CardDescription>
              Acesse suas solicitações de orçamento, aprove agendamentos e acompanhe seu faturamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Button asChild className="w-full h-12 text-base font-medium">
              <Link href="/login">
                Entrar no Painel <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-all shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-sm">
              <Sparkles className="h-5 w-5" />
              <span>Novo Estúdio</span>
            </div>
            <CardTitle className="text-xl">Criar Conta Grátis</CardTitle>
            <CardDescription>
              Cadastre seu estúdio de tranças, defina seu slug personalizado e gere seu catálogo padrão.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Button asChild variant="outline" className="w-full h-12 text-base font-medium">
              <Link href="/registrar">
                Cadastrar meu Negócio
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Destaques dos Recursos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-center">
        <div className="p-4 rounded-xl bg-card border border-border/60">
          <FileText className="h-6 w-6 mx-auto text-primary mb-2" />
          <h4 className="font-semibold text-sm text-foreground mb-1">Formulário com Fotos</h4>
          <p className="text-xs text-muted-foreground">Fotos do cabelo atual e modelo de referência enviados pelo celular.</p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/60">
          <Sparkles className="h-6 w-6 mx-auto text-primary mb-2" />
          <h4 className="font-semibold text-sm text-foreground mb-1">Precificação & Sinal</h4>
          <p className="text-xs text-muted-foreground">Defina preço total, sinal de 50% e material com link público seguro.</p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/60">
          <CalendarCheck className="h-6 w-6 mx-auto text-primary mb-2" />
          <h4 className="font-semibold text-sm text-foreground mb-1">Prevenção Anti-Overbooking</h4>
          <p className="text-xs text-muted-foreground">Slots calculados pela duração da trança (ex: 6h) sem conflito de horário.</p>
        </div>
      </div>
    </main>
  );
}
