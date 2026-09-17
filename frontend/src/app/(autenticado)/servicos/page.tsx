"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  useServicos,
  useCriarServico,
  useAtualizarServico,
  useAlternarStatusServico,
  useRemoverServico,
  useGerarCatalogoPadrao,
} from "@/hooks/useServicos";
import { ServicoResposta } from "@/tipos/servicos";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/componentes/ui/card";
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
import { formatarMoeda, formatarDuracao } from "@/utilitarios/formatadores";
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Settings2,
  Clock,
  DollarSign,
  Wand2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Power,
  Scissors,
} from "lucide-react";

export default function PaginaServicos() {
  const [abaFiltro, setAbaFiltro] = useState<"todos" | "ativos" | "pausados">("todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [servicoEditando, setServicoEditando] = useState<ServicoResposta | null>(null);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [servicoExcluindo, setServicoExcluindo] = useState<ServicoResposta | null>(null);

  // Form State
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [precoBase, setPrecoBase] = useState<number>(0);
  const [duracaoMinutos, setDuracaoMinutos] = useState<number>(360);
  const [ativo, setAtivo] = useState<boolean>(true);
  const [erroForm, setErroForm] = useState<string | null>(null);

  // Consulta todos os serviços
  const { data: servicos = [], isLoading } = useServicos();
  const criarServicoMut = useCriarServico();
  const atualizarServicoMut = useAtualizarServico();
  const alternarStatusMut = useAlternarStatusServico();
  const removerServicoMut = useRemoverServico();
  const gerarPadraoMut = useGerarCatalogoPadrao();

  // Contadores
  const totalAtivos = useMemo(() => servicos.filter((s) => s.ativo).length, [servicos]);
  const totalPausados = useMemo(() => servicos.filter((s) => !s.ativo).length, [servicos]);

  // Lista filtrada de acordo com a aba selecionada
  const servicosExibidos = useMemo(() => {
    if (abaFiltro === "ativos") return servicos.filter((s) => s.ativo);
    if (abaFiltro === "pausados") return servicos.filter((s) => !s.ativo);
    return servicos;
  }, [servicos, abaFiltro]);

  const abrirModalCriacao = () => {
    setServicoEditando(null);
    setNome("");
    setDescricao("");
    setPrecoBase(0);
    setDuracaoMinutos(360);
    setAtivo(true);
    setErroForm(null);
    setModalAberto(true);
  };

  const abrirModalEdicao = (servico: ServicoResposta) => {
    setServicoEditando(servico);
    setNome(servico.nome);
    setDescricao(servico.descricao || "");
    setPrecoBase(servico.precoBase);
    setDuracaoMinutos(servico.duracaoEstimadaMinutos);
    setAtivo(servico.ativo);
    setErroForm(null);
    setModalAberto(true);
  };

  const abrirConfirmacaoExclusao = (servico: ServicoResposta) => {
    setServicoExcluindo(servico);
    setModalExcluirAberto(true);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErroForm("O nome do serviço é obrigatório.");
      return;
    }
    if (duracaoMinutos <= 0) {
      setErroForm("A duração estimada em minutos deve ser maior que zero.");
      return;
    }

    try {
      setErroForm(null);
      if (servicoEditando) {
        await atualizarServicoMut.mutateAsync({
          id: servicoEditando.id,
          dados: {
            nome: nome.trim(),
            descricao: descricao.trim(),
            precoBase: Number(precoBase) || 0,
            duracaoEstimadaMinutos: Number(duracaoMinutos) || 60,
            ativo,
          },
        });
      } else {
        await criarServicoMut.mutateAsync({
          nome: nome.trim(),
          descricao: descricao.trim(),
          precoBase: Number(precoBase) || 0,
          duracaoEstimadaMinutos: Number(duracaoMinutos) || 60,
        });
      }
      setModalAberto(false);
    } catch {
      setErroForm("Erro ao salvar serviço. Verifique os dados informados.");
    }
  };

  const handleExcluir = async () => {
    if (!servicoExcluindo) return;
    try {
      await removerServicoMut.mutateAsync(servicoExcluindo.id);
      setModalExcluirAberto(false);
      setServicoExcluindo(null);
    } catch {
      // erro tratado pela UI
    }
  };

  const handleAlternarStatus = async (servico: ServicoResposta) => {
    await alternarStatusMut.mutateAsync({
      id: servico.id,
      ativo: !servico.ativo,
    });
  };

  const handleGerarPadrao = async () => {
    await gerarPadraoMut.mutateAsync();
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Meus Serviços & Modelos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cadastre modelos de tranças, configure perguntas e ative/desative a exibição no catálogo público.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleGerarPadrao}
            variant="outline"
            size="sm"
            carregando={gerarPadraoMut.isPending}
            className="h-10 text-xs sm:text-sm gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
            title="Gera Box Braids, Nagô, Knotless e outros automaticamente"
          >
            <Wand2 className="h-4 w-4 text-rose-600" />
            <span className="hidden sm:inline">Gerar Catálogo Padrão</span>
            <span className="sm:hidden">Catálogo Padrão</span>
          </Button>

          <Button
            onClick={abrirModalCriacao}
            size="sm"
            className="h-10 text-xs sm:text-sm gap-1.5 font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Serviço</span>
          </Button>
        </div>
      </div>

      {/* Abas de Filtros com Contadores */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          type="button"
          onClick={() => setAbaFiltro("todos")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            abaFiltro === "todos"
              ? "bg-slate-900 text-white shadow-xs font-bold"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <span>Todos</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/60 text-slate-700 font-bold">
            {servicos.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAbaFiltro("ativos")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            abaFiltro === "ativos"
              ? "bg-emerald-600 text-white shadow-xs font-bold"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Ativos no Catálogo</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-200/60 text-emerald-800 font-bold">
            {totalAtivos}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAbaFiltro("pausados")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            abaFiltro === "pausados"
              ? "bg-amber-600 text-white shadow-xs font-bold"
              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Pausados / Ocultos</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200/60 text-amber-800 font-bold">
            {totalPausados}
          </span>
        </button>
      </div>

      {/* Lista de Serviços */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
        </div>
      ) : servicosExibidos.length === 0 ? (
        <EstadoVazio
          icone={Sparkles}
          titulo={
            abaFiltro === "pausados"
              ? "Nenhum serviço pausado"
              : abaFiltro === "ativos"
              ? "Nenhum serviço ativo no momento"
              : "Nenhum serviço cadastrado"
          }
          descricao={
            abaFiltro === "todos"
              ? "Você pode criar seu primeiro modelo manualmente ou gerar os modelos padrão em 1 clique."
              : "Alterne os filtros acima para visualizar outros serviços."
          }
          acaoTexto={abaFiltro === "todos" ? "Gerar Catálogo Padrão de Tranças" : undefined}
          onAcao={abaFiltro === "todos" ? handleGerarPadrao : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicosExibidos.map((servico) => (
            <Card
              key={servico.id}
              className={`flex flex-col justify-between transition-all rounded-2xl shadow-xs border overflow-hidden ${
                servico.ativo
                  ? "bg-white border-slate-200 hover:border-rose-300"
                  : "bg-slate-50/70 border-slate-200/80 opacity-80"
              }`}
            >
              <CardHeader className="pb-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <CardTitle className="text-base sm:text-lg font-bold text-slate-900 truncate">
                      {servico.nome}
                    </CardTitle>
                    {servico.descricao && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed break-words">
                        {servico.descricao}
                      </p>
                    )}
                  </div>

                  {/* Toggle Discreto de Ativação / Pausa */}
                  <button
                    type="button"
                    onClick={() => handleAlternarStatus(servico)}
                    disabled={alternarStatusMut.isPending}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all shrink-0 cursor-pointer ${
                      servico.ativo
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80"
                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/80"
                    }`}
                    title={
                      servico.ativo
                        ? "Serviço ativo e visível no catálogo. Clique para pausar."
                        : "Serviço pausado (oculto para clientes). Clique para ativar."
                    }
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        servico.ativo ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                    <span>{servico.ativo ? "Ativo" : "Pausado"}</span>
                  </button>
                </div>
              </CardHeader>

              <CardContent className="pb-3 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                  <span className="flex items-center gap-1.5 font-medium text-slate-500">
                    <DollarSign className="h-3.5 w-3.5 text-rose-500" />
                    Preço Base:
                  </span>
                  <span className="font-bold text-slate-900">
                    {servico.precoBase > 0 ? formatarMoeda(servico.precoBase) : "Sob consulta"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                  <span className="flex items-center gap-1.5 font-medium text-slate-500">
                    <Clock className="h-3.5 w-3.5 text-rose-500" />
                    Duração Estimada:
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatarDuracao(servico.duracaoEstimadaMinutos)}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 text-xs gap-1.5 rounded-xl font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <Link href={`/servicos/${servico.id}/formulario`}>
                    <Settings2 className="h-3.5 w-3.5 text-rose-600" />
                    Perguntas & Fotos
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-slate-500 hover:text-slate-900 rounded-xl"
                  onClick={() => abrirModalEdicao(servico)}
                  title="Editar serviço"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-slate-400 hover:text-red-600 rounded-xl"
                  onClick={() => abrirConfirmacaoExclusao(servico)}
                  title="Excluir serviço"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Criar / Editar Serviço */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {servicoEditando ? "Editar Modelo de Serviço" : "Novo Serviço de Trança"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Configure as informações e decida se o modelo deve estar ativo no catálogo público.
            </DialogDescription>
          </DialogHeader>

          {erroForm && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{erroForm}</span>
            </div>
          )}

          <form onSubmit={handleSalvar} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Nome do Modelo *
              </label>
              <Input
                type="text"
                placeholder="Ex: Box Braids Tradicional"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Descrição para a Cliente
              </label>
              <Input
                type="text"
                placeholder="Ex: Tranças soltas com divisões quadradas e acabamento fino"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Preço Base (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={precoBase || ""}
                  onChange={(e) => setPrecoBase(Number(e.target.value))}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Duração Estimada (min) *
                </label>
                <Input
                  type="number"
                  step="30"
                  min="30"
                  placeholder="360 (6h)"
                  value={duracaoMinutos || ""}
                  onChange={(e) => setDuracaoMinutos(Number(e.target.value))}
                  required
                  className="rounded-xl"
                />
                <span className="text-[11px] text-slate-400">
                  Equivale a: {formatarDuracao(duracaoMinutos)}
                </span>
              </div>
            </div>

            {/* Switch de Ativação no Modal */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="switch-ativo"
                  className="text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-rose-600" />
                  Exibir no Catálogo Público
                </label>
                <input
                  id="switch-ativo"
                  type="checkbox"
                  checked={ativo}
                  onChange={(e) => setAtivo(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Quando desativado, o serviço é pausado e não aparece no link que você envia para clientes.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalAberto(false)}
                className="rounded-xl text-xs h-10"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                carregando={criarServicoMut.isPending || atualizarServicoMut.isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs h-10 font-bold"
              >
                {servicoEditando ? "Salvar Alterações" : "Criar Serviço"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmação de Exclusão */}
      <Dialog open={modalExcluirAberto} onOpenChange={setModalExcluirAberto}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">Excluir Serviço?</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Tem certeza que deseja remover o serviço{" "}
              <strong className="text-slate-900">{servicoExcluindo?.nome}</strong>? Essa ação não poderá ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setModalExcluirAberto(false)}
              className="rounded-xl text-xs h-10"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleExcluir}
              carregando={removerServicoMut.isPending}
              className="rounded-xl text-xs h-10 font-bold"
            >
              Sim, Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
