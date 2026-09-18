"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Store,
  Link2,
  Copy,
  Check,
  ExternalLink,
  Shield,
  User,
  LogOut,
  Save,
  AlertCircle,
  CheckCircle2,
  Camera,
  Instagram,
  Phone,
  Image as ImageIcon,
  HeartHandshake,
  QrCode,
  Wallet,
  Building2,
  Clock,
  CalendarDays,
  MessageCircle,
  MapPin,
  RotateCcw,
} from "lucide-react";
import { useEmpresaAtual, useAtualizarEmpresa } from "@/hooks/useEmpresa";
import { useAutenticacao } from "@/hooks/useAutenticacao";
import { usePerfilProfissional } from "@/hooks/usePerfilProfissional";
import { useModelosWhatsApp } from "@/hooks/useModelosWhatsApp";
import { Button } from "@/componentes/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/componentes/ui/card";
import { Input } from "@/componentes/ui/input";
import { Badge } from "@/componentes/ui/badge";
import { Skeleton } from "@/componentes/ui/skeleton";
import { Separator } from "@/componentes/ui/separator";
import { formatarSlug } from "@/utilitarios/formatadores";
import { extrairMensagemErro } from "@/servicos/api/clienteApi";

async function comprimirImagemParaAvatar(arquivo: File, maxDimensao = 360, qualidade = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxDimensao) {
            height = Math.round((height * maxDimensao) / width);
            width = maxDimensao;
          }
        } else {
          if (height > maxDimensao) {
            width = Math.round((width * maxDimensao) / height);
            height = maxDimensao;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(src);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", qualidade);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(arquivo);
  });
}

const DIAS_SEMANA_OPCOES = [
  { id: "1", nome: "Segunda", sigla: "Seg" },
  { id: "2", nome: "Terça", sigla: "Ter" },
  { id: "3", nome: "Quarta", sigla: "Qua" },
  { id: "4", nome: "Quinta", sigla: "Qui" },
  { id: "5", nome: "Sexta", sigla: "Sex" },
  { id: "6", nome: "Sábado", sigla: "Sáb" },
  { id: "0", nome: "Domingo", sigla: "Dom" },
];

