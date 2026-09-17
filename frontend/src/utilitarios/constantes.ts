import { StatusSolicitacaoOrcamento } from "@/tipos/solicitacoes";
import { StatusOrcamento } from "@/tipos/orcamentos";
import { StatusAgendamento } from "@/tipos/agendamentos";

export const CHAVE_STORAGE_TOKEN = "@trancas_saas:token";
export const CHAVE_STORAGE_USUARIO = "@trancas_saas:usuario";

export const STATUS_SOLICITACAO_CONFIG: Record<
  StatusSolicitacaoOrcamento,
  { rotulo: string; variante: "default" | "secondary" | "destructive" | "outline" | "sucesso" | "alerta" }
> = {
  [StatusSolicitacaoOrcamento.AguardandoAnalise]: {
    rotulo: "Aguardando Análise",
    variante: "alerta",
  },
  [StatusSolicitacaoOrcamento.EmAnalise]: {
    rotulo: "Em Análise",
    variante: "secondary",
  },
  [StatusSolicitacaoOrcamento.OrcamentoEnviado]: {
    rotulo: "Orçamento Enviado",
    variante: "default",
  },
  [StatusSolicitacaoOrcamento.OrcamentoAceito]: {
    rotulo: "Orçamento Aceito",
    variante: "sucesso",
  },
  [StatusSolicitacaoOrcamento.OrcamentoRecusado]: {
    rotulo: "Recusado",
    variante: "destructive",
  },
  [StatusSolicitacaoOrcamento.Cancelada]: {
    rotulo: "Cancelada",
    variante: "outline",
  },
};

export const STATUS_ORCAMENTO_CONFIG: Record<
  StatusOrcamento,
  { rotulo: string; variante: "default" | "secondary" | "destructive" | "outline" | "sucesso" | "alerta" }
> = {
  [StatusOrcamento.Pendente]: {
    rotulo: "Pendente",
    variante: "alerta",
  },
  [StatusOrcamento.Aceito]: {
    rotulo: "Aceito",
    variante: "sucesso",
  },
  [StatusOrcamento.Recusado]: {
    rotulo: "Recusado",
    variante: "destructive",
  },
  [StatusOrcamento.Expirado]: {
    rotulo: "Expirado",
    variante: "outline",
  },
};

export const STATUS_AGENDAMENTO_CONFIG: Record<
  StatusAgendamento,
  { rotulo: string; variante: "default" | "secondary" | "destructive" | "outline" | "sucesso" | "alerta" }
> = {
  [StatusAgendamento.Agendado]: {
    rotulo: "Agendado",
    variante: "secondary",
  },
  [StatusAgendamento.Confirmado]: {
    rotulo: "Confirmado",
    variante: "sucesso",
  },
  [StatusAgendamento.Concluido]: {
    rotulo: "Concluído",
    variante: "default",
  },
  [StatusAgendamento.Cancelado]: {
    rotulo: "Cancelado",
    variante: "destructive",
  },
  [StatusAgendamento.NaoCompareceu]: {
    rotulo: "Não Compareceu",
    variante: "outline",
  },
};
