import axios, { AxiosError } from "axios";
import { CHAVE_STORAGE_TOKEN, CHAVE_STORAGE_USUARIO } from "@/utilitarios/constantes";
import { RespostaErroApi } from "@/tipos/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5242";

export const clienteApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de Requisição: Injeta Token JWT se autenticado
clienteApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(CHAVE_STORAGE_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor de Resposta: Tratamento de Erros e 401
clienteApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError<RespostaErroApi>) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem(CHAVE_STORAGE_TOKEN);
        localStorage.removeItem(CHAVE_STORAGE_USUARIO);
        // Redireciona para login apenas se estiver numa rota protegida do painel
        if (window.location.pathname.startsWith("/dashboard") ||
            window.location.pathname.startsWith("/solicitacoes") ||
            window.location.pathname.startsWith("/agenda") ||
            window.location.pathname.startsWith("/servicos")) {
          window.location.href = "/login?expirado=1";
        }
      }
    }
    return Promise.reject(error);
  }
);

export function extrairMensagemErro(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const dados = error.response?.data as RespostaErroApi | undefined;
    if (dados?.mensagem) {
      return dados.mensagem;
    }
    if (dados?.erros && dados.erros.length > 0) {
      return dados.erros.join(", ");
    }
    if (error.response?.status === 404) {
      return "O recurso solicitado não foi encontrado.";
    }
    if (error.response?.status === 409) {
      return "Houve um conflito com os dados informados.";
    }
    if (error.response?.status === 500) {
      return "Ocorreu um erro interno no servidor. Tente novamente mais tarde.";
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Ocorreu um erro inesperado. Verifique sua conexão e tente novamente.";
}
