"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSolicitacoes } from "@/hooks/useSolicitacoes";
import { StatusSolicitacaoOrcamento } from "@/tipos/solicitacoes";
import { Card, CardContent } from "@/componentes/ui/card";
import { Badge } from "@/componentes/ui/badge";
import { Input } from "@/componentes/ui/input";
import { Button } from "@/componentes/ui/button";
import { Skeleton } from "@/componentes/ui/skeleton";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { formatarTelefone, formatarDataHora, formatarMoeda } from "@/utilitarios/formatadores";
import { STATUS_SOLICITACAO_CONFIG } from "@/utilitarios/constantes";
import {
  Inbox,
  Search,
  Camera,
  ArrowRight,
  Clock,
  Sparkles,
  RefreshCw,
} from "lucide-react";

const FILTROS_STATUS = [
  { valor: undefined, rotulo: "Todas" },
  { valor: StatusSolicitacaoOrcamento.AguardandoAnalise, rotulo: "Aguardando Análise" },
  { valor: StatusSolicitacaoOrcamento.EmAnalise, rotulo: "Em Análise" },
  { valor: StatusSolicitacaoOrcamento.OrcamentoEnviado, rotulo: "Orçamento Enviado" },
  { valor: StatusSolicitacaoOrcamento.OrcamentoAceito, rotulo: "Aceitas" },
  { valor: StatusSolicitacaoOrcamento.OrcamentoRecusado, rotulo: "Recusadas" },
];

export default function PaginaSolicitacoes() {
  const [statusFiltro, setStatusFiltro] = useState<StatusSolicitacaoOrcamento | undefined>(
    undefined
  );
  const [busca, setBusca] = useState("");

  const {
    data: solicitacoes,
    isLoading,
    isFetching: atualizandoSolicitacoes,
    refetch: recarregarSolicitacoes,
  } = useSolicitacoes(statusFiltro);

  const solicitacoesFiltradas = (solicitacoes || []).filter((sol) => {
    if (!busca.trim()) return true;
    const termo = busca.toLowerCase();
    const nome = sol.nomeCliente?.toLowerCase() || "";
    const tel = sol.telefoneCliente || "";
    const servico = sol.nomeServico?.toLowerCase() || "";
    return (
      nome.includes(termo) ||
      tel.includes(termo) ||
      servico.includes(termo)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Solicitações de Orçamento
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Analise as fotos, respostas das clientes e defina o valor com sinal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => recarregarSolicitacoes()}
            disabled={atualizandoSolicitacoes}
            className="text-xs h-9 bg-card border-border text-foreground hover:bg-muted font-medium gap-1.5"
            title="Atualizar solicitações agora"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${atualizandoSolicitacoes ? "animate-spin text-primary" : "text-muted-foreground"}`} />
            <span className="hidden sm:inline">{atualizandoSolicitacoes ? "Atualizando..." : "Atualizar"}</span>
          </Button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="space-y-3">
        {/* Campo de Busca */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por cliente, telefone ou modelo de trança..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10 h-11 text-sm bg-card"
          />
        </div>

        {/* Filtros em Pílulas / Abas com scroll horizontal suave no celular */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-manipulation">
          {FILTROS_STATUS.map((f) => {
            const ativo = statusFiltro === f.valor;
            return (
              <Button
                key={f.rotulo}
                variant={ativo ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs rounded-full shrink-0 font-medium px-3.5"
                onClick={() => setStatusFiltro(f.valor)}
              >
                {f.rotulo}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Lista de Solicitações */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : solicitacoesFiltradas.length === 0 ? (
        <EstadoVazio
          icone={Inbox}
          titulo="Nenhuma solicitação encontrada"
          descricao={
            busca
              ? "Nenhum resultado corresponde aos termos da sua busca."
              : "Não há solicitações neste status no momento."
          }
        />
      ) : (
        <div className="space-y-3">
          {solicitacoesFiltradas.map((sol) => {
            const configStatus = STATUS_SOLICITACAO_CONFIG[sol.status];

            return (
              <Card
                key={sol.id}
                className="hover:border-primary/50 transition-all shadow-sm group overflow-hidden"
              >
                <Link href={`/solicitacoes/${sol.id}`} className="block">
                  <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 overflow-hidden pr-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate">
                          {sol.nomeCliente}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatarTelefone(sol.telefoneCliente)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                          {sol.nomeServico}
                        </span>

                        <span>•</span>

                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatarDataHora(sol.dataCriacao)}
                        </span>

                        {sol.totalFotos > 0 && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-primary font-medium">
                              <Camera className="h-3.5 w-3.5" />
                              {sol.totalFotos} {sol.totalFotos === 1 ? "foto" : "fotos"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                      <Badge
                        variant={configStatus?.variante || "secondary"}
                        className="text-xs font-semibold px-2.5 py-1"
                      >
                        {configStatus?.rotulo || sol.statusDescricao}
                      </Badge>

                      <div className="flex items-center text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                        <span className="hidden sm:inline mr-1">Analisar</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
