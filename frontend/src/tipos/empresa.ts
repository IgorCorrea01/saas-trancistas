export interface EmpresaResposta {
  id: string;
  nome: string;
  slug: string;
  ativa: boolean;
  horarioAbertura?: string;
  horarioFechamento?: string;
  diasFuncionamento?: string;
  intervaloMinutos?: number;
  dataCriacao: string;
  dataAtualizacao?: string | null;
}

export interface AtualizarEmpresaRequisicao {
  nome: string;
  slug: string;
  horarioAbertura?: string;
  horarioFechamento?: string;
  diasFuncionamento?: string;
  intervaloMinutos?: number;
}
