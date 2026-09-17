"use client";

import React, { use, useState, useMemo } from "react";
import Link from "next/link";
import { useCatalogoPublico } from "@/hooks/useServicos";
import { usePerfilProfissional } from "@/hooks/usePerfilProfissional";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/componentes/ui/card";
import { Badge } from "@/componentes/ui/badge";
import { Input } from "@/componentes/ui/input";
import { Skeleton } from "@/componentes/ui/skeleton";
import { EstadoVazio } from "@/componentes/feedback/EstadoVazio";
import { formatarMoeda, formatarDuracao } from "@/utilitarios/formatadores";
import {
  Sparkles,
  Clock,
  ArrowRight,
  Camera,
  HelpCircle,
  CheckCircle2,
  Instagram,
  MessageCircle,
  Search,
  CalendarCheck,
  ShieldCheck,
  Heart,
  Scissors,
  Check,
} from "lucide-react";

const CATEGORIAS_TRANCA = [
  { id: "todas", rotulo: "Todas", icone: "✨" },
  { id: "box-braids", rotulo: "Box Braids & French", icone: "👑" },
  { id: "nago", rotulo: "Nagô & Tribal", icone: "⚡" },
  { id: "boho-goddess", rotulo: "Gypsy & Goddess", icone: "🌸" },
  { id: "twist", rotulo: "Twist & Passion", icone: "🌀" },
  { id: "entrelace", rotulo: "Entrelace & Crochet", icone: "💇‍♀️" },
  { id: "dreads", rotulo: "Dreads & Locs", icone: "🔥" },
  { id: "penteados", rotulo: "Penteados & Cuidados", icone: "🎀" },
] as const;

function detectarCategoria(nome: string, descricao?: string): string {
  const texto = `${nome} ${descricao || ""}`.toLowerCase();
  if (texto.includes("boho") || texto.includes("gypsy") || texto.includes("goddess") || texto.includes("cachos")) return "boho-goddess";
  if (texto.includes("box") || texto.includes("knotless") || texto.includes("chanel") || texto.includes("french curl") || texto.includes("boxeadora")) return "box-braids";
  if (texto.includes("nagô") || texto.includes("nago") || texto.includes("raiz") || texto.includes("desenhada") || texto.includes("lateral") || texto.includes("topo") || texto.includes("fulani") || texto.includes("tribal")) return "nago";
  if (texto.includes("twist") || texto.includes("marley") || texto.includes("passion") || texto.includes("senegalese") || texto.includes("havana")) return "twist";
  if (texto.includes("entrelace") || texto.includes("crochet") || texto.includes("orgânic") || texto.includes("organic") || texto.includes("bio vegetal") || texto.includes("bio-vegetal")) return "entrelace";
  if (texto.includes("dread") || texto.includes("locs") || texto.includes("butterfly") || texto.includes("soft locs")) return "dreads";
  if (texto.includes("penteado") || texto.includes("infantil") || texto.includes("coque") || texto.includes("rabo") || texto.includes("tiara") || texto.includes("retirada") || texto.includes("lavagem") || texto.includes("cuidado")) return "penteados";
  return "outros";
}

