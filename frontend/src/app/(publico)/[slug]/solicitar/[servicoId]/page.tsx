"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useServicoPublicoDetalhes } from "@/hooks/useServicos";
import { useCriarSolicitacaoPublica } from "@/hooks/useSolicitacoes";
import { TipoPergunta, PerguntaServicoResposta } from "@/tipos/servicos";
import { RespostaItemPayload } from "@/tipos/solicitacoes";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/componentes/ui/card";
import { Badge } from "@/componentes/ui/badge";
import { Skeleton } from "@/componentes/ui/skeleton";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { CampoTexto } from "@/componentes/formulario/CampoTexto";
import { CampoNumero } from "@/componentes/formulario/CampoNumero";
import { CampoEscolhaUnica } from "@/componentes/formulario/CampoEscolhaUnica";
import { CampoMultiplasEscolhas } from "@/componentes/formulario/CampoMultiplasEscolhas";
import { CampoSimNao } from "@/componentes/formulario/CampoSimNao";
import { CampoData } from "@/componentes/formulario/CampoData";
import { CampoArquivoUpload } from "@/componentes/formulario/CampoArquivoUpload";
import { formatarTelefone, formatarDuracao, formatarMoeda } from "@/utilitarios/formatadores";
import { extrairMensagemErro } from "@/servicos/api/clienteApi";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  User,
  HelpCircle,
  Camera,
  Check,
  AlertCircle,
  FileCheck,
} from "lucide-react";