export default function PaginaConfiguracoes() {
  const { usuario, logout } = useAutenticacao();
  const { data: empresa, isLoading: carregandoEmpresa } = useEmpresaAtual();
  const { perfil, salvarPerfil } = usePerfilProfissional();
  const { modelos, salvarModelos, restaurarPadroes } = useModelosWhatsApp();
  const atualizarEmpresaMutation = useAtualizarEmpresa();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [nomeProfissional, setNomeProfissional] = useState("");
  const [nomeStudio, setNomeStudio] = useState("");
  const [slug, setSlug] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [tipoChavePix, setTipoChavePix] = useState("Celular");
  const [chavePix, setChavePix] = useState("");
  const [titularPix, setTitularPix] = useState("");
  const [bancoPix, setBancoPix] = useState("");

  // Working Hours State
  const [horarioAbertura, setHorarioAbertura] = useState("08:00");
  const [horarioFechamento, setHorarioFechamento] = useState("19:00");
  const [diasFuncionamento, setDiasFuncionamento] = useState<string[]>(["1", "2", "3", "4", "5", "6"]);
  const [intervaloMinutos, setIntervaloMinutos] = useState(60);

  // WhatsApp Messages State
  const [enderecoStudio, setEnderecoStudio] = useState("");
  const [msgLembrete24h, setMsgLembrete24h] = useState("");
  const [msgComoChegar, setMsgComoChegar] = useState("");
  const [msgCuidadosPosTranca, setMsgCuidadosPosTranca] = useState("");
  const [msgRetornoManutencao, setMsgRetornoManutencao] = useState("");

  const [copiado, setCopiado] = useState(false);
  const [copiadoPix, setCopiadoPix] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const inicializadoRef = React.useRef(false);

  useEffect(() => {
    if (!inicializadoRef.current && (perfil || empresa)) {
      if (empresa?.nome || perfil.nomeStudio) setNomeStudio(empresa?.nome || perfil.nomeStudio || "");
      if (empresa?.slug || perfil.slug) setSlug(empresa?.slug || perfil.slug || "");
      if (perfil.nome || usuario?.nome) setNomeProfissional(perfil.nome || usuario?.nome || "");
      if (perfil.fotoPerfil) setFotoPerfil(perfil.fotoPerfil);
      if (perfil.bio) setBio(perfil.bio);
      if (perfil.instagram) setInstagram(perfil.instagram);
      if (perfil.whatsapp) setWhatsapp(perfil.whatsapp);
      if (perfil.tipoChavePix) setTipoChavePix(perfil.tipoChavePix);
      if (perfil.chavePix) setChavePix(perfil.chavePix);
      if (perfil.titularPix) setTitularPix(perfil.titularPix);
      if (perfil.bancoPix) setBancoPix(perfil.bancoPix);

      if (empresa) {
        if (empresa.horarioAbertura) setHorarioAbertura(empresa.horarioAbertura);
        if (empresa.horarioFechamento) setHorarioFechamento(empresa.horarioFechamento);
        if (empresa.diasFuncionamento) {
          setDiasFuncionamento(empresa.diasFuncionamento.split(",").map((d) => d.trim()));
        }
        if (empresa.intervaloMinutos) setIntervaloMinutos(empresa.intervaloMinutos);
      }

      if (modelos) {
        if (modelos.enderecoStudio) setEnderecoStudio(modelos.enderecoStudio);
        if (modelos.lembrete24h) setMsgLembrete24h(modelos.lembrete24h);
        if (modelos.comoChegar) setMsgComoChegar(modelos.comoChegar);
        if (modelos.cuidadosPosTranca) setMsgCuidadosPosTranca(modelos.cuidadosPosTranca);
        if (modelos.retornoManutencao) setMsgRetornoManutencao(modelos.retornoManutencao);
      }

      inicializadoRef.current = true;
    }
  }, [perfil, empresa, usuario, modelos]);

  const toggleDiaSemana = (idDia: string) => {
    setDiasFuncionamento((prev) =>
      prev.includes(idDia) ? prev.filter((d) => d !== idDia) : [...prev, idDia]
    );
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(formatarSlug(e.target.value));
  };

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    try {
      // Converte e comprime foto para avatar leve (evitando QuotaExceededError no localStorage)
      const base64Comprimido = await comprimirImagemParaAvatar(file, 360, 0.8);
      setFotoPerfil(base64Comprimido);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setFotoPerfil(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSalvarTudo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setMensagemSucesso(false);

    if (!nomeStudio.trim()) {
      setErro("O nome do estúdio é obrigatório.");
      return;
    }

    const slugFormatado = formatarSlug(slug.trim());
    if (!slugFormatado || slugFormatado.length < 3) {
      setErro("O link personalizado (slug) deve ter pelo menos 3 caracteres (apenas letras, números e hífens).");
      return;
    }

    if (diasFuncionamento.length === 0) {
      setErro("Selecione pelo menos um dia de atendimento para o estúdio.");
      return;
    }

    try {
      // 1. Salva dados de backend da Empresa com os horários de funcionamento
      await atualizarEmpresaMutation.mutateAsync({
        nome: nomeStudio.trim(),
        slug: slugFormatado,
        horarioAbertura,
        horarioFechamento,
        diasFuncionamento: diasFuncionamento.join(","),
        intervaloMinutos: Number(intervaloMinutos) || 60,
      });

      // 2. Salva perfil personalizado da profissional
      salvarPerfil({
        nome: nomeProfissional.trim() || usuario?.nome || "Profissional",
        nomeStudio: nomeStudio.trim(),
        slug: slugFormatado,
        fotoPerfil,
        bio: bio.trim(),
        instagram: instagram.trim(),
        whatsapp: whatsapp.trim(),
        tipoChavePix: tipoChavePix.trim(),
        chavePix: chavePix.trim(),
        titularPix: titularPix.trim(),
        bancoPix: bancoPix.trim(),
      });

      // 3. Salva modelos personalizados de WhatsApp e endereço do Studio
      salvarModelos({
        enderecoStudio: enderecoStudio.trim(),
        lembrete24h: msgLembrete24h.trim(),
        comoChegar: msgComoChegar.trim(),
        cuidadosPosTranca: msgCuidadosPosTranca.trim(),
        retornoManutencao: msgRetornoManutencao.trim(),
      });

      setSlug(slugFormatado);
      setMensagemSucesso(true);
      setTimeout(() => setMensagemSucesso(false), 4000);
    } catch (err: unknown) {
      setErro(extrairMensagemErro(err));
    }
  };

  const slugAtivo = slug.trim() || empresa?.slug || perfil.slug || "meu-studio";
  const urlCatalogo = typeof window !== "undefined" ? `${window.location.origin}/${slugAtivo}` : `/${slugAtivo}`;

  const handleCopiarLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(urlCatalogo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const handleCopiarPixTeste = () => {
    if (typeof window !== "undefined" && chavePix) {
      navigator.clipboard.writeText(chavePix);
      setCopiadoPix(true);
      setTimeout(() => setCopiadoPix(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Perfil & Configurações</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Personalize sua foto, nome, bio e link público de orçamentos e agendamentos.
        </p>
      </div>

      {mensagemSucesso && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center gap-2.5 text-xs font-medium shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Perfil e configurações atualizados com sucesso!
        </div>
      )}

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 flex items-center gap-2.5 text-xs font-medium shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          {erro}
        </div>
      )}

      <form onSubmit={handleSalvarTudo} className="space-y-6">
        {/* Card 1: Perfil da Profissional (Avatar, Nome, Bio) */}
        <Card className="border-slate-200 rounded-2xl shadow-xs bg-white overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Identidade da Profissional
                </CardTitle>
                <CardDescription className="text-xs">
                  Sua foto e apresentação exibidas no topo do painel e no catálogo.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Foto de Perfil / Avatar */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-rose-300 shadow-md bg-white flex items-center justify-center">
                  {fotoPerfil ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fotoPerfil}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                      {nomeProfissional.charAt(0) || "T"}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-rose-600 text-white shadow-lg hover:bg-rose-700 transition-transform active:scale-95"
                  title="Alterar foto"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFotoUpload}
                className="hidden"
              />

              <div className="space-y-1.5 text-center sm:text-left flex-1">
                <h4 className="text-sm font-bold text-slate-900">Foto de Perfil</h4>
                <p className="text-xs text-slate-500">
                  Escolha uma foto nítida e profissional sua ou a logomarca do estúdio.
                </p>
                <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 text-rose-700 border-rose-200 hover:bg-rose-50 font-medium"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Escolher Foto
                  </Button>
                  {fotoPerfil && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8 text-slate-500 hover:text-red-600"
                      onClick={() => setFotoPerfil("")}
                    >
                      Remover
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Seu Nome / Nome Artístico *</label>
                <Input
                  value={nomeProfissional}
                  onChange={(e) => setNomeProfissional(e.target.value)}
                  placeholder="Ex: Nayara Trancista"
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Instagram (@)</label>
                <div className="relative">
                  <Instagram className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@seustudio"
                    className="rounded-xl pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Bio / Sobre você e suas especialidades
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ex: Trancista especializada em Box Braids, Nagô e Dreads há 5 anos. Cuidado e valorização da beleza afro."
                rows={2}
                className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Dados do Studio & Link Público */}
        <Card className="border-slate-200 rounded-2xl shadow-xs bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Dados do Studio & Link
                </CardTitle>
                <CardDescription className="text-xs">
                  Nome da marca e endereço do catálogo público.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {carregandoEmpresa ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Nome do Estúdio / Marca *</label>
                  <Input
                    value={nomeStudio}
                    onChange={(e) => setNomeStudio(e.target.value)}
                    placeholder="Ex: Studio Bella Tranças"
                    required
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Slug do Link Público (URL exclusiva) *
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-500 overflow-hidden">
                    <span className="text-xs text-slate-400 pl-3 pr-1 font-mono">
                      trancas.app/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={handleSlugChange}
                      required
                      className="w-full bg-transparent p-2 text-xs font-semibold text-slate-900 focus:outline-none"
                      placeholder="seu-studio"
                    />
                  </div>
                </div>

                {/* Public Link Box */}
                <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-4 space-y-2">
                  <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-rose-600" />
                    Seu Link do Catálogo Público
                  </span>
                  <p className="text-xs text-rose-800 break-all font-mono">
                    {urlCatalogo}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopiarLink}
                      className="text-xs h-8 bg-white border-rose-200 text-rose-700 hover:bg-rose-50 font-medium gap-1.5"
                    >
                      {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiado ? "Copiado!" : "Copiar Link"}
                    </Button>
                    <a
                      href={`/${slugAtivo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium px-2 py-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Abrir Catálogo
                    </a>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card 3: Chave Pix para Sinais e Reservas */}
        <Card className="border-slate-200 rounded-2xl shadow-xs bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Chave Pix para Sinais & Reservas
                </CardTitle>
                <CardDescription className="text-xs">
                  Sua chave Pix configurada aqui é exibida nas propostas de orçamento e agendamentos para a cliente pagar o sinal de reserva.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Tipo de Chave Pix</label>
                <select
                  value={tipoChavePix}
                  onChange={(e) => setTipoChavePix(e.target.value)}
                  className="w-full text-xs font-medium rounded-xl border border-slate-200 p-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="Celular">Celular / WhatsApp</option>
                  <option value="CPF">CPF</option>
                  <option value="CNPJ">CNPJ</option>
                  <option value="E-mail">E-mail</option>
                  <option value="Chave Aleatória">Chave Aleatória (EVP)</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Chave Pix *</label>
                <div className="relative">
                  <Wallet className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={chavePix}
                    onChange={(e) => setChavePix(e.target.value)}
                    placeholder={
                      tipoChavePix === "Celular"
                        ? "(11) 99999-9999"
                        : tipoChavePix === "CPF"
                        ? "000.000.000-00"
                        : tipoChavePix === "E-mail"
                        ? "seuemail@exemplo.com"
                        : "Sua chave Pix aqui"
                    }
                    className="rounded-xl pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Nome do Titular da Conta (Opcional)</label>
                <Input
                  value={titularPix}
                  onChange={(e) => setTitularPix(e.target.value)}
                  placeholder="Ex: Nayara Silva Santos"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Banco / Instituição (Opcional)</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={bancoPix}
                    onChange={(e) => setBancoPix(e.target.value)}
                    placeholder="Ex: Nubank, Banco Inter, Itaú..."
                    className="rounded-xl pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Live Preview of Pix Card */}
            {chavePix ? (
              <div className="mt-3 p-4 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                    Prévia do Cartão Pix que a Cliente verá
                  </span>
                  <Badge className="bg-emerald-600 text-white font-semibold text-[10px]">
                    Ativo nas Propostas
                  </Badge>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                      {tipoChavePix} • {titularPix || nomeProfissional || "Profissional"} {bancoPix ? `(${bancoPix})` : ""}
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 break-all block">
                      {chavePix}
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopiarPixTeste}
                    className="text-xs h-8 bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-bold shrink-0 gap-1.5 self-start sm:self-auto"
                  >
                    {copiadoPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiadoPix ? "Chave Copiada!" : "Testar Copiar Pix"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                Cadastre sua chave Pix para que o botão de copiar chave apareça automaticamente nos orçamentos e agendamentos.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 4: Horários de Atendimento & Dias de Funcionamento */}
        <Card className="border-slate-200 rounded-2xl shadow-xs bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Horários de Atendimento & Dias de Funcionamento
                </CardTitle>
                <CardDescription className="text-xs">
                  Defina os dias da semana em que você atende e a faixa de horários disponíveis para suas clientes agendarem.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Dias de Funcionamento */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Dias de Atendimento na Semana
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2">
                {DIAS_SEMANA_OPCOES.map((dia) => {
                  const ativo = diasFuncionamento.includes(dia.id);
                  return (
                    <button
                      key={dia.id}
                      type="button"
                      onClick={() => toggleDiaSemana(dia.id)}
                      className={`p-2 sm:p-3 rounded-xl border text-center font-semibold text-xs transition-all ${
                        ativo
                          ? "bg-purple-600 text-white border-purple-600 shadow-xs shadow-purple-200"
                          : "bg-slate-50 text-slate-500 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50"
                      }`}
                    >
                      <span className="block text-[10px] uppercase font-bold opacity-80">
                        {dia.sigla}
                      </span>
                      <span className="block text-xs mt-0.5">{dia.nome}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400">
                Os dias desmarcados ficarão bloqueados para agendamento público automaticamente.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 pt-1">
              <div className="space-y-1.5 min-w-0">
                <label className="text-xs font-semibold text-slate-700">Horário de Abertura / Início</label>
                <div className="relative min-w-0">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="time"
                    value={horarioAbertura}
                    onChange={(e) => setHorarioAbertura(e.target.value)}
                    required
                    className="rounded-xl pl-9 w-full h-10 sm:h-11"
                  />
                </div>
              </div>

              <div className="space-y-1.5 min-w-0">
                <label className="text-xs font-semibold text-slate-700">Horário de Fechamento / Fim</label>
                <div className="relative min-w-0">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="time"
                    value={horarioFechamento}
                    onChange={(e) => setHorarioFechamento(e.target.value)}
                    required
                    className="rounded-xl pl-9 w-full h-10 sm:h-11"
                  />
                </div>
              </div>

              <div className="space-y-1.5 min-w-0 sm:col-span-2 md:col-span-1">
                <label className="text-xs font-semibold text-slate-700">Intervalo de Vagas</label>
                <select
                  value={intervaloMinutos}
                  onChange={(e) => setIntervaloMinutos(Number(e.target.value))}
                  className="w-full h-10 sm:h-11 text-xs font-medium rounded-xl border border-slate-200 px-3 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  <option value={30}>A cada 30 minutos</option>
                  <option value={60}>A cada 1 hora (Recomendado)</option>
                  <option value={90}>A cada 1h30</option>
                  <option value={120}>A cada 2 horas</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl text-xs text-purple-900 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                Duração Inteligente das Tranças
              </p>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                Ao escolher um horário, o sistema calcula a duração total do modelo solicitado (ex: 4 horas) e não permite agendamentos que ultrapassem o fechamento ({horarioFechamento}) nem sobreposições.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Mensagens Prontas do WhatsApp & Endereço do Studio */}
        <Card className="border-slate-200 rounded-2xl shadow-xs bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Mensagens Automáticas de WhatsApp & Endereço
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Personalize os textos dos disparos rápidos de lembretes, localização e guia de cuidados pós-trança.
                  </CardDescription>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm("Deseja restaurar todos os modelos de mensagens para o padrão original?")) {
                    restaurarPadroes();
                  }
                }}
                className="text-xs h-8 text-slate-500 hover:text-slate-800 gap-1 rounded-xl"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restaurar Textos Padrão
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Endereço do Studio */}
            <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                Endereço / Localização do Studio (ou Ponto de Referência)
              </label>
              <Input
                value={enderecoStudio}
                onChange={(e) => setEnderecoStudio(e.target.value)}
                placeholder="Ex: Av. Paulista, 1000 - Sala 42, Bela Vista, São Paulo - SP (Próximo ao Metrô Trianon)"
                className="rounded-xl bg-white text-xs"
              />
              <p className="text-[11px] text-slate-400">
                Usado automaticamente quando você clica em &quot;Enviar Como Chegar&quot; para a cliente.
              </p>
            </div>

            {/* Template 1: Lembrete 24h */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                1. Mensagem de Lembrete 24h Antes do Atendimento
              </label>
              <textarea
                value={msgLembrete24h}
                onChange={(e) => setMsgLembrete24h(e.target.value)}
                rows={3}
                className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white leading-relaxed"
                placeholder="Texto do lembrete..."
              />
              <span className="text-[10px] text-slate-400 font-mono block">
                Variáveis disponíveis: &#123;nomeCliente&#125;, &#123;nomeStudio&#125;, &#123;nomeServico&#125;, &#123;dataAtendimento&#125;, &#123;horario&#125;, &#123;valorRestante&#125;
              </span>
            </div>

            {/* Template 2: Como Chegar */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                2. Mensagem de Como Chegar / Endereço
              </label>
              <textarea
                value={msgComoChegar}
                onChange={(e) => setMsgComoChegar(e.target.value)}
                rows={3}
                className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white leading-relaxed"
                placeholder="Texto de localização..."
              />
              <span className="text-[10px] text-slate-400 font-mono block">
                Variáveis disponíveis: &#123;nomeCliente&#125;, &#123;nomeStudio&#125;, &#123;enderecoStudio&#125;
              </span>
            </div>

            {/* Template 3: Guia de Cuidados Pós-Trança */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                3. Guia de Cuidados Pós-Trança (Enviado após finalizar o serviço)
              </label>
              <textarea
                value={msgCuidadosPosTranca}
                onChange={(e) => setMsgCuidadosPosTranca(e.target.value)}
                rows={5}
                className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white leading-relaxed"
                placeholder="Dicas de cuidados..."
              />
              <span className="text-[10px] text-slate-400 font-mono block">
                Variáveis disponíveis: &#123;nomeCliente&#125;, &#123;nomeServico&#125;, &#123;nomeStudio&#125;
              </span>
            </div>

            {/* Template 4: Retorno / Manutenção */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                4. Mensagem de Fidelização / Retorno (30 a 45 dias depois)
              </label>
              <textarea
                value={msgRetornoManutencao}
                onChange={(e) => setMsgRetornoManutencao(e.target.value)}
                rows={3}
                className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white leading-relaxed"
                placeholder="Convite para retorno..."
              />
              <span className="text-[10px] text-slate-400 font-mono block">
                Variáveis disponíveis: &#123;nomeCliente&#125;, &#123;nomeServico&#125;, &#123;nomeStudio&#125;, &#123;urlCatalogo&#125;
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Botão de Salvar Tudo */}
        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            disabled={atualizarEmpresaMutation.isPending}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-11 px-6 font-bold rounded-xl gap-2 shadow-md shadow-rose-200"
          >
            <Save className="w-4 h-4" />
            {atualizarEmpresaMutation.isPending ? "Salvando Perfil..." : "Salvar Todas as Alterações"}
          </Button>
        </div>
      </form>

      {/* Account Info & Logout */}
      <Card className="border-slate-200 rounded-2xl shadow-xs bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-800">
            Acesso & Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span>E-mail de Login:</span>
            <span className="font-semibold text-slate-900">{usuario?.email || "email@trancas.app"}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between pt-1">
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold text-[11px]">
              Plano SaaS Profissional Ativo
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 font-semibold h-8 gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair da Conta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
