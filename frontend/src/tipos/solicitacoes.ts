import { TipoPergunta } from "./servicos";

export enum StatusSolicitacaoOrcamento {
  AguardandoAnalise = 1,
  EmAnalise = 2,
  OrcamentoEnviado = 3,
  OrcamentoAceito = 4,
  OrcamentoRecusado = 5,
  Cancelada = 6,
}

export interface SolicitacaoOrcamentoResposta {
  id: string;
  clienteId: string;
  nomeCliente: string;
  telefoneCliente: string;
  servicoId: string;
  nomeServico: string;
  precoBaseServico: number;
  status: StatusSolicitacaoOrcamento;
  statusDescricao: string;
  totalRespostas: number;
  totalFotos: number;
  dataCriacao: string;
}

export interface RespostaSolicitacaoDetalhesResposta {
  id: string;
  perguntaServicoId: string;
  enunciadoPergunta: string;
  tipoPergunta: TipoPergunta;
  tipoPerguntaDescricao: string;
  valorTexto?: string | null;
  opcaoPerguntaId?: string | null;
  textoOpcao?: string | null;
  caminhoArquivo?: string | null;
  urlArquivo?: string | null;
}

export interface ClienteResumoResposta {
  id: string;
  nome: string;
  telefone: string;
  email?: string | null;
}

export interface SolicitacaoOrcamentoDetalhesResposta {
  id: string;
  cliente?: ClienteResumoResposta | null;
  clienteId?: string;
  nomeCliente?: string;
  telefoneCliente?: string;
  emailCliente?: string | null;
  servicoId: string;
  nomeServico: string;
  descricaoServico?: string | null;
  precoBaseServico: number;
  duracaoEstimadaMinutos: number;
  status: StatusSolicitacaoOrcamento;
  statusDescricao: string;
  observacoesCliente?: string | null;
  dataCriacao: string;
  dataAtualizacao?: string | null;
  respostas: RespostaSolicitacaoDetalhesResposta[];
}

export interface RespostaItemPayload {
  perguntaServicoId: string;
  valorTexto?: string | null;
  opcaoPerguntaId?: string | null;
}
