"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  CreditCard,
  Package,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  HelpCircle,
  MessageCircle,
  Copy,
  Check,
  QrCode,
  Wallet,
} from "lucide-react";
import {
  useOrcamentoPublico,
  useAceitarOrcamento,
  useRecusarOrcamento,
} from "@/hooks/useOrcamentos";
import { StatusOrcamento } from "@/tipos/orcamentos";
import { formatarMoeda, formatarDataCompleta, formatarDuracaoMinutos } from "@/utilitarios/formatadores";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/componentes/ui/card";
import { Badge } from "@/componentes/ui/badge";
import { Separator } from "@/componentes/ui/separator";
import { Skeleton } from "@/componentes/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/componentes/ui/dialog";

export default function PaginaOrcamentoPublico() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const { data: orcamento, isLoading, isError } = useOrcamentoPublico(token);
  const aceitarMutation = useAceitarOrcamento();
  const recusarMutation = useRecusarOrcamento();

  const [dialogoRecusaAberto, setDialogoRecusaAberto] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [pixCopiado, setPixCopiado] = useState(false);

  // Extrai chave Pix se presente no texto de formas de pagamento
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

  const handleAceitar = async () => {
    try {
      setErroAcao(null);
      await aceitarMutation.mutateAsync(token);
      router.push(`/agendamento/${token}`);
    } catch (err: any) {
      setErroAcao(err?.response?.data?.mensagem || "Não foi possível aceitar a proposta no momento.");
    }
  };

  const handleRecusar = async () => {
    try {
      setErroAcao(null);
      await recusarMutation.mutateAsync(token);
      setDialogoRecusaAberto(false);
    } catch (err: any) {
      setErroAcao(err?.response?.data?.mensagem || "Não foi possível recusar a proposta.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-4">
          <Skeleton className="h-10 w-48 mx-auto" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !orcamento) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-6 space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl">Proposta não encontrada</CardTitle>
          <CardDescription>
            Este link de orçamento pode ser inválido ou não existe mais. Verifique com a profissional que lhe enviou o link.
          </CardDescription>
        </Card>
      </div>
    );
  }

  const isPendente = orcamento.status === StatusOrcamento.Pendente && !orcamento.expirado;
  const isAceito = orcamento.status === StatusOrcamento.Aceito;
  const isRecusado = orcamento.status === StatusOrcamento.Recusado;
  const isExpirado = orcamento.status === StatusOrcamento.Expirado || orcamento.expirado;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 via-slate-50 to-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-1">
          <Badge variant="outline" className="bg-white/80 text-rose-700 border-rose-200 px-3 py-1 text-xs font-semibold gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            {orcamento.nomeEmpresa}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 pt-1">
            Proposta de Atendimento
          </h1>
          <p className="text-sm text-slate-500">
            Preparada exclusivamente para <span className="font-semibold text-slate-800">{orcamento.nomeCliente}</span>
          </p>
        </div>

        {/* Status Alert Banner */}
        {isAceito && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-emerald-900 text-sm">Proposta Aceita!</p>
              <p className="text-xs text-emerald-700">
                Você já aceitou este orçamento. Agora escolha a melhor data e horário para seu atendimento.
              </p>
              <div className="pt-2">
                <Button
                  onClick={() => router.push(`/agendamento/${token}`)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-medium gap-1.5"
                >
                  Continuar para Agendamento
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {isRecusado && (
          <div className="bg-slate-100 border border-slate-300 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
            <XCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800 text-sm">Proposta Recusada</p>
              <p className="text-xs text-slate-600">
                Esta proposta foi recusada. Caso deseje um novo orçamento, entre em contato diretamente com o Studio.
              </p>
            </div>
          </div>
        )}

        {isExpirado && !isAceito && !isRecusado && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 text-sm">Proposta Expirada</p>
              <p className="text-xs text-amber-700">
                O prazo de validade deste orçamento ({formatarDataCompleta(orcamento.validade)}) expirou. Peça uma atualização de valores à profissional.
              </p>
            </div>
          </div>
        )}

        {erroAcao && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
            {erroAcao}
          </div>
        )}

        {/* Main Commercial Proposal Card */}
        <Card className="border-slate-200 shadow-md bg-white rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-5 text-white">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-100">
                Serviço Personalizado
              </span>
              <span className="flex items-center gap-1.5 text-xs bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full font-medium">
                <Clock className="w-3.5 h-3.5" />
                ~{formatarDuracaoMinutos(orcamento.duracaoEstimadaMinutos)}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mt-1 text-white">
              {orcamento.nomeServico}
            </h2>
            {orcamento.descricaoServico && (
              <p className="text-xs sm:text-sm text-rose-100 mt-1 line-clamp-2">
                {orcamento.descricaoServico}
              </p>
            )}
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Value Highlights */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
              <div className="flex items-baseline justify-between border-b border-slate-200 pb-3">
                <span className="text-sm font-medium text-slate-600">Valor Total do Atendimento</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {formatarMoeda(orcamento.valorFinal)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-white border border-rose-100 rounded-xl p-3 shadow-xs">
                  <span className="text-[11px] font-semibold text-rose-600 uppercase block tracking-wider">
                    Sinal para Reserva
                  </span>
                  <span className="text-lg font-bold text-slate-900 block mt-0.5">
                    {formatarMoeda(orcamento.valorSinal)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Garante o seu horário na agenda
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block tracking-wider">
                    Restante no Atendimento
                  </span>
                  <span className="text-lg font-bold text-slate-800 block mt-0.5">
                    {formatarMoeda(orcamento.valorRestanteNoAtendimento)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Pago no dia do serviço
                  </span>
                </div>
              </div>
            </div>

            {/* Material & Inclusions */}
            {(orcamento.descricaoMaterial || orcamento.valorMaterial > 0) && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-rose-600" />
                  Materiais e Cabelo
                </h4>
                <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3.5 text-xs text-slate-700 space-y-1">
                  {orcamento.descricaoMaterial && (
                    <p className="font-medium text-slate-800">{orcamento.descricaoMaterial}</p>
                  )}
                  {orcamento.valorMaterial > 0 && (
                    <p className="text-slate-600">
                      Custo de material incluso no valor total: <span className="font-semibold text-slate-900">{formatarMoeda(orcamento.valorMaterial)}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Payment Methods & Pix */}
            {orcamento.formasPagamento && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-rose-600" />
                  Formas de Pagamento & Chave Pix
                </h4>
                
                {chavePixEncontrada ? (
                  <div className="bg-gradient-to-r from-emerald-50/90 to-teal-50/90 border border-emerald-200 rounded-2xl p-4 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-emerald-600" />
                        Chave Pix para o Sinal ({formatarMoeda(orcamento.valorSinal)})
                      </span>
                      <Badge className="bg-emerald-600 text-white font-semibold text-[10px]">
                        Pagamento Instantâneo
                      </Badge>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
                      <div className="min-w-0 space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                          Chave Pix da Profissional
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

                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      {orcamento.formasPagamento}
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="whitespace-pre-line flex-1">{orcamento.formasPagamento}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopiarPix(orcamento.formasPagamento || "")}
                      className="text-xs h-8 shrink-0 text-slate-700 border-slate-200 hover:bg-slate-100 font-medium gap-1.5 self-start sm:self-auto"
                    >
                      {pixCopiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {pixCopiado ? "Copiado!" : "Copiar Dados"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Braider Observations */}
            {orcamento.observacoes && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-rose-600" />
                  Instruções e Observações
                </h4>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-700">
                  <p className="whitespace-pre-line">{orcamento.observacoes}</p>
                </div>
              </div>
            )}

            {/* Validity Information */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Válido até {formatarDataCompleta(orcamento.validade)}
              </span>
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Garantia de Preço
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Action Controls for Pending Quote */}
        {isPendente && (
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleAceitar}
              disabled={aceitarMutation.isPending}
              className="w-full h-14 text-base font-bold bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-lg shadow-rose-200 rounded-2xl gap-2 transition-all"
            >
              {aceitarMutation.isPending ? (
                "Confirmando..."
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Aceitar Proposta e Escolher Horário
                  <ChevronRight className="w-5 h-5 ml-auto" />
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => setDialogoRecusaAberto(true)}
              disabled={recusarMutation.isPending || aceitarMutation.isPending}
              className="w-full h-11 text-xs font-medium text-slate-500 hover:text-red-600 hover:border-red-200 border-slate-200 rounded-xl"
            >
              Recusar esta proposta
            </Button>
          </div>
        )}

        {/* Security / Trust Footer */}
        <div className="text-center pt-4 pb-8 space-y-2">
          <p className="text-[11px] text-slate-400">
            Ambiente seguro e verificado • {orcamento.nomeEmpresa}
          </p>
        </div>
      </div>

      {/* Confirmation Dialog for Proposal Rejection */}
      <Dialog open={dialogoRecusaAberto} onOpenChange={setDialogoRecusaAberto}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">Deseja realmente recusar esta proposta?</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 pt-1">
              Ao recusar, este orçamento será cancelado. Você poderá solicitar um novo orçamento quando desejar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-end gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogoRecusaAberto(false)}
              disabled={recusarMutation.isPending}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRecusar}
              disabled={recusarMutation.isPending}
            >
              {recusarMutation.isPending ? "Recusando..." : "Sim, Recusar Proposta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
