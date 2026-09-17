"use client";

import { useState, useEffect } from "react";
import { useAutenticacao } from "@/hooks/useAutenticacao";

export interface PerfilProfissional {
  nome: string;
  nomeStudio: string;
  slug: string;
  fotoPerfil: string;
  bio: string;
  instagram: string;
  whatsapp: string;
  tipoChavePix?: string;
  chavePix?: string;
  titularPix?: string;
  bancoPix?: string;
}

const CHAVE_STORAGE_PERFIL = "@trancas:perfil_profissional";

export function usePerfilProfissional() {
  const { usuario } = useAutenticacao();

  const [perfil, setPerfil] = useState<PerfilProfissional>(() => {
    return {
      nome: usuario?.nome || "Profissional",
      nomeStudio: usuario?.nomeEmpresa || "Studio de Tranças",
      slug: usuario?.slugEmpresa || "meu-studio",
      fotoPerfil: "",
      bio: "Especialista em tranças afro, cuidados com o couro cabeludo e embelezamento capilar.",
      instagram: "@trancistas.app",
      whatsapp: "",
      tipoChavePix: "Celular",
      chavePix: "",
      titularPix: "",
      bancoPix: "",
    };
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const salvo = localStorage.getItem(CHAVE_STORAGE_PERFIL);
        if (salvo) {
          const dados = JSON.parse(salvo);
          setPerfil((prev) => ({
            ...prev,
            ...dados,
            nome: dados.nome || usuario?.nome || prev.nome,
            nomeStudio: dados.nomeStudio || usuario?.nomeEmpresa || prev.nomeStudio,
            slug: usuario?.slugEmpresa || dados.slug || prev.slug,
          }));
        } else if (usuario) {
          setPerfil((prev) => ({
            ...prev,
            nome: usuario.nome || prev.nome,
            nomeStudio: usuario.nomeEmpresa || prev.nomeStudio,
            slug: usuario.slugEmpresa || prev.slug,
          }));
        }
      } catch {
        // ignore
      }
    }
  }, [usuario]);

  const salvarPerfil = (novosDados: Partial<PerfilProfissional>) => {
    setPerfil((prev) => {
      const atualizado = { ...prev, ...novosDados };
      if (typeof window !== "undefined") {
        localStorage.setItem(CHAVE_STORAGE_PERFIL, JSON.stringify(atualizado));
      }
      return atualizado;
    });
  };

  return {
    perfil,
    salvarPerfil,
  };
}
