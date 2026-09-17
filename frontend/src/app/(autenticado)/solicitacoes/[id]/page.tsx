"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useSolicitacaoDetalhes } from "@/hooks/useSolicitacoes";
import { useOrcamentoPorSolicitacao, useCriarOrcamento } from "@/hooks/useOrcamentos";
import { useHistoricoCliente } from "@/hooks/useHistoricoCliente";
import { usePerfilProfissional } from "@/hooks/usePerfilProfissional";
import { TipoPergunta } from "@/tipos/servicos";
import { StatusSolicitacaoOrcamento } from "@/tipos/solicitacoes";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/componentes/ui/card";
import { Badge } from "@/componentes/ui/badge";
import { Skeleton } from "@/componentes/ui/skeleton";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/componentes/ui/dialog";
import {
  formatarMoeda,
  formatarTelefone,
  formatarDataHora,
  formatarData,
  formatarDuracao,
  obterUrlImagem,
} from "@/utilitarios/formatadores";
import {
  STATUS_SOLICITACAO_CONFIG,
  STATUS_ORCAMENTO_CONFIG,
  STATUS_AGENDAMENTO_CONFIG,
} from "@/utilitarios/constantes";
import { extrairMensagemErro } from "@/servicos/api/clienteApi";
import {
  ArrowLeft,
  MessageCircle,
  Camera,
  DollarSign,
  Send,
  Copy,
  Check,
  Calendar,
  Clock,
  Sparkles,
  HelpCircle,
  FileText,
  AlertCircle,
  ExternalLink,
  Crown,
  History,
  UserCheck,
  TrendingUp,
  Scissors,
} from "lucide-react";

