"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Lock,
  MessageCircle,
  Scissors,
  Check,
  Ban,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import {
  useAgendamentos,
  useAtualizarStatusAgendamento,
  useBloqueios,
  useCriarBloqueio,
  useRemoverBloqueio,
} from "@/hooks/useAgenda";
import { StatusAgendamento, AgendamentoResposta } from "@/tipos/agendamentos";
import {
  formatarMoeda,
  formatarDataCompleta,
  formatarDuracaoMinutos,
  formatarTelefone,
  limparTelefone,
} from "@/utilitarios/formatadores";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/componentes/ui/card";
import { Badge } from "@/componentes/ui/badge";
import { Input } from "@/componentes/ui/input";
import { Skeleton } from "@/componentes/ui/skeleton";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/componentes/ui/dialog";

export default function PaginaAgenda() {
  const [dataFiltro, setDataFiltro] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [abaAtiva, setAbaAtiva] = useState<"todos" | "hoje" | "bloqueios">("hoje");
  const [filtroStatus, setFiltroStatus] = useState<StatusAgendamento | undefined>(undefined);

  // Modal de Bloqueio
  const [modalBloqueioAberto, setModalBloqueioAberto] = useState(false);
  const [bloqueioInicio, setBloqueioInicio] = useState("");
  const [bloqueioFim, setBloqueioFim] = useState("");
  const [bloqueioMotivo, setBloqueioMotivo] = useState("");

  // Modal de Cancelamento
  const [modalCancelarAberto, setModalCancelarAberto] = useState(false);
  const [agendamentoParaCancelar, setAgendamentoParaCancelar] = useState<string | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");

  // Queries
  const {
    data: agendamentos,
    isLoading: carregandoAgendamentos,
    isFetching: atualizandoAgendamentos,
    refetch: recarregarAgendamentos,
  } = useAgendamentos();
  const {
    data: bloqueios,
    isLoading: carregandoBloqueios,
    isFetching: atualizandoBloqueios,
    refetch: recarregarBloqueios,
  } = useBloqueios();

  // Mutations
  const atualizarStatusMutation = useAtualizarStatusAgendamento();
  const criarBloqueioMutation = useCriarBloqueio();
  const removerBloqueioMutation = useRemoverBloqueio();

  // Navegação de dias
  const navegarDia = (dias: number) => {
    const atual = new Date(dataFiltro + "T12:00:00Z");
    atual.setDate(atual.getDate() + dias);
    setDataFiltro(atual.toISOString().split("T")[0]);
  };

  const irParaHoje = () => {
    setDataFiltro(new Date().toISOString().split("T")[0]);
  };

  // Filtragem dos agendamentos
  const agendamentosFiltrados = useMemo(() => {
    if (!agendamentos) return [];

    return agendamentos.filter((item) => {
      // Filtro de data se estiver na aba hoje
      if (abaAtiva === "hoje") {
        const dataItem = new Date(item.dataInicio).toISOString().split("T")[0];
        if (dataItem !== dataFiltro) return false;
      }

      // Filtro de status
      if (filtroStatus !== undefined && item.status !== filtroStatus) {
        return false;
      }

      return true;
    }).sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime());
  }, [agendamentos, dataFiltro, abaAtiva, filtroStatus]);

  const handleAtualizarStatus = async (id: string, status: StatusAgendamento, motivo?: string) => {
    try {
      await atualizarStatusMutation.mutateAsync({
        id,
        dados: { status, motivo },
      });
      if (status === StatusAgendamento.Cancelado) {
        setModalCancelarAberto(false);
        setAgendamentoParaCancelar(null);
        setMotivoCancelamento("");
      }
    } catch (err: any) {
      alert(err?.response?.data?.mensagem || "Erro ao atualizar status do agendamento.");
    }
  };

  const handleSalvarBloqueio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bloqueioInicio || !bloqueioFim || !bloqueioMotivo.trim()) return;

    try {
      await criarBloqueioMutation.mutateAsync({
        dataInicio: new Date(bloqueioInicio).toISOString(),
        dataFim: new Date(bloqueioFim).toISOString(),
        motivo: bloqueioMotivo.trim(),
      });
      setModalBloqueioAberto(false);
      setBloqueioInicio("");
      setBloqueioFim("");
      setBloqueioMotivo("");
    } catch (err: any) {
      alert(err?.response?.data?.mensagem || "Erro ao criar bloqueio na agenda.");
    }
  };

  const handleRemoverBloqueio = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este bloqueio de horário?")) {
      await removerBloqueioMutation.mutateAsync(id);
    }
  };

  const formatarStatusBadge = (status: StatusAgendamento, descricao: string) => {
    switch (status) {
      case StatusAgendamento.Agendado:
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">{descricao}</Badge>;
      case StatusAgendamento.Confirmado:
        return <Badge className="bg-blue-600 text-white">{descricao}</Badge>;
      case StatusAgendamento.Concluido:
        return <Badge className="bg-emerald-600 text-white">{descricao}</Badge>;
      case StatusAgendamento.Cancelado:
        return <Badge variant="destructive">{descricao}</Badge>;
      case StatusAgendamento.NaoCompareceu:
        return <Badge variant="outline" className="text-slate-500 border-slate-300">{descricao}</Badge>;
      default:
        return <Badge variant="outline">{descricao}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Agenda de Atendimentos</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Gerencie seus horários, clientes marcados e bloqueios da semana.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              recarregarAgendamentos();
              recarregarBloqueios();
            }}
            disabled={atualizandoAgendamentos || atualizandoBloqueios}
            className="text-xs h-9 bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-medium gap-1.5"
            title="Atualizar agenda agora"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${atualizandoAgendamentos || atualizandoBloqueios ? "animate-spin text-rose-600" : "text-slate-500"}`} />
            <span className="hidden sm:inline">{atualizandoAgendamentos || atualizandoBloqueios ? "Atualizando..." : "Atualizar"}</span>
          </Button>

          <Button
            onClick={() => setModalBloqueioAberto(true)}
            variant="outline"
            size="sm"
            className="text-xs h-9 gap-1.5 border-slate-300 font-medium"
          >
            <Lock className="w-3.5 h-3.5 text-slate-600" />
            Bloquear Horário
          </Button>
        </div>
      </div>

      {/* Navigation & Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setAbaAtiva("hoje")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                abaAtiva === "hoje"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Visão Diária
            </button>
            <button
              onClick={() => setAbaAtiva("todos")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                abaAtiva === "todos"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Todos os Agendamentos
            </button>
            <button
              onClick={() => setAbaAtiva("bloqueios")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                abaAtiva === "bloqueios"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Bloqueios ({bloqueios?.length || 0})
            </button>
          </div>

          {/* Date controls (when daily view) */}
          {abaAtiva === "hoje" && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => navegarDia(-1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <input
                type="date"
                value={dataFiltro}
                onChange={(e) => setDataFiltro(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => navegarDia(1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={irParaHoje}
                className="text-xs text-rose-600 font-semibold h-8"
              >
                Hoje
              </Button>
            </div>
          )}
        </div>

        {/* Status Filters */}
        {abaAtiva !== "bloqueios" && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-medium text-[11px] shrink-0">Filtrar status:</span>
            <button
              onClick={() => setFiltroStatus(undefined)}
              className={`px-2.5 py-1 rounded-lg border font-medium shrink-0 ${
                filtroStatus === undefined
                  ? "bg-slate-900 border-slate-900 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroStatus(StatusAgendamento.Agendado)}
              className={`px-2.5 py-1 rounded-lg border font-medium shrink-0 ${
                filtroStatus === StatusAgendamento.Agendado
                  ? "bg-amber-600 border-amber-600 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Agendado
            </button>
            <button
              onClick={() => setFiltroStatus(StatusAgendamento.Confirmado)}
              className={`px-2.5 py-1 rounded-lg border font-medium shrink-0 ${
                filtroStatus === StatusAgendamento.Confirmado
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Confirmado
            </button>
            <button
              onClick={() => setFiltroStatus(StatusAgendamento.Concluido)}
              className={`px-2.5 py-1 rounded-lg border font-medium shrink-0 ${
                filtroStatus === StatusAgendamento.Concluido
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Concluído
            </button>
            <button
              onClick={() => setFiltroStatus(StatusAgendamento.Cancelado)}
              className={`px-2.5 py-1 rounded-lg border font-medium shrink-0 ${
                filtroStatus === StatusAgendamento.Cancelado
                  ? "bg-red-600 border-red-600 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Cancelado
            </button>
          </div>
        )}
      </div>

      {/* Content: Bloqueios */}
      {abaAtiva === "bloqueios" ? (
        <div className="space-y-3">
          {carregandoBloqueios ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          ) : !bloqueios || bloqueios.length === 0 ? (
            <EstadoVazio
              icone={Lock}
              titulo="Nenhum bloqueio cadastrado"
              descricao="Bloqueie períodos em que não poderá atender (como folgas, almoço ou cursos) para evitar agendamentos."
              acaoTexto="Adicionar Bloqueio"
              onAcao={() => setModalBloqueioAberto(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bloqueios.map((bloqueio) => (
                <Card key={bloqueio.id} className="border-slate-200 rounded-2xl shadow-xs">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">
                          Bloqueio Ativo
                        </Badge>
                        <span className="text-xs font-semibold text-slate-900">{bloqueio.motivo}</span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(bloqueio.dataInicio).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}{" "}
                        {new Date(bloqueio.dataInicio).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        até{" "}
                        {new Date(bloqueio.dataFim).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}{" "}
                        {new Date(bloqueio.dataFim).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoverBloqueio(bloqueio.id)}
                      className="text-slate-400 hover:text-red-600 h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Content: Agendamentos */
        <div className="space-y-4">
          {carregandoAgendamentos ? (
            <div className="space-y-3">
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
            </div>
          ) : agendamentosFiltrados.length === 0 ? (
            <EstadoVazio
              icone={CalendarDays}
              titulo="Nenhum agendamento encontrado"
              descricao={
                abaAtiva === "hoje"
                  ? `Não há atendimentos marcados para ${new Date(dataFiltro + "T12:00:00Z").toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}.`
                  : "Nenhum agendamento corresponde aos filtros selecionados."
              }
            />
          ) : (
            <div className="space-y-3">
              {agendamentosFiltrados.map((item) => {
                const telLimpo = limparTelefone(item.telefoneCliente);
                const inicioHora = new Date(item.dataInicio).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const fimHora = new Date(item.dataFim).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const dataFormatada = new Date(item.dataInicio).toLocaleDateString("pt-BR", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                });

                return (
                  <Card
                    key={item.id}
                    className="border-slate-200 hover:border-slate-300 transition-all rounded-2xl bg-white shadow-xs overflow-hidden"
                  >
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Time & Client */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex flex-col items-center justify-center shrink-0 text-center p-1">
                          <span className="text-xs font-bold text-rose-700">{inicioHora}</span>
                          <span className="text-[10px] text-slate-400">até</span>
                          <span className="text-[10px] font-semibold text-slate-600">{fimHora}</span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                              {item.nomeCliente}
                            </h3>
                            {formatarStatusBadge(item.status, item.statusDescricao)}
                          </div>

                          <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                            <Scissors className="w-3.5 h-3.5" />
                            {item.nomeServico} (~{formatarDuracaoMinutos(item.duracaoMinutos)})
                          </p>

                          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-0.5">
                            <span className="flex items-center gap-1 font-medium">
                              <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                              {dataFormatada}
                            </span>
                            {item.valorFinal && (
                              <span className="font-semibold text-slate-800">
                                Total: {formatarMoeda(item.valorFinal)}
                              </span>
                            )}
                            {item.valorSinal && (
                              <span className="text-rose-600 font-medium">
                                (Sinal: {formatarMoeda(item.valorSinal)})
                              </span>
                            )}
                          </div>

                          {item.observacoes && (
                            <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg mt-1.5 border border-slate-100">
                              <span className="font-semibold text-slate-700">Obs:</span> {item.observacoes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 sm:self-center shrink-0 flex-wrap border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                        {telLimpo && (
                          <a
                            href={`https://wa.me/55${telLimpo}?text=Olá ${encodeURIComponent(item.nomeCliente)}, falo do Studio sobre seu agendamento de ${encodeURIComponent(item.nomeServico)} dia ${dataFormatada}!`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            WhatsApp
                          </a>
                        )}

                        {item.status === StatusAgendamento.Agendado && (
                          <Button
                            size="sm"
                            onClick={() => handleAtualizarStatus(item.id, StatusAgendamento.Confirmado)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 font-medium gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Confirmar
                          </Button>
                        )}

                        {(item.status === StatusAgendamento.Agendado ||
                          item.status === StatusAgendamento.Confirmado) && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAtualizarStatus(item.id, StatusAgendamento.Concluido)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-medium gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Concluir
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setAgendamentoParaCancelar(item.id);
                                setModalCancelarAberto(true);
                              }}
                              className="text-xs h-8 text-slate-500 hover:text-red-600 border-slate-200"
                            >
                              Cancelar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Criar Bloqueio de Agenda */}
      <Dialog open={modalBloqueioAberto} onOpenChange={setModalBloqueioAberto}>
        <DialogContent className="max-w-md rounded-2xl">
          <form onSubmit={handleSalvarBloqueio} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg">Bloquear Horário na Agenda</DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Impeça novos agendamentos de clientes durante este intervalo de tempo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Início do Bloqueio *</label>
                <Input
                  type="datetime-local"
                  required
                  value={bloqueioInicio}
                  onChange={(e) => setBloqueioInicio(e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Fim do Bloqueio *</label>
                <Input
                  type="datetime-local"
                  required
                  value={bloqueioFim}
                  onChange={(e) => setBloqueioFim(e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Motivo / Descrição *</label>
                <Input
                  placeholder="Ex: Folga, Almoço, Curso de Tranças..."
                  required
                  value={bloqueioMotivo}
                  onChange={(e) => setBloqueioMotivo(e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="flex-row justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalBloqueioAberto(false)}
                disabled={criarBloqueioMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white font-medium"
                disabled={criarBloqueioMutation.isPending}
              >
                {criarBloqueioMutation.isPending ? "Salvando..." : "Criar Bloqueio"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Cancelar Agendamento */}
      <Dialog open={modalCancelarAberto} onOpenChange={setModalCancelarAberto}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">Cancelar Agendamento?</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              O horário será liberado novamente para outros clientes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-slate-700">Motivo do cancelamento (opcional)</label>
            <Input
              placeholder="Ex: Cliente solicitou remarcação..."
              value={motivoCancelamento}
              onChange={(e) => setMotivoCancelamento(e.target.value)}
              className="text-xs rounded-xl"
            />
          </div>

          <DialogFooter className="flex-row justify-end gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setModalCancelarAberto(false);
                setAgendamentoParaCancelar(null);
              }}
              disabled={atualizarStatusMutation.isPending}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (agendamentoParaCancelar) {
                  handleAtualizarStatus(
                    agendamentoParaCancelar,
                    StatusAgendamento.Cancelado,
                    motivoCancelamento
                  );
                }
              }}
              disabled={atualizarStatusMutation.isPending}
            >
              {atualizarStatusMutation.isPending ? "Cancelando..." : "Confirmar Cancelamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