export default function PaginaCatalogoPublico({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: servicos, isLoading, error } = useCatalogoPublico(slug);
  const { perfil } = usePerfilProfissional();

  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("todas");

  const nomeEstudioFormatado =
    slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase()) || "Estúdio de Tranças";

  const nomeExibicao =
    perfil.slug === slug && perfil.nomeStudio ? perfil.nomeStudio : nomeEstudioFormatado;
  const nomeProfissional =
    perfil.slug === slug && perfil.nome ? perfil.nome : "Trancista Especialista";
  const bioExibicao =
    perfil.slug === slug && perfil.bio
      ? perfil.bio
      : "Especialista em tranças afro, cuidados capilares e embelezamento personalizado.";
  const fotoPerfilExibicao = perfil.slug === slug ? perfil.fotoPerfil : "";
  const instagramExibicao = perfil.slug === slug ? perfil.instagram : "";
  const whatsappExibicao = perfil.slug === slug ? perfil.whatsapp : "";

  // Filtra serviços por busca e categoria
  const servicosFiltrados = useMemo(() => {
    if (!servicos) return [];
    
    return servicos.filter((s) => {
      // Filtro por categoria
      if (categoriaAtiva !== "todas") {
        const cat = detectarCategoria(s.nome, s.descricao);
        if (cat !== categoriaAtiva) return false;
      }

      // Filtro por termo de busca
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const bateNome = s.nome.toLowerCase().includes(termo);
        const bateDescricao = s.descricao && s.descricao.toLowerCase().includes(termo);
        if (!bateNome && !bateDescricao) return false;
      }

      return true;
    });
  }, [servicos, busca, categoriaAtiva]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 max-w-lg mx-auto space-y-6">
        {/* Skeleton Header */}
        <div className="text-center space-y-3 pt-6 pb-2">
          <Skeleton className="h-24 w-24 rounded-full mx-auto" />
          <Skeleton className="h-8 w-56 mx-auto rounded-xl" />
          <Skeleton className="h-4 w-72 mx-auto rounded-lg" />
        </div>

        {/* Skeleton Cards */}
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !servicos) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <EstadoVazio
          icone={HelpCircle}
          titulo="Estúdio não encontrado"
          descricao="O link acessado não pertence a um estúdio ativo ou o endereço está incorreto."
          acaoTexto="Ir para a página inicial"
          onAcao={() => (window.location.href = "/")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/70 via-slate-50 to-slate-50 text-slate-900">
      <div className="max-w-lg mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Cabeçalho Personalizado do Estúdio & Trancista */}
        <header className="text-center space-y-3 pt-2 pb-2">
          {/* Avatar com Anel Decorativo */}
          <div className="relative inline-block mx-auto">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white text-3xl font-extrabold mx-auto ring-2 ring-rose-200">
              {fotoPerfilExibicao ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fotoPerfilExibicao}
                  alt={nomeExibicao}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{nomeExibicao.charAt(0)}</span>
              )}
            </div>
            <span
              className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-xs"
              title="Orçamentos Abertos"
            >
              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
            </span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {nomeExibicao}
            </h1>
            <p className="text-xs font-semibold text-rose-600 flex items-center justify-center gap-1">
              <Scissors className="w-3.5 h-3.5" />
              Por {nomeProfissional}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              {bioExibicao}
            </p>
          </div>

          {/* Links Sociais e Contato */}
          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
            {instagramExibicao && (
              <a
                href={`https://instagram.com/${instagramExibicao.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <span>{instagramExibicao.startsWith("@") ? instagramExibicao : `@${instagramExibicao}`}</span>
              </a>
            )}

            {whatsappExibicao && (
              <a
                href={`https://wa.me/55${whatsappExibicao.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dúvidas no WhatsApp</span>
              </a>
            )}
          </div>
        </header>

        {/* Banner: Como Funciona o Orçamento */}
        <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold shrink-0">
              ✨
            </div>
            <span className="text-xs font-bold text-slate-900">Como funciona seu pedido:</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-[11px] text-slate-600">
            <div className="flex items-start gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-rose-600 shrink-0">1.</span>
              <span>Escolha o modelo de trança desejado</span>
            </div>
            <div className="flex items-start gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-rose-600 shrink-0">2.</span>
              <span>Envie fotos do seu cabelo para análise</span>
            </div>
            <div className="flex items-start gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-rose-600 shrink-0">3.</span>
              <span>Receba a proposta no seu WhatsApp</span>
            </div>
            <div className="flex items-start gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-rose-600 shrink-0">4.</span>
              <span>Reserve seu horário com sinal de 50%</span>
            </div>
          </div>
        </div>

        {/* Barra de Busca de Modelos */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Buscar modelo de trança..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 h-11 text-xs bg-white border-slate-200 rounded-2xl shadow-xs focus-visible:ring-rose-500/20"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Carrossel de Categorias */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
            {CATEGORIAS_TRANCA.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoriaAtiva(cat.id)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  categoriaAtiva === cat.id
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span>{cat.icone}</span>
                <span>{cat.rotulo}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-medium">
            <span>Modelos Disponíveis</span>
            <span>
              {servicosFiltrados.length}{" "}
              {servicosFiltrados.length === 1 ? "opção" : "opções"}
            </span>
          </div>
        </div>

        {/* Lista de Serviços / Catálogo */}
        <section className="space-y-4">
          {servicosFiltrados.length === 0 ? (
            <EstadoVazio
              icone={Sparkles}
              titulo={busca ? "Nenhum modelo encontrado" : "Catálogo em atualização"}
              descricao={
                busca
                  ? "Tente buscar com outro termo ou limpe a busca para ver todos os modelos."
                  : "A profissional ainda não publicou modelos ativos neste estúdio."
              }
            />
          ) : (
            <div className="space-y-4">
              {servicosFiltrados.map((servico) => {
                const totalPerguntas = servico.perguntas?.length || 0;
                const temFoto = servico.perguntas?.some((p) => p.tipo === 7); // TipoPergunta.Arquivo

                return (
                  <Card
                    key={servico.id}
                    className="overflow-hidden border-slate-200 bg-white shadow-xs hover:border-rose-400 hover:shadow-md transition-all group rounded-2xl"
                  >
                    <CardHeader className="pb-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                          {servico.nome}
                        </CardTitle>
                        {servico.precoBase > 0 && (
                          <Badge className="bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs shrink-0 px-2.5 py-0.5">
                            A partir de {formatarMoeda(servico.precoBase)}
                          </Badge>
                        )}
                      </div>
                      {servico.descricao && (
                        <CardDescription className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {servico.descricao}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="pb-3 text-xs text-slate-500 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1 font-medium">
                        <Clock className="h-3.5 w-3.5 text-rose-500" />
                        <span>~{formatarDuracao(servico.duracaoEstimadaMinutos)}</span>
                      </div>

                      {temFoto && (
                        <div className="flex items-center gap-1 text-rose-600 font-semibold bg-rose-50/80 px-2 py-0.5 rounded-md border border-rose-100">
                          <Camera className="h-3.5 w-3.5" />
                          <span>Envio de fotos</span>
                        </div>
                      )}

                      {totalPerguntas > 0 && (
                        <div className="flex items-center gap-1 text-slate-500">
                          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                          <span>Personalizável</span>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pt-0 pb-3.5 px-4">
                      <Button
                        asChild
                        className="w-full h-11 text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs group-hover:shadow-sm gap-2"
                      >
                        <Link href={`/${slug}/solicitar/${servico.id}`}>
                          <span>Solicitar Orçamento</span>
                          <ArrowRight className="h-4 w-4 ml-auto" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Selo de Garantia e Rodapé */}
        <div className="p-4 bg-slate-100/80 rounded-2xl border border-slate-200/80 text-center space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center justify-center gap-1 text-slate-800 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Atendimento Seguro & Profissional</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Orçamentos analisados individualmente pela profissional para garantir o melhor resultado para o seu cabelo.
          </p>
        </div>

        <footer className="text-center text-[11px] text-slate-400 pt-2 pb-6 space-y-1">
          <p>{nomeExibicao} • Catálogo Oficial de Tranças</p>
          <p className="text-[10px] text-slate-400">
            Powered by{" "}
            <Link href="/" className="font-bold text-rose-800 hover:underline inline-flex items-center gap-0.5">
              <Sparkles className="h-2.5 w-2.5 inline" />
              TrançaFlow
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
