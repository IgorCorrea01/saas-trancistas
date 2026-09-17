"use client";

import { useState, useEffect } from "react";

export interface ModelosMensagemWhatsApp {
  lembrete24h: string;
  comoChegar: string;
  cuidadosPosTranca: string;
  retornoManutencao: string;
  enderecoStudio: string;
}

export const MODELOS_PADRAO_WHATSAPP: ModelosMensagemWhatsApp = {
  lembrete24h:
    "Olá {nomeCliente}, tudo bem? Aqui é do {nomeStudio}! 💖 Passando para confirmar nosso atendimento amanhã ({dataAtendimento}) às {horario} para fazer suas {nomeServico}. O saldo a ser acertado no atendimento é de {valorRestante}. Nos vemos amanhã! ✨",
  comoChegar:
    "Olá {nomeCliente}! Segue a localização do {nomeStudio} para seu atendimento de amanhã:\n\n📍 {enderecoStudio}\n\nDica: chegue com 5 minutinhos de antecedência. Qualquer dúvida me avise aqui no WhatsApp!",
  cuidadosPosTranca:
    "Olá {nomeCliente}! Amei fazer suas {nomeServico}! 🥰 Seguem algumas dicas de ouro para suas tranças durarem lindas e seu cabelo saudável:\n\n1. 💤 *Ao dormir*: Use sempre touca ou fronha de cetim para evitar frizz.\n2. 🚿 *Lavagem*: Lave apenas a raiz com shampoo diluído em água e massageie suavemente com a ponta dos dedos.\n3. ☀️ *Secagem*: Deixe secar naturalmente ao longo do dia ou use secador no ar frio. Nunca durma com a raiz úmida.\n4. 💧 *Couro cabeludo*: Borrife tônico ou água com gotinhas de óleo leve para hidratar.\n\nQualquer dúvida estou por aqui! Arrase com o visual! 👑",
  retornoManutencao:
    "Oi {nomeCliente}, tudo bem? Aqui é do {nomeStudio}! 🌸 Suas {nomeServico} já estão completando cerca de 40 dias. Para preservar a saúde dos seus fios naturais, o recomendado é fazer a retirada ou renovação do visual. Quer garantir seu horário? Acesse: {urlCatalogo}",
  enderecoStudio: "Rua Principal, 123 - Centro (ou informe seu endereço nas configurações)",
};

const CHAVE_STORAGE_WHATSAPP = "@trancas:modelos_whatsapp";

export function useModelosWhatsApp() {
  const [modelos, setModelos] = useState<ModelosMensagemWhatsApp>(MODELOS_PADRAO_WHATSAPP);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const salvo = localStorage.getItem(CHAVE_STORAGE_WHATSAPP);
        if (salvo) {
          const dados = JSON.parse(salvo);
          setModelos((prev) => ({ ...prev, ...dados }));
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const salvarModelos = (novosModelos: Partial<ModelosMensagemWhatsApp>) => {
    setModelos((prev) => {
      const atualizado = { ...prev, ...novosModelos };
      if (typeof window !== "undefined") {
        localStorage.setItem(CHAVE_STORAGE_WHATSAPP, JSON.stringify(atualizado));
      }
      return atualizado;
    });
  };

  const restaurarPadroes = () => {
    setModelos(MODELOS_PADRAO_WHATSAPP);
    if (typeof window !== "undefined") {
      localStorage.setItem(CHAVE_STORAGE_WHATSAPP, JSON.stringify(MODELOS_PADRAO_WHATSAPP));
    }
  };

  const formatarMensagem = (
    tipo: keyof Omit<ModelosMensagemWhatsApp, "enderecoStudio">,
    dados: {
      nomeCliente?: string;
      nomeStudio?: string;
      nomeServico?: string;
      dataAtendimento?: string;
      horario?: string;
      valorRestante?: string;
      urlCatalogo?: string;
    }
  ): string => {
    let template = modelos[tipo] || MODELOS_PADRAO_WHATSAPP[tipo];
    template = template
      .replace(/{nomeCliente}/g, dados.nomeCliente || "Cliente")
      .replace(/{nomeStudio}/g, dados.nomeStudio || "Studio")
      .replace(/{nomeServico}/g, dados.nomeServico || "Tranças")
      .replace(/{dataAtendimento}/g, dados.dataAtendimento || "")
      .replace(/{horario}/g, dados.horario || "")
      .replace(/{valorRestante}/g, dados.valorRestante || "R$ 0,00")
      .replace(/{enderecoStudio}/g, modelos.enderecoStudio || "Nosso endereço")
      .replace(/{urlCatalogo}/g, dados.urlCatalogo || "");
    return template;
  };

  return {
    modelos,
    salvarModelos,
    restaurarPadroes,
    formatarMensagem,
  };
}
