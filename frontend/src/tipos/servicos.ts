export enum TipoPergunta {
  Texto = 1,
  Numero = 2,
  EscolhaUnica = 3,
  MultiplasEscolhas = 4,
  SimNao = 5,
  Data = 6,
  Arquivo = 7,
}

export interface OpcaoPerguntaResposta {
  id: string;
  texto: string;
  ordem: number;
}

export interface PerguntaServicoResposta {
  id: string;
  enunciado: string;
  descricaoAjuda?: string | null;
  tipo: TipoPergunta;
  tipoDescricao: string;
  obrigatoria: boolean;
  ordem: number;
  opcoes: OpcaoPerguntaResposta[];
}

export interface ServicoResposta {
  id: string;
  nome: string;
  descricao: string;
  precoBase: number;
  duracaoEstimadaMinutos: number;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao?: string | null;
}

export interface ServicoDetalhesResposta extends ServicoResposta {
  perguntas: PerguntaServicoResposta[];
}

export interface CriarServicoRequisicao {
  nome: string;
  descricao: string;
  precoBase: number;
  duracaoEstimadaMinutos: number;
}

export interface AtualizarServicoRequisicao {
  nome: string;
  descricao: string;
  precoBase: number;
  duracaoEstimadaMinutos: number;
  ativo: boolean;
}

export interface ConfigurarOpcaoItem {
  id?: string | null;
  texto: string;
  ordem: number;
}

export interface ConfigurarPerguntaItem {
  id?: string | null;
  enunciado: string;
  descricaoAjuda?: string | null;
  tipo: TipoPergunta;
  obrigatoria: boolean;
  ordem: number;
  opcoes: ConfigurarOpcaoItem[];
}

export interface ConfigurarFormularioRequisicao {
  perguntas: ConfigurarPerguntaItem[];
}
