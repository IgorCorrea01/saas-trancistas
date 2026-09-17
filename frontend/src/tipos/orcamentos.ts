export enum StatusOrcamento {
  Pendente = 1,
  Aceito = 2,
  Recusado = 3,
  Expirado = 4,
}

export interface OrcamentoResposta {
  id: string;
  solicitacaoOrcamentoId: string;
  valorFinal: number;
  valorSinal: number;
  valorMaterial: number;
  valorRestanteNoAtendimento: number;
  descricaoMaterial?: string | null;
  formasPagamento?: string | null;
  observacoes?: string | null;
  validade: string;
  tokenPublico: string;
  urlPublica: string;
  status: StatusOrcamento;
  statusDescricao: string;
  dataCriacao: string;
}

export interface OrcamentoPublicoResposta {
  tokenPublico: string;
  nomeEmpresa: string;
  slugEmpresa: string;
  nomeCliente: string;
  nomeServico: string;
  descricaoServico?: string | null;
  duracaoEstimadaMinutos: number;
  valorFinal: number;
  valorSinal: number;
  valorMaterial: number;
  valorRestanteNoAtendimento: number;
  descricaoMaterial?: string | null;
  formasPagamento?: string | null;
  observacoes?: string | null;
  validade: string;
  expirado: boolean;
  status: StatusOrcamento;
  statusDescricao: string;
  dataCriacao: string;
}

export interface CriarOrcamentoRequisicao {
  solicitacaoOrcamentoId: string;
  valorFinal: number;
  valorSinal: number;
  valorMaterial?: number;
  descricaoMaterial?: string | null;
  formasPagamento?: string | null;
  observacoes?: string | null;
  validadeDias?: number;
}
