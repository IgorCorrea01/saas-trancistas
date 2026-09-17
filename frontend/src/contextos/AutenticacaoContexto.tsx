"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UsuarioAutenticado } from "@/tipos/api";
import { autenticacaoApi, LoginDados, RegistrarDados } from "@/servicos/api/autenticacaoApi";
import { CHAVE_STORAGE_TOKEN, CHAVE_STORAGE_USUARIO } from "@/utilitarios/constantes";

interface AutenticacaoContextoTipo {
  usuario: UsuarioAutenticado | null;
  estaAutenticado: boolean;
  carregando: boolean;
  login: (dados: LoginDados) => Promise<void>;
  registrar: (dados: RegistrarDados) => Promise<void>;
  logout: () => void;
}

const AutenticacaoContexto = createContext<AutenticacaoContextoTipo | undefined>(undefined);

export function ProvedorAutenticacao({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Carrega usuário inicial do localStorage se existir
    try {
      const token = localStorage.getItem(CHAVE_STORAGE_TOKEN);
      const usuarioArmazenado = localStorage.getItem(CHAVE_STORAGE_USUARIO);

      if (token && usuarioArmazenado) {
        setUsuario(JSON.parse(usuarioArmazenado));
      }
    } catch {
      localStorage.removeItem(CHAVE_STORAGE_TOKEN);
      localStorage.removeItem(CHAVE_STORAGE_USUARIO);
    } finally {
      setCarregando(false);
    }
  }, []);

  const login = async (dados: LoginDados) => {
    const resposta = await autenticacaoApi.login(dados);
    localStorage.setItem(CHAVE_STORAGE_TOKEN, resposta.token);
    localStorage.setItem(CHAVE_STORAGE_USUARIO, JSON.stringify(resposta));
    setUsuario(resposta);
    router.push("/dashboard");
  };

  const registrar = async (dados: RegistrarDados) => {
    const resposta = await autenticacaoApi.registrar(dados);
    localStorage.setItem(CHAVE_STORAGE_TOKEN, resposta.token);
    localStorage.setItem(CHAVE_STORAGE_USUARIO, JSON.stringify(resposta));
    setUsuario(resposta);
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem(CHAVE_STORAGE_TOKEN);
    localStorage.removeItem(CHAVE_STORAGE_USUARIO);
    setUsuario(null);
    router.push("/login");
  };

  return (
    <AutenticacaoContexto.Provider
      value={{
        usuario,
        estaAutenticado: !!usuario,
        carregando,
        login,
        registrar,
        logout,
      }}
    >
      {children}
    </AutenticacaoContexto.Provider>
  );
}

export function useAutenticacao() {
  const contexto = useContext(AutenticacaoContexto);
  if (!contexto) {
    throw new Error("useAutenticacao deve ser usado dentro de um ProvedorAutenticacao.");
  }
  return contexto;
}
