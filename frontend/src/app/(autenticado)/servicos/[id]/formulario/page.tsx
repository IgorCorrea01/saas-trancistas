"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useServicoDetalhes, useConfigurarFormulario } from "@/hooks/useServicos";
import {
  TipoPergunta,
  ConfigurarPerguntaItem,
  ConfigurarOpcaoItem,
} from "@/tipos/servicos";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
import { Badge } from "@/componentes/ui/badge";
import { Skeleton } from "@/componentes/ui/skeleton";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/componentes/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  MoveUp,
  MoveDown,
  Camera,
  CheckSquare,
  HelpCircle,
  FileText,
  Hash,
  ToggleLeft,
  Calendar,
  Save,
  CheckCircle2,
} from "lucide-react";

const TIPOS_PERGUNTA_OPCOES = [
  { valor: TipoPergunta.Texto, rotulo: "Texto Livre", icone: FileText },
  { valor: TipoPergunta.Numero, rotulo: "Número", icone: Hash },
  { valor: TipoPergunta.EscolhaUnica, rotulo: "Escolha Única", icone: CheckSquare },
  { valor: TipoPergunta.MultiplasEscolhas, rotulo: "Múltiplas Escolhas", icone: CheckSquare },
  { valor: TipoPergunta.SimNao, rotulo: "Sim ou Não", icone: ToggleLeft },
  { valor: TipoPergunta.Data, rotulo: "Data", icone: Calendar },
  { valor: TipoPergunta.Arquivo, rotulo: "Upload de Foto / Arquivo", icone: Camera },
];

