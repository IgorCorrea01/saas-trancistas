import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5242";

export function formatarMoeda(valor?: number | null): string {
  if (valor === undefined || valor === null) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function formatarTelefone(telefone?: string | null): string {
  if (!telefone) return "";
  const numeros = telefone.replace(/\D/g, "");
  if (numeros.length === 11) {
    return numeros.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }
  if (numeros.length === 10) {
    return numeros.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }
  return telefone;
}

export function formatarDataHora(dataIso?: string | null): string {
  if (!dataIso) return "";
  try {
    const data = typeof dataIso === "string" ? parseISO(dataIso) : dataIso;
    return format(data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return dataIso;
  }
}

export function formatarData(dataIso?: string | null): string {
  if (!dataIso) return "";
  try {
    const data = typeof dataIso === "string" ? parseISO(dataIso) : dataIso;
    return format(data, "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return dataIso;
  }
}

export function formatarHora(dataIso?: string | null): string {
  if (!dataIso) return "";
  try {
    const data = typeof dataIso === "string" ? parseISO(dataIso) : dataIso;
    return format(data, "HH:mm", { locale: ptBR });
  } catch {
    return dataIso;
  }
}

export function formatarDuracao(minutos?: number | null): string {
  if (!minutos || minutos <= 0) return "A combinar";
  const horas = Math.floor(minutos / 60);
  const minRestantes = minutos % 60;

  if (horas > 0 && minRestantes > 0) {
    return `${horas}h ${minRestantes}min`;
  }
  if (horas > 0) {
    return `${horas} ${horas === 1 ? "hora" : "horas"}`;
  }
  return `${minRestantes} min`;
}

export const formatarDuracaoMinutos = formatarDuracao;

export function formatarDataCompleta(dataIso?: string | null): string {
  if (!dataIso) return "";
  try {
    const data = typeof dataIso === "string" ? parseISO(dataIso) : dataIso;
    return format(data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch {
    return dataIso;
  }
}

export function formatarDataCurta(dataIso?: string | null): string {
  if (!dataIso) return "";
  try {
    const data = typeof dataIso === "string" ? parseISO(dataIso) : dataIso;
    return format(data, "dd/MM", { locale: ptBR });
  } catch {
    return dataIso;
  }
}

export function limparTelefone(telefone?: string | null): string {
  if (!telefone) return "";
  return telefone.replace(/\D/g, "");
}

export function obterUrlImagem(caminho?: string | null): string {
  if (!caminho) return "/placeholder-image.jpg";
  if (caminho.startsWith("http://") || caminho.startsWith("https://")) {
    return caminho;
  }
  // Se for caminho relativo salvo pelo backend (ex: solicitacoes/uuid/foto.jpg)
  const caminhoLimpo = caminho.replace(/^\/+/, "");
  return `${API_BASE_URL}/api/arquivos/${caminhoLimpo}`;
}

export function formatarSlug(texto: string): string {
  if (!texto) return "";
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9]+/g, "-") // Converte espaços e caracteres especiais em hífens
    .replace(/^-+|-+$/g, ""); // Remove hífens no início e no final
}
