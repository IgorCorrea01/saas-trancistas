"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { esquemaRegistro, FormularioRegistroDados } from "@/validacoes/autenticacao";
import { useAutenticacao } from "@/hooks/useAutenticacao";
import { extrairMensagemErro } from "@/servicos/api/clienteApi";
import { formatarSlug } from "@/utilitarios/formatadores";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/componentes/ui/card";
import {
  Sparkles,
  AlertCircle,
  ArrowLeft,
  Globe,
  Store,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2
} from "lucide-react";

export default function PaginaRegistro() {
  const { registrar: cadastrar } = useAutenticacao();
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [slugModificadoManualmente, setSlugModificadoManualmente] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormularioRegistroDados>({
    resolver: zodResolver(esquemaRegistro),
  });

  const slugAtual = watch("slug") || "";

  // Auxilia na sugestão automática de slug a partir do nome do estúdio
  const handleNomeEmpresaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nome = e.target.value;
    setValue("nomeEmpresa", nome, { shouldValidate: true });
    if (!slugModificadoManualmente) {
      setValue("slug", formatarSlug(nome), { shouldValidate: true });
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugModificadoManualmente(true);
    setValue("slug", formatarSlug(e.target.value), { shouldValidate: true });
  };

  const onSubmit = async (dados: FormularioRegistroDados) => {
    try {
      setErroApi(null);
      await cadastrar(dados);
    } catch (erro) {
      setErroApi(extrairMensagemErro(erro));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-background via-background to-secondary/30 py-8 relative overflow-hidden">
      {/* Subtle Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="w-full max-w-lg">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Link>

          <Link href="/" className="flex items-center gap-1.5 text-sm font-extrabold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Trança<span className="text-primary">Flow</span></span>
          </Link>
        </div>

        <Card className="border-border/80 shadow-lg bg-card/95 backdrop-blur-sm rounded-2xl">
          <CardHeader className="space-y-1.5 text-center pb-4">
            <div className="flex justify-center mb-1">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Cadastrar meu Estúdio</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">
              Crie seu catálogo personalizado de tranças e comece a receber solicitações organizadas.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {erroApi && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2.5 animate-in fade-in-50">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{erroApi}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5 text-muted-foreground" />
                  Nome do Estúdio / Profissional
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Studio Afro Queen"
                  erro={!!errors.nomeEmpresa}
                  className="rounded-xl h-11"
                  {...register("nomeEmpresa", { onChange: handleNomeEmpresaChange })}
                />
                {errors.nomeEmpresa && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.nomeEmpresa.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  Link Público do seu Catálogo (Slug)
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="studio-afro-queen"
                    erro={!!errors.slug}
                    className="rounded-xl h-11"
                    {...register("slug", { onChange: handleSlugChange })}
                  />
                </div>
                {errors.slug ? (
                  <p className="text-xs text-destructive font-medium">
                    {errors.slug.message}
                  </p>
                ) : (
                  <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Globe className="h-4 w-4 text-primary shrink-0" />
                      Link do seu catálogo:
                    </span>
                    <span className="font-mono font-bold text-foreground bg-background px-2.5 py-1 rounded-lg border border-border/60 break-all text-xs">
                      trancaflow.app/{slugAtual || "seu-studio"}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Seu Nome
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Isadora Silva"
                    erro={!!errors.nomeUsuario}
                    className="rounded-xl h-11"
                    {...register("nomeUsuario")}
                  />
                  {errors.nomeUsuario && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.nomeUsuario.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    E-mail
                  </label>
                  <Input
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    autoComplete="email"
                    erro={!!errors.email}
                    className="rounded-xl h-11"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  Senha
                </label>
                <div className="relative">
                  <Input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres com maiúscula e número"
                    autoComplete="new-password"
                    erro={!!errors.senha}
                    className="rounded-xl h-11 pr-10"
                    {...register("senha")}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    tabIndex={-1}
                  >
                    {mostrarSenha ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.senha && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.senha.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-bold shadow-sm mt-3 rounded-xl"
                carregando={isSubmitting}
              >
                Criar Minha Conta Grátis
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 text-center text-sm border-t border-border/40 pt-4">
            <p className="text-muted-foreground text-xs sm:text-sm">
              Já possui conta?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Fazer login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
