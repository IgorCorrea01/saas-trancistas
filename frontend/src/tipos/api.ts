export interface RespostaErroApi {
  tipo?: string;
  mensagem: string;
  erros?: string[];
  traceId?: string;
}

export interface UsuarioAutenticado {
  usuarioId: string;
  nome: string;
  email: string;
  empresaId: string;
  nomeEmpresa: string;
  slugEmpresa: string;
  token: string;
}

export interface EmpresaResposta {
  id: string;
  nome: string;
  slug: string;
  ativa: boolean;
  dataCriacao: string;
  dataAtualizacao?: string | null;
}

export interface PerfilUsuarioResposta {
  id: string;
  nome: string;
  email: string;
  empresaId: string;
  nomeEmpresa: string;
  slugEmpresa: string;
  dataCriacao: string;
}