export default function PaginaDetalhesSolicitacao({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: solicitacao, isLoading } = useSolicitacaoDetalhes(id);
  const { data: orcamento, isLoading: carregandoOrcamento } = useOrcamentoPorSolicitacao(id);
  const criarOrcamentoMut = useCriarOrcamento();

  const clienteId = solicitacao?.cliente?.id || solicitacao?.clienteId;
  const clienteTelefone = solicitacao?.cliente?.telefone || solicitacao?.telefoneCliente;
  const { historico, isLoading: carregandoHistorico } = useHistoricoCliente(
    clienteId,
    clienteTelefone,
    solicitacao?.id
  );
  const { perfil } = usePerfilProfissional();

  // Photo Viewer Modal State
  const [fotoModalUrl, setFotoModalUrl] = useState<string | null>(null);

  // Copy Link State
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [pixCopiado, setPixCopiado] = useState(false);

  // Manual Pricing Form State
  const [valorFinal, setValorFinal] = useState<number | string>("");
  const [valorSinal, setValorSinal] = useState<number | string>("");
  const [valorMaterial, setValorMaterial] = useState<number | string>("");
  const [descricaoMaterial, setDescricaoMaterial] = useState("");
  const [formasPagamento, setFormasPagamento] = useState("Pix (Sinal de Reserva) ou Dinheiro / Cartão no Atendimento");
  const [observacoes, setObservacoes] = useState("");
  const [validadeDias, setValidadeDias] = useState(5);
  const [erroForm, setErroForm] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-40 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!solicitacao) {
    return (
      <EstadoVazio
        icone={HelpCircle}
        titulo="Solicitação não encontrada"
        descricao="Esta solicitação não existe ou você não possui permissão para acessá-la."
        acaoTexto="Voltar para Solicitações"
        onAcao={() => (window.location.href = "/solicitacoes")}
      />
    );
  }

  const configStatus = STATUS_SOLICITACAO_CONFIG[solicitacao.status];

  // Helper para calcular 50% de sinal automaticamente
  const aplicarSinal50Porcento = () => {
    const total = Number(valorFinal) || 0;
    if (total > 0) {
      setValorSinal((total / 2).toFixed(2));
    }
  };

  const valorFinalNum = Number(valorFinal) || 0;
  const valorSinalNum = Number(valorSinal) || 0;
  const saldoRestante = Math.max(0, valorFinalNum - valorSinalNum);

  const handleCriarOrcamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valorFinalNum || valorFinalNum <= 0) {
      setErroForm("O valor total do serviço deve ser maior que zero.");
      return;
    }
    if (valorSinalNum > valorFinalNum) {
      setErroForm("O valor do sinal não pode ser maior que o valor total.");
      return;
    }

    try {
      setErroForm(null);
      await criarOrcamentoMut.mutateAsync({
        solicitacaoOrcamentoId: solicitacao.id,
        valorFinal: valorFinalNum,
        valorSinal: valorSinalNum,
        valorMaterial: Number(valorMaterial) || 0,
        descricaoMaterial: descricaoMaterial.trim() || null,
        formasPagamento: formasPagamento.trim() || null,
        observacoes: observacoes.trim() || null,
        validadeDias: Number(validadeDias) || 5,
      });
    } catch (erro) {
      setErroForm(extrairMensagemErro(erro));
    }
  };

  const nomeCliente = solicitacao.cliente?.nome || solicitacao.nomeCliente || "Cliente";
  const telefoneCliente = solicitacao.cliente?.telefone || solicitacao.telefoneCliente || "";
  const emailCliente = solicitacao.cliente?.email || solicitacao.emailCliente || null;
  const telefoneLimpo = telefoneCliente ? telefoneCliente.replace(/\D/g, "") : "";

  const urlProposta = orcamento
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/orcamento/${orcamento.tokenPublico}`
    : "";

  const handleCopiarLink = () => {
    if (urlProposta) {
      navigator.clipboard.writeText(urlProposta);
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 2500);
    }
  };

  const mensagemWhatsApp = orcamento
    ? encodeURIComponent(
        `Olá ${nomeCliente}, tudo bem? Aqui é do estúdio! Analisei suas fotos e seu orçamento para ${solicitacao.nomeServico} está pronto. Você pode conferir os detalhes e escolher seu horário pelo link: ${urlProposta}`
      )
    : "";

  const linkWhatsAppCliente = telefoneLimpo
    ? `https://wa.me/55${telefoneLimpo}?text=${mensagemWhatsApp}`
    : "#";

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in-50 pb-8">
      {/* Breadcrumb & Topo */}
      <div>
        <Link
          href="/solicitacoes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para Solicitações
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                {nomeCliente}
              </h1>
              <Badge variant={configStatus?.variante || "secondary"} className="text-xs">
                {configStatus?.rotulo || solicitacao.statusDescricao}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Solicitação recebida em {formatarDataHora(solicitacao.dataCriacao)}
            </p>
          </div>

          {telefoneLimpo && (
            <Button asChild size="sm" variant="outline" className="h-10 text-xs gap-1.5 self-start">
              <a
                href={`https://wa.me/55${telefoneLimpo}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                <span>Chamar no WhatsApp</span>
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda (2/3): Detalhes, Respostas e Fotos da Cliente */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card do Serviço Solicitado */}
          <Card className="shadow-sm border-border/80">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {solicitacao.nomeServico}
                </CardTitle>
                <span className="text-xs font-semibold text-primary">
                  Duração: {formatarDuracao(solicitacao.duracaoEstimadaMinutos)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="text-xs sm:text-sm space-y-3">
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div>
                  <span className="font-semibold text-foreground block">Telefone / WhatsApp</span>
                  {telefoneCliente ? formatarTelefone(telefoneCliente) : "Não informado"}
                </div>
                {emailCliente && (
                  <div>
                    <span className="font-semibold text-foreground block">E-mail</span>
                    {emailCliente}
                  </div>
                )}
              </div>

              {solicitacao.observacoesCliente && (
                <div className="p-3 rounded-xl bg-muted/40 text-xs italic">
                  <span className="font-semibold text-foreground not-italic block mb-0.5">
                    Observações da Cliente:
                  </span>
                  &quot;{solicitacao.observacoesCliente}&quot;
                </div>
              )}
            </CardContent>
          </Card>

          {/* Respostas do Formulário */}
          <Card className="shadow-sm border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Respostas do Formulário ({solicitacao.respostas.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {solicitacao.respostas.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhuma pergunta personalizada cadastrada para este modelo.
                </p>
              ) : (
                <div className="divide-y divide-border/60 space-y-3">
                  {solicitacao.respostas.map((resp) => {
                    if (resp.tipoPergunta === TipoPergunta.Arquivo) return null; // exibido na galeria de fotos

                    return (
                      <div key={resp.id} className="pt-3 first:pt-0 space-y-1">
                        <span className="text-xs font-semibold text-muted-foreground block">
                          {resp.enunciadoPergunta}
                        </span>
                        <p className="text-sm font-medium text-foreground">
                          {resp.textoOpcao || resp.valorTexto || "Não informado"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Galeria de Fotos Enviadas pela Cliente */}
          <Card className="shadow-sm border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" />
                Fotos para Análise
              </CardTitle>
              <CardDescription className="text-xs">
                Clique nas miniaturas para ampliar e analisar comprimento e volume.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {solicitacao.respostas.filter((r) => r.caminhoArquivo).length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhuma foto anexada nesta solicitação.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {solicitacao.respostas
                    .filter((r) => r.caminhoArquivo)
                    .map((respFoto) => {
                      const urlFoto = obterUrlImagem(respFoto.caminhoArquivo);
                      return (
                        <button
                          key={respFoto.id}
                          type="button"
                          onClick={() => setFotoModalUrl(urlFoto)}
                          className="group relative rounded-2xl overflow-hidden border border-border/80 aspect-[4/3] bg-muted/40 hover:border-primary transition-all text-left shadow-xs"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={urlFoto}
                            alt={respFoto.enunciadoPergunta}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-[11px] font-semibold text-white truncate">
                            {respFoto.enunciadoPergunta}
                          </div>
                        </button>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card de Histórico da Cliente e Fidelidade */}
          <Card className="shadow-sm border-border/80 bg-gradient-to-br from-card via-card to-rose-50/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary" />
                  Histórico da Cliente
                </CardTitle>
                {historico && (
                  <Badge variant={historico.badgeFidelidade.variante} className="text-xs font-bold">
                    {historico.badgeFidelidade.rotulo}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs">
                {historico?.badgeFidelidade.descricao || "Informações de fidelidade e atendimentos anteriores"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mini KPIs da Cliente */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                  <span className="text-[11px] font-medium text-muted-foreground block">Total Investido</span>
                  <span className="text-sm font-bold text-foreground">
                    {formatarMoeda(historico?.totalGasto || 0)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                  <span className="text-[11px] font-medium text-muted-foreground block">Atendimentos</span>
                  <span className="text-sm font-bold text-foreground">
                    {historico?.totalConcluidos || 0} concluído(s)
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                  <span className="text-[11px] font-medium text-muted-foreground block">Ticket Médio</span>
                  <span className="text-sm font-bold text-foreground">
                    {formatarMoeda(historico?.ticketMedioCliente || 0)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                  <span className="text-[11px] font-medium text-muted-foreground block">Última Visita</span>
                  <span className="text-sm font-bold text-foreground truncate block">
                    {historico?.ultimaVisita ? formatarData(historico.ultimaVisita) : "Primeira vez"}
                  </span>
                </div>
              </div>

              {/* Lista de Atendimentos Anteriores se houver */}
              {historico && historico.agendamentosAnteriores.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Scissors className="h-3.5 w-3.5 text-primary" />
                    Tranças Realizadas Anteriormente:
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {historico.agendamentosAnteriores.map((ag) => (
                      <div
                        key={ag.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border/60 text-xs"
                      >
                        <div>
                          <span className="font-semibold text-foreground block">{ag.nomeServico}</span>
                          <span className="text-[11px] text-muted-foreground">
                            {formatarData(ag.dataInicio)} • {ag.statusDescricao}
                          </span>
                        </div>
                        {ag.valorFinal && (
                          <span className="font-bold text-foreground">
                            {formatarMoeda(ag.valorFinal)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orçamentos Anteriores (se houver outras solicitações) */}
              {historico && historico.solicitacoesAnteriores.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5 text-primary" />
                    Outras Solicitações Recentes ({historico.solicitacoesAnteriores.length}):
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {historico.solicitacoesAnteriores.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border/60 text-xs"
                      >
                        <div>
                          <span className="font-medium text-foreground block">{s.nomeServico}</span>
                          <span className="text-[11px] text-muted-foreground">
                            {formatarDataHora(s.dataCriacao)}
                          </span>
                        </div>
                        <Badge variant={STATUS_SOLICITACAO_CONFIG[s.status]?.variante || "secondary"} className="text-[10px]">
                          {s.statusDescricao}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {historico && historico.totalConcluidos === 0 && historico.totalSolicitacoes === 0 && (
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5 font-semibold text-primary mb-0.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Primeiro contato desta cliente!
                  </p>
                  Capriche na proposta e no atendimento para transformar este primeiro contato em uma cliente fiel.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita (1/3): Precificação Manual & Link do Orçamento */}
        <div className="space-y-6">
          {orcamento ? (
            /* Card do Orçamento Já Criado */
            <Card className="border-primary/40 shadow-md bg-gradient-to-b from-card to-secondary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold">Orçamento Gerado</CardTitle>
                  <Badge variant={STATUS_ORCAMENTO_CONFIG[orcamento.status]?.variante || "secondary"}>
                    {STATUS_ORCAMENTO_CONFIG[orcamento.status]?.rotulo || orcamento.statusDescricao}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Criado em {formatarDataHora(orcamento.dataCriacao)}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3.5 text-xs sm:text-sm">
                <div className="p-3.5 rounded-xl bg-card border border-border/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Valor Total:</span>
                    <span className="font-extrabold text-foreground text-base sm:text-lg">
                      {formatarMoeda(orcamento.valorFinal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Sinal / Reserva:</span>
                    <span className="font-bold text-primary">
                      {formatarMoeda(orcamento.valorSinal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Saldo no Atendimento:</span>
                    <span className="font-bold text-foreground">
                      {formatarMoeda(orcamento.valorRestanteNoAtendimento)}
                    </span>
                  </div>

                  {orcamento.valorMaterial > 0 && (
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                      <span className="text-muted-foreground">Material Incluso:</span>
                      <span className="font-medium text-foreground">
                        {formatarMoeda(orcamento.valorMaterial)}
                      </span>
                    </div>
                  )}
                </div>

                {orcamento.formasPagamento && (
                  <div className="text-xs">
                    <span className="font-semibold text-muted-foreground block">Formas de Pagamento:</span>
                    <span className="text-foreground">{orcamento.formasPagamento}</span>
                  </div>
                )}

                {/* Box de Envio WhatsApp */}
                <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 space-y-2.5">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5" />
                    Enviar Proposta para a Cliente
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Input
                      type="text"
                      readOnly
                      value={urlProposta}
                      className="h-9 text-xs bg-background"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={handleCopiarLink}
                      title="Copiar Link"
                    >
                      {linkCopiado ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>

                  <Button asChild className="w-full h-10 text-xs font-semibold gap-1.5">
                    <a href={linkWhatsAppCliente} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" />
                      Enviar no WhatsApp
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Formulário de Precificação Manual */
            <Card className="shadow-md border-border/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Precificar Proposta
                </CardTitle>
                <CardDescription className="text-xs">
                  Defina os valores com base na sua análise das fotos.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {erroForm && (
                  <div className="mb-3.5 p-3 rounded-xl bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{erroForm}</span>
                  </div>
                )}

                <form onSubmit={handleCriarOrcamento} className="space-y-4 text-xs sm:text-sm">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Valor Total do Serviço (R$) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="1"
                      placeholder="Ex: 350,00"
                      value={valorFinal}
                      onChange={(e) => setValorFinal(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-foreground">
                        Valor do Sinal (R$) *
                      </label>
                      <button
                        type="button"
                        onClick={aplicarSinal50Porcento}
                        className="text-[11px] text-primary font-semibold hover:underline"
                      >
                        Calcular 50%
                      </button>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Ex: 175,00"
                      value={valorSinal}
                      onChange={(e) => setValorSinal(e.target.value)}
                      required
                    />
                  </div>

                  {/* Preview do Saldo a Receber no Atendimento */}
                  <div className="p-2.5 rounded-xl bg-muted/50 border border-border/60 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Saldo no atendimento:</span>
                    <span className="font-bold text-foreground">{formatarMoeda(saldoRestante)}</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Custo do Material (Opcional)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Ex: 80,00"
                      value={valorMaterial}
                      onChange={(e) => setValorMaterial(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Descrição do Material (Opcional)
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: 4 pacotes de Jumbo Ser Mulher incluso"
                      value={descricaoMaterial}
                      onChange={(e) => setDescricaoMaterial(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-foreground">
                        Formas de Pagamento
                      </label>
                      {perfil?.chavePix && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormasPagamento(
                              `Sinal via Pix: ${perfil.chavePix} (${perfil.tipoChavePix || "Chave"}${
                                perfil.titularPix ? ` - ${perfil.titularPix}` : ""
                              }${perfil.bancoPix ? ` - ${perfil.bancoPix}` : ""}) | Restante no Atendimento (Dinheiro ou Cartão)`
                            )
                          }
                          className="text-[11px] text-emerald-600 font-semibold hover:underline"
                        >
                          + Inserir Chave Pix Cadastrada
                        </button>
                      )}
                    </div>
                    <Input
                      type="text"
                      placeholder="Ex: Pix, Cartão de Crédito em até 3x"
                      value={formasPagamento}
                      onChange={(e) => setFormasPagamento(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">
                      Validade da Proposta (dias)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      value={validadeDias}
                      onChange={(e) => setValidadeDias(Number(e.target.value))}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-sm font-semibold mt-2 shadow-sm"
                    carregando={criarOrcamentoMut.isPending}
                  >
                    Gerar Orçamento
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal Lightbox de Visualização de Fotos */}
      <Dialog open={!!fotoModalUrl} onOpenChange={() => setFotoModalUrl(null)}>
        <DialogContent className="max-w-2xl p-2 bg-black/95 border-none">
          <DialogHeader className="p-2">
            <DialogTitle className="text-white text-sm">Visualização de Foto do Cabelo</DialogTitle>
          </DialogHeader>
          <div className="relative max-h-[80vh] flex items-center justify-center overflow-hidden rounded-xl">
            {fotoModalUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fotoModalUrl}
                alt="Foto ampliada da cliente"
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
