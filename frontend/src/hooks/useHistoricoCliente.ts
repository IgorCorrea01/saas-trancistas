"use client";

import { useMemo } from "react";
import { useSolicitacoes } from "@/hooks/useSolicitacoes";
import { useAgendamentos } from "@/hooks/useAgenda";
import { StatusSolicitacaoOrcamento, SolicitacaoOrcamentoResposta } from "@/tipos/solicitacoes";
import { StatusAgendamento, AgendamentoResposta } from "@/tipos/agendamentos";
import { limparTelefone } from "@/utilitarios/formatadores";

export interface HistoricoClienteResumo {
  totalSolicitacoes: number;
  totalAgendamentos: number;
  totalConcluidos: number;
  totalGasto: number;
  ticketMedioCliente: number;
  badgeFidelidade: {
    rotulo: string;
    variante: "default" | "secondary" | "outline" | "sucesso" | "alerta";
    descricao: string;
  };
  solicitacoesAnteriores: SolicitacaoOrcamentoResposta[];
  agendamentosAnteriores: AgendamentoResposta[];
  ultimaVisita?: string;
}

export function useHistoricoCliente(
  clienteId?: string | null,
  telefone?: string | null,
  solicitacaoAtualId?: string | null
) {
  const { data: solicitacoes = [], isLoading: carregandoSolicitacoes } = useSolicitacoes();
  const { data: agendamentos = [], isLoading: carregandoAgendamentos } = useAgendamentos();

  const historico = useMemo<HistoricoClienteResumo | null>(() => {
    if (!clienteId && !telefone) return null;

    const telLimpo = telefone ? limparTelefone(telefone) : "";

    // Filtra todas as solicitações da cliente (exceto a atual se informada)
    const solDaCliente = solicitacoes.filter((s) => {
      const matchId = clienteId && s.clienteId === clienteId;
      const matchTel = telLimpo && limparTelefone(s.telefoneCliente) === telLimpo;
      return (matchId || matchTel) && (!solicitacaoAtualId || s.id !== solicitacaoAtualId);
    });

    // Filtra todos os agendamentos da cliente
    const agendDaCliente = agendamentos.filter((a) => {
      const matchId = clienteId && a.clienteId === clienteId;
      const matchTel = telLimpo && limparTelefone(a.telefoneCliente) === telLimpo;
      return matchId || matchTel;
    });

    const agendamentosConcluidos = agendDaCliente.filter(
      (a) => a.status === StatusAgendamento.Concluido || a.status === StatusAgendamento.Confirmado
    );

    const totalGasto = agendamentosConcluidos.reduce((acc, a) => acc + (a.valorFinal || 0), 0);
    const totalConcluidos = agendamentosConcluidos.length;
    const ticketMedioCliente = totalConcluidos > 0 ? totalGasto / totalConcluidos : 0;

    // Determina badge de fidelidade
    let badgeFidelidade: HistoricoClienteResumo["badgeFidelidade"] = {
      rotulo: "Primeira Solicitação",
      variante: "secondary",
      descricao: "Nova cliente no seu estúdio",
    };

    if (totalConcluidos >= 3) {
      badgeFidelidade = {
        rotulo: "Cliente Fiel VIP 👑",
        variante: "sucesso",
        descricao: `${totalConcluidos} tranças realizadas no estúdio`,
      };
    } else if (totalConcluidos >= 1) {
      badgeFidelidade = {
        rotulo: "Cliente Recorrente ⭐",
        variante: "default",
        descricao: `Já realizou ${totalConcluidos} atendimento(s)`,
      };
    } else if (solDaCliente.length > 0) {
      badgeFidelidade = {
        rotulo: "Interessada Frequente",
        variante: "alerta",
        descricao: `Já fez ${solDaCliente.length} orçamento(s) anteriormente`,
      };
    }

    const ultimaVisita = agendDaCliente.length > 0
      ? agendDaCliente.sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime())[0]?.dataInicio
      : undefined;

    return {
      totalSolicitacoes: solDaCliente.length,
      totalAgendamentos: agendDaCliente.length,
      totalConcluidos,
      totalGasto,
      ticketMedioCliente,
      badgeFidelidade,
      solicitacoesAnteriores: solDaCliente,
      agendamentosAnteriores: agendDaCliente,
      ultimaVisita,
    };
  }, [solicitacoes, agendamentos, clienteId, telefone, solicitacaoAtualId]);

  return {
    historico,
    isLoading: carregandoSolicitacoes || carregandoAgendamentos,
  };
}
