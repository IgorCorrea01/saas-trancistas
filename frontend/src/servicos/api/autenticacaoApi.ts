import { clienteApi } from "./clienteApi";
import { UsuarioAutenticado, PerfilUsuarioResposta } from "@/tipos/api";

export interface LoginDados {
  email: string;
  senha: string;
}

export interface RegistrarDados {
  nomeEmpresa: string;
  slug: string;
  nomeUsuario: string;
  email: string;
  senha: string;
}

export const autenticacaoApi = {
  async login(dados: LoginDados): Promise<UsuarioAutenticado> {
    const resposta = await clienteApi.post<UsuarioAutenticado>("/api/autenticacao/login", dados);
    return resposta.data;
  },

  async registrar(dados: RegistrarDados): Promise<UsuarioAutenticado> {
    const resposta = await clienteApi.post<UsuarioAutenticado>("/api/autenticacao/registrar", dados);
    return resposta.data;
  },

  async obterPerfil(): Promise<PerfilUsuarioResposta> {
    const resposta = await clienteApi.get<PerfilUsuarioResposta>("/api/autenticacao/perfil");
    return resposta.data;
  },
};