export default function PaginaConfigurarFormulario({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: servico, isLoading } = useServicoDetalhes(id);
  const configurarFormularioMut = useConfigurarFormulario();

  const [perguntas, setPerguntas] = useState<ConfigurarPerguntaItem[]>([]);
  const [salvoSucesso, setSalvoSucesso] = useState(false);

  // Modal State
  const [modalAberto, setModalAberto] = useState(false);
  const [indiceEditando, setIndiceEditando] = useState<number | null>(null);

  // Question Form Fields
  const [enunciado, setEnunciado] = useState("");
  const [descricaoAjuda, setDescricaoAjuda] = useState("");
  const [tipo, setTipo] = useState<TipoPergunta>(TipoPergunta.EscolhaUnica);
  const [obrigatoria, setObrigatoria] = useState(true);
  const [opcoes, setOpcoes] = useState<ConfigurarOpcaoItem[]>([]);
  const [novoTextoOpcao, setNovoTextoOpcao] = useState("");

  useEffect(() => {
    if (servico && servico.perguntas) {
      const formatadas: ConfigurarPerguntaItem[] = servico.perguntas.map((p, idx) => ({
        id: p.id,
        enunciado: p.enunciado,
        descricaoAjuda: p.descricaoAjuda || "",
        tipo: p.tipo,
        obrigatoria: p.obrigatoria,
        ordem: idx + 1,
        opcoes: (p.opcoes || []).map((o, oIdx) => ({
          id: o.id,
          texto: o.texto,
          ordem: oIdx + 1,
        })),
      }));
      setPerguntas(formatadas);
    }
  }, [servico]);

  const abrirModalNovaPergunta = () => {
    setIndiceEditando(null);
    setEnunciado("");
    setDescricaoAjuda("");
    setTipo(TipoPergunta.EscolhaUnica);
    setObrigatoria(true);
    setOpcoes([
      { texto: "Opção 1", ordem: 1 },
      { texto: "Opção 2", ordem: 2 },
    ]);
    setNovoTextoOpcao("");
    setModalAberto(true);
  };

  const abrirModalEdicaoPergunta = (idx: number) => {
    const p = perguntas[idx];
    setIndiceEditando(idx);
    setEnunciado(p.enunciado);
    setDescricaoAjuda(p.descricaoAjuda || "");
    setTipo(p.tipo);
    setObrigatoria(p.obrigatoria);
    setOpcoes([...p.opcoes]);
    setNovoTextoOpcao("");
    setModalAberto(true);
  };

  const adicionarOpcao = () => {
    if (!novoTextoOpcao.trim()) return;
    setOpcoes((prev) => [
      ...prev,
      { texto: novoTextoOpcao.trim(), ordem: prev.length + 1 },
    ]);
    setNovoTextoOpcao("");
  };

  const removerOpcao = (idxOpcao: number) => {
    setOpcoes((prev) => prev.filter((_, i) => i !== idxOpcao));
  };

  const salvarPerguntaNoEstado = () => {
    if (!enunciado.trim()) return;

    const novaPergunta: ConfigurarPerguntaItem = {
      enunciado: enunciado.trim(),
      descricaoAjuda: descricaoAjuda.trim() || null,
      tipo,
      obrigatoria,
      ordem: indiceEditando !== null ? indiceEditando + 1 : perguntas.length + 1,
      opcoes:
        tipo === TipoPergunta.EscolhaUnica || tipo === TipoPergunta.MultiplasEscolhas
          ? opcoes.map((o, i) => ({ ...o, ordem: i + 1 }))
          : [],
    };

    if (indiceEditando !== null) {
      setPerguntas((prev) => {
        const copy = [...prev];
        copy[indiceEditando] = { ...copy[indiceEditando], ...novaPergunta };
        return copy;
      });
    } else {
      setPerguntas((prev) => [...prev, novaPergunta]);
    }

    setModalAberto(false);
  };

  const moverPergunta = (idx: number, direcao: "cima" | "baixo") => {
    const destino = direcao === "cima" ? idx - 1 : idx + 1;
    if (destino < 0 || destino >= perguntas.length) return;

    setPerguntas((prev) => {
      const copy = [...prev];
      const item = copy.splice(idx, 1)[0];
      copy.splice(destino, 0, item);
      return copy.map((p, i) => ({ ...p, ordem: i + 1 }));
    });
  };

  const removerPergunta = (idx: number) => {
    setPerguntas((prev) =>
      prev.filter((_, i) => i !== idx).map((p, i) => ({ ...p, ordem: i + 1 }))
    );
  };

  const handleSalvarNoBackend = async () => {
    if (!servico) return;
    try {
      await configurarFormularioMut.mutateAsync({
        id: servico.id,
        dados: {
          perguntas: perguntas.map((p, i) => ({
            ...p,
            ordem: i + 1,
            opcoes: (p.opcoes || []).map((o, oIdx) => ({
              ...o,
              ordem: oIdx + 1,
            })),
          })),
        },
      });
      setSalvoSucesso(true);
      setTimeout(() => setSalvoSucesso(false), 3000);
    } catch {
      // erro tratado
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    );
  }

  if (!servico) {
    return (
      <EstadoVazio
        titulo="Serviço não encontrado"
        descricao="O serviço informado não existe ou foi removido."
        acaoTexto="Voltar para Serviços"
        onAcao={() => (window.location.href = "/servicos")}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in-50 pb-8">
      {/* Breadcrumb & Header */}
      <div>
        <Link
          href="/servicos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para Serviços
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Formulário de {servico.nome}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Personalize as perguntas e fotos que a cliente preencherá ao solicitar este modelo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={abrirModalNovaPergunta}
              size="sm"
              variant="outline"
              className="h-10 text-xs gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Adicionar Pergunta
            </Button>

            <Button
              onClick={handleSalvarNoBackend}
              size="sm"
              carregando={configurarFormularioMut.isPending}
              className="h-10 text-xs gap-1.5 font-semibold"
            >
              <Save className="h-4 w-4" />
              Salvar Formulário
            </Button>
          </div>
        </div>
      </div>

      {salvoSucesso && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>Formulário salvo com sucesso! As alterações já estão ativas no catálogo público.</span>
        </div>
      )}

      {/* Lista de Perguntas */}
      {perguntas.length === 0 ? (
        <EstadoVazio
          icone={HelpCircle}
          titulo="Nenhuma pergunta configurada"
          descricao="Adicione perguntas sobre o comprimento do cabelo, tipo de fibra ou solicite fotos para poder analisar os orçamentos."
          acaoTexto="Adicionar Primeira Pergunta"
          onAcao={abrirModalNovaPergunta}
        />
      ) : (
        <div className="space-y-3">
          {perguntas.map((pergunta, idx) => {
            const configTipo = TIPOS_PERGUNTA_OPCOES.find((t) => t.valor === pergunta.tipo);
            const IconeTipo = configTipo?.icone || FileText;

            return (
              <Card
                key={idx}
                className="border-border/80 hover:border-primary/40 transition-all shadow-sm"
              >
                <CardHeader className="p-4 sm:p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 overflow-hidden">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground text-xs font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="space-y-1">
                        <CardTitle className="text-base font-bold text-foreground">
                          {pergunta.enunciado}
                        </CardTitle>
                        {pergunta.descricaoAjuda && (
                          <CardDescription className="text-xs">
                            {pergunta.descricaoAjuda}
                          </CardDescription>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        disabled={idx === 0}
                        onClick={() => moverPergunta(idx, "cima")}
                        title="Mover para cima"
                      >
                        <MoveUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        disabled={idx === perguntas.length - 1}
                        onClick={() => moverPergunta(idx, "baixo")}
                        title="Mover para baixo"
                      >
                        <MoveDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => abrirModalEdicaoPergunta(idx)}
                        title="Editar pergunta"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removerPergunta(idx)}
                        title="Remover pergunta"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 pt-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <IconeTipo className="h-3 w-3 text-primary" />
                      {configTipo?.rotulo}
                    </Badge>

                    {pergunta.obrigatoria ? (
                      <Badge variant="alerta" className="text-xs">
                        Obrigatória
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Opcional
                      </Badge>
                    )}
                  </div>

                  {pergunta.opcoes && pergunta.opcoes.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {pergunta.opcoes.map((opc, oIdx) => (
                        <span
                          key={oIdx}
                          className="px-2.5 py-1 rounded-lg bg-muted text-[11px] font-medium text-foreground"
                        >
                          {opc.texto}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Adicionar / Editar Pergunta */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {indiceEditando !== null ? "Editar Pergunta" : "Nova Pergunta do Formulário"}
            </DialogTitle>
            <DialogDescription>
              Defina o texto, se é obrigatória e o tipo de resposta esperada da cliente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Enunciado da Pergunta *
              </label>
              <Input
                type="text"
                placeholder="Ex: Qual o comprimento do seu cabelo atual?"
                value={enunciado}
                onChange={(e) => setEnunciado(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Texto de Ajuda / Instrução (Opcional)
              </label>
              <Input
                type="text"
                placeholder="Ex: Foto tirada de costas com boa iluminação"
                value={descricaoAjuda}
                onChange={(e) => setDescricaoAjuda(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Tipo da Pergunta
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(Number(e.target.value) as TipoPergunta)}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {TIPOS_PERGUNTA_OPCOES.map((t) => (
                    <option key={t.valor} value={t.valor}>
                      {t.rotulo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer h-11 px-3 rounded-xl border border-input bg-card">
                  <input
                    type="checkbox"
                    checked={obrigatoria}
                    onChange={(e) => setObrigatoria(e.target.checked)}
                    className="h-4 w-4 rounded text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-medium text-foreground">
                    Resposta Obrigatória
                  </span>
                </label>
              </div>
            </div>

            {/* Editor de Opções (se Escolha Única ou Múltiplas Escolhas) */}
            {(tipo === TipoPergunta.EscolhaUnica || tipo === TipoPergunta.MultiplasEscolhas) && (
              <div className="space-y-2 pt-2 border-t border-border/60">
                <label className="text-xs font-semibold text-foreground block">
                  Opções de Resposta
                </label>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {opcoes.map((opc, opcIdx) => (
                    <div
                      key={opcIdx}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/60 text-xs"
                    >
                      <span className="font-medium">{opc.texto}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removerOpcao(opcIdx)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Input
                    type="text"
                    placeholder="Digite uma opção (ex: Curto / Chanel)"
                    value={novoTextoOpcao}
                    onChange={(e) => setNovoTextoOpcao(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        adicionarOpcao();
                      }
                    }}
                    className="h-9 text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={adicionarOpcao}
                    className="h-9 text-xs shrink-0"
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalAberto(false)}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={salvarPerguntaNoEstado}>
              {indiceEditando !== null ? "Atualizar Pergunta" : "Inserir no Formulário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