export default function PaginaSolicitarOrcamento({
  params,
}: {
  params: Promise<{ slug: string; servicoId: string }>;
}) {
  const { slug, servicoId } = use(params);
  const { data: servico, isLoading } = useServicoPublicoDetalhes(slug, servicoId);
  const criarSolicitacaoMut = useCriarSolicitacaoPublica(slug);

  // Wizard Step State
  const [etapaAtual, setEtapaAtual] = useState<number>(1);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [errosCampos, setErrosCampos] = useState<Record<string, string>>({});

  // Client Info State
  const [nomeCliente, setNomeCliente] = useState("");
  const [telefoneCliente, setTelefoneCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");
  const [observacoesCliente, setObservacoesCliente] = useState("");

  // Answers State: Record<perguntaId, string | string[]>
  const [respostasTexto, setRespostasTexto] = useState<Record<string, string>>({});
  const [respostasOpcaoUnica, setRespostasOpcaoUnica] = useState<Record<string, string>>({});
  const [respostasOpcoesMultiplas, setRespostasOpcoesMultiplas] = useState<Record<string, string[]>>({});
  const [fotosArquivos, setFotosArquivos] = useState<Record<string, File[]>>({});

  const handleMascaraTelefone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);

    if (v.length > 6) {
      v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    } else if (v.length > 2) {
      v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    } else if (v.length > 0) {
      v = `(${v}`;
    }
    setTelefoneCliente(v);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 max-w-lg mx-auto space-y-6">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (!servico) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <EstadoVazio
          icone={HelpCircle}
          titulo="Serviço não encontrado"
          descricao="O modelo de trança selecionado não está disponível neste estúdio."
          acaoTexto="Voltar ao catálogo"
          onAcao={() => (window.location.href = `/${slug}`)}
        />
      </div>
    );
  }

  const perguntasTextoEOpcoes = (servico.perguntas || []).filter(
    (p) => p.tipo !== TipoPergunta.Arquivo
  );
  const perguntasFotos = (servico.perguntas || []).filter(
    (p) => p.tipo === TipoPergunta.Arquivo
  );

  // Calcula o total de etapas com base nas perguntas configuradas
  // 1: Sobre você, 2: Perguntas (se houver), 3: Fotos (se houver), 4: Revisão
  const temPerguntasTexto = perguntasTextoEOpcoes.length > 0;
  const temFotos = perguntasFotos.length > 0;

  // Validação da Etapa 1
  const validarEtapa1 = () => {
    const erros: Record<string, string> = {};
    if (!nomeCliente.trim()) {
      erros.nome = "Informe seu nome completo.";
    }
    const telLimpo = telefoneCliente.replace(/\D/g, "");
    if (!telLimpo || telLimpo.length < 10) {
      erros.telefone = "Informe seu número de WhatsApp com DDD.";
    }
    setErrosCampos(erros);
    return Object.keys(erros).length === 0;
  };

  // Validação da Etapa 2 (Perguntas)
  const validarEtapa2 = () => {
    const erros: Record<string, string> = {};
    perguntasTextoEOpcoes.forEach((p) => {
      if (p.obrigatoria) {
        if (p.tipo === TipoPergunta.EscolhaUnica) {
          if (!respostasOpcaoUnica[p.id]) {
            erros[p.id] = "Selecione uma opção.";
          }
        } else if (p.tipo === TipoPergunta.MultiplasEscolhas) {
          if (!respostasOpcoesMultiplas[p.id] || respostasOpcoesMultiplas[p.id].length === 0) {
            erros[p.id] = "Selecione ao menos uma opção.";
          }
        } else {
          if (!respostasTexto[p.id] || !respostasTexto[p.id].trim()) {
            erros[p.id] = "Esta pergunta é obrigatória.";
          }
        }
      }
    });
    setErrosCampos(erros);
    return Object.keys(erros).length === 0;
  };

  // Validação da Etapa 3 (Fotos)
  const validarEtapa3 = () => {
    const erros: Record<string, string> = {};
    perguntasFotos.forEach((p) => {
      const arquivos = fotosArquivos[p.id] || [];
      if (p.obrigatoria && arquivos.length === 0) {
        erros[p.id] = "O envio desta foto é obrigatório para análise.";
      }
    });
    setErrosCampos(erros);
    return Object.keys(erros).length === 0;
  };

  const avancarEtapa = () => {
    setErroGeral(null);
    if (etapaAtual === 1) {
      if (!validarEtapa1()) return;
      if (temPerguntasTexto) setEtapaAtual(2);
      else if (temFotos) setEtapaAtual(3);
      else setEtapaAtual(4);
    } else if (etapaAtual === 2) {
      if (!validarEtapa2()) return;
      if (temFotos) setEtapaAtual(3);
      else setEtapaAtual(4);
    } else if (etapaAtual === 3) {
      if (!validarEtapa3()) return;
      setEtapaAtual(4);
    }
  };

  const voltarEtapa = () => {
    setErroGeral(null);
    if (etapaAtual === 4) {
      if (temFotos) setEtapaAtual(3);
      else if (temPerguntasTexto) setEtapaAtual(2);
      else setEtapaAtual(1);
    } else if (etapaAtual === 3) {
      if (temPerguntasTexto) setEtapaAtual(2);
      else setEtapaAtual(1);
    } else if (etapaAtual === 2) {
      setEtapaAtual(1);
    }
  };

  const handleFinalizarEnvio = async () => {
    try {
      setErroGeral(null);

      const formData = new FormData();
      formData.append("NomeCliente", nomeCliente.trim());
      formData.append("TelefoneCliente", telefoneCliente.replace(/\D/g, ""));
      if (emailCliente.trim()) {
        formData.append("EmailCliente", emailCliente.trim());
      }
      formData.append("ServicoId", servico.id);
      if (observacoesCliente.trim()) {
        formData.append("ObservacoesCliente", observacoesCliente.trim());
      }

      // Monta lista estruturada de respostas
      const respostasPayload: RespostaItemPayload[] = [];

      perguntasTextoEOpcoes.forEach((p) => {
        if (p.tipo === TipoPergunta.EscolhaUnica) {
          const opcId = respostasOpcaoUnica[p.id];
          if (opcId) {
            respostasPayload.push({
              perguntaServicoId: p.id,
              opcaoPerguntaId: opcId,
            });
          }
        } else if (p.tipo === TipoPergunta.MultiplasEscolhas) {
          const opcIds = respostasOpcoesMultiplas[p.id] || [];
          opcIds.forEach((opcId) => {
            respostasPayload.push({
              perguntaServicoId: p.id,
              opcaoPerguntaId: opcId,
            });
          });
        } else {
          const val = respostasTexto[p.id];
          if (val) {
            respostasPayload.push({
              perguntaServicoId: p.id,
              valorTexto: val,
            });
          }
        }
      });

      formData.append("RespostasJson", JSON.stringify(respostasPayload));

      // Anexa todos os arquivos de fotos (suporta múltiplas fotos por pergunta)
      perguntasFotos.forEach((p) => {
        const arquivos = fotosArquivos[p.id] || [];
        arquivos.forEach((file) => {
          formData.append(`pergunta_${p.id}`, file, file.name);
        });
      });

      await criarSolicitacaoMut.mutateAsync(formData);
      setEtapaAtual(5); // Tela de Sucesso
    } catch (erro) {
      setErroGeral(extrairMensagemErro(erro));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 via-background to-background py-4 sm:py-8 px-4">
      <div className="max-w-lg mx-auto space-y-5">
        {/* Topo do Wizard */}
        {etapaAtual < 5 && (
          <div className="space-y-3">
            <Link
              href={`/${slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Cancelar e voltar ao catálogo
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Solicitação de Orçamento
                </span>
                <h1 className="text-xl font-bold text-foreground">
                  {servico.nome}
                </h1>
              </div>

              <Badge variant="secondary" className="font-semibold text-xs shrink-0">
                {formatarDuracao(servico.duracaoEstimadaMinutos)}
              </Badge>
            </div>

            {/* Stepper Visual de Progresso */}
            <div className="flex items-center gap-1.5 pt-1">
              <div
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  etapaAtual >= 1 ? "bg-primary" : "bg-muted"
                }`}
              />
              {temPerguntasTexto && (
                <div
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    etapaAtual >= 2 ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
              {temFotos && (
                <div
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    etapaAtual >= 3 ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
              <div
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  etapaAtual >= 4 ? "bg-primary" : "bg-muted"
                }`}
              />
            </div>
          </div>
        )}

        {/* Banner de Erro Geral */}
        {erroGeral && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in-50">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{erroGeral}</span>
          </div>
        )}

        {/* ETAPA 1: SOBRE VOCÊ */}
        {etapaAtual === 1 && (
          <Card className="border-border/80 shadow-md animate-in fade-in-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                <User className="h-4 w-4" />
                <span>Etapa 1 — Seus Dados</span>
              </div>
              <CardTitle className="text-lg">Como a profissional pode te chamar?</CardTitle>
              <CardDescription>
                Seus dados serão usados exclusivamente para envio do orçamento e agendamento.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Seu Nome Completo *
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Maria Eduarda Silva"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  erro={!!errosCampos.nome}
                />
                {errosCampos.nome && (
                  <p className="text-xs text-destructive font-medium">{errosCampos.nome}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Seu WhatsApp com DDD *
                </label>
                <Input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={telefoneCliente}
                  onChange={handleMascaraTelefone}
                  erro={!!errosCampos.telefone}
                />
                {errosCampos.telefone && (
                  <p className="text-xs text-destructive font-medium">{errosCampos.telefone}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  E-mail (Opcional)
                </label>
                <Input
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={emailCliente}
                  onChange={(e) => setEmailCliente(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Observações ou Dúvidas (Opcional)
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Tenho couro cabeludo sensível / Gostaria de cor específica"
                  value={observacoesCliente}
                  onChange={(e) => setObservacoesCliente(e.target.value)}
                />
              </div>

              <Button
                type="button"
                className="w-full h-12 text-base font-semibold mt-4 shadow-sm"
                onClick={avancarEtapa}
              >
                Continuar
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ETAPA 2: PERGUNTAS SOBRE O CABELO E MODELO */}
        {etapaAtual === 2 && (
          <Card className="border-border/80 shadow-md animate-in fade-in-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                <Sparkles className="h-4 w-4" />
                <span>Etapa 2 — Detalhes do Cabelo</span>
              </div>
              <CardTitle className="text-lg">Informações para o cálculo do preço</CardTitle>
              <CardDescription>
                Responda com carinho para que a profissional elabore seu orçamento sob medida.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {perguntasTextoEOpcoes.map((pergunta) => {
                const erro = errosCampos[pergunta.id];

                if (pergunta.tipo === TipoPergunta.Texto) {
                  return (
                    <CampoTexto
                      key={pergunta.id}
                      pergunta={pergunta}
                      valor={respostasTexto[pergunta.id] || ""}
                      onChange={(v) =>
                        setRespostasTexto((prev) => ({ ...prev, [pergunta.id]: v }))
                      }
                      erro={erro}
                    />
                  );
                }

                if (pergunta.tipo === TipoPergunta.Numero) {
                  return (
                    <CampoNumero
                      key={pergunta.id}
                      pergunta={pergunta}
                      valor={respostasTexto[pergunta.id] || ""}
                      onChange={(v) =>
                        setRespostasTexto((prev) => ({ ...prev, [pergunta.id]: v }))
                      }
                      erro={erro}
                    />
                  );
                }

                if (pergunta.tipo === TipoPergunta.EscolhaUnica) {
                  return (
                    <CampoEscolhaUnica
                      key={pergunta.id}
                      pergunta={pergunta}
                      opcaoSelecionadaId={respostasOpcaoUnica[pergunta.id]}
                      onChange={(opcaoId) =>
                        setRespostasOpcaoUnica((prev) => ({
                          ...prev,
                          [pergunta.id]: opcaoId,
                        }))
                      }
                      erro={erro}
                    />
                  );
                }

                if (pergunta.tipo === TipoPergunta.MultiplasEscolhas) {
                  return (
                    <CampoMultiplasEscolhas
                      key={pergunta.id}
                      pergunta={pergunta}
                      opcoesSelecionadasIds={respostasOpcoesMultiplas[pergunta.id] || []}
                      onChange={(opcoesIds) =>
                        setRespostasOpcoesMultiplas((prev) => ({
                          ...prev,
                          [pergunta.id]: opcoesIds,
                        }))
                      }
                      erro={erro}
                    />
                  );
                }

                if (pergunta.tipo === TipoPergunta.SimNao) {
                  return (
                    <CampoSimNao
                      key={pergunta.id}
                      pergunta={pergunta}
                      valor={respostasTexto[pergunta.id]}
                      onChange={(val) =>
                        setRespostasTexto((prev) => ({ ...prev, [pergunta.id]: val }))
                      }
                      erro={erro}
                    />
                  );
                }

                if (pergunta.tipo === TipoPergunta.Data) {
                  return (
                    <CampoData
                      key={pergunta.id}
                      pergunta={pergunta}
                      valor={respostasTexto[pergunta.id] || ""}
                      onChange={(d) =>
                        setRespostasTexto((prev) => ({ ...prev, [pergunta.id]: d }))
                      }
                      erro={erro}
                    />
                  );
                }

                return null;
              })}

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 text-sm font-medium"
                  onClick={voltarEtapa}
                >
                  Voltar
                </Button>
                <Button
                  type="button"
                  className="flex-1 h-12 text-base font-semibold shadow-sm"
                  onClick={avancarEtapa}
                >
                  Continuar
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ETAPA 3: FOTOS DO CABELO & REFERÊNCIA */}
        {etapaAtual === 3 && (
          <Card className="border-border/80 shadow-md animate-in fade-in-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                <Camera className="h-4 w-4" />
                <span>Etapa 3 — Fotos para Análise</span>
              </div>
              <CardTitle className="text-lg">Envie fotos com boa iluminação</CardTitle>
              <CardDescription>
                A profissional precisa ver seu cabelo para avaliar o comprimento, espessura e quantidade de material.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {perguntasFotos.map((pergunta) => (
                <CampoArquivoUpload
                  key={pergunta.id}
                  pergunta={pergunta}
                  arquivos={fotosArquivos[pergunta.id] || []}
                  onChangeArquivos={(files) => {
                    setFotosArquivos((prev) => {
                      const copy = { ...prev };
                      if (files.length > 0) copy[pergunta.id] = files;
                      else delete copy[pergunta.id];
                      return copy;
                    });
                  }}
                  erro={errosCampos[pergunta.id]}
                  maxArquivos={5}
                />
              ))}

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 text-sm font-medium"
                  onClick={voltarEtapa}
                >
                  Voltar
                </Button>
                <Button
                  type="button"
                  className="flex-1 h-12 text-base font-semibold shadow-sm"
                  onClick={avancarEtapa}
                >
                  Revisar Pedido
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ETAPA 4: REVISÃO ANTES DO ENVIO */}
        {etapaAtual === 4 && (
          <Card className="border-border/80 shadow-md animate-in fade-in-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                <FileCheck className="h-4 w-4" />
                <span>Etapa Final — Revisão</span>
              </div>
              <CardTitle className="text-lg">Confirme seus dados</CardTitle>
              <CardDescription>
                Verifique se tudo está correto antes de enviar para a profissional.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 text-xs sm:text-sm">
              {/* Card Resumo do Serviço */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-sm">
                    {servico.nome}
                  </span>
                  {servico.precoBase > 0 && (
                    <span className="font-semibold text-primary">
                      A partir de {formatarMoeda(servico.precoBase)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Duração estimada: {formatarDuracao(servico.duracaoEstimadaMinutos)}
                </p>
              </div>

              {/* Dados da Cliente */}
              <div className="p-3.5 rounded-xl bg-card border border-border/70 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground block">
                  Seus Contatos
                </span>
                <p className="font-medium text-foreground">{nomeCliente}</p>
                <p className="text-muted-foreground">{telefoneCliente}</p>
                {emailCliente && <p className="text-muted-foreground">{emailCliente}</p>}
                {observacoesCliente && (
                  <p className="text-xs text-muted-foreground pt-1 italic">
                    &quot;{observacoesCliente}&quot;
                  </p>
                )}
              </div>

              {/* Fotos Anexadas */}
              {perguntasFotos.length > 0 && (
                <div className="p-3.5 rounded-xl bg-card border border-border/70 space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground block">
                    Fotos Anexadas ({Object.values(fotosArquivos).reduce((acc, curr) => acc + curr.length, 0)})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(fotosArquivos).flatMap((lista) => lista).map((file, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium"
                      >
                        <Camera className="h-3 w-3 text-primary" />
                        {file.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 text-sm font-medium"
                  onClick={voltarEtapa}
                  disabled={criarSolicitacaoMut.isPending}
                >
                  Voltar
                </Button>
                <Button
                  type="button"
                  className="flex-1 h-12 text-base font-semibold shadow-md"
                  onClick={handleFinalizarEnvio}
                  carregando={criarSolicitacaoMut.isPending}
                >
                  Enviar Solicitação
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ETAPA 5: CONFIRMAÇÃO DE SUCESSO */}
        {etapaAtual === 5 && (
          <Card className="border-border/80 shadow-md text-center p-6 sm:p-8 space-y-5 animate-in zoom-in-95">
            <div className="h-16 w-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-extrabold text-foreground">
                Solicitação Enviada!
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                A profissional recebeu suas fotos e informações. Assim que ela analisar, você receberá a proposta e o link para agendamento no WhatsApp{" "}
                <strong className="text-foreground">{formatarTelefone(telefoneCliente)}</strong>.
              </p>
            </div>

            <div className="pt-4 border-t border-border/60">
              <Button asChild className="w-full h-12 text-base font-semibold">
                <Link href={`/${slug}`}>Voltar ao Catálogo</Link>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
