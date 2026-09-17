"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { esquemaRegistro, FormularioRegistroDados } from "@/validacoes/autenticacao";
import { useAutenticacao } from "@/hooks/useAutenticacao";
import { extrairMensagemErro } from "@/servicos/api/clienteApi";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/componentes/ui/card";
import { Sparkles, AlertCircle, ArrowLeft, Globe } from "lucide-react";

export default function PaginaRegistro() {
  const { registrar: cadastrar } = useAutenticacao();
  const [erroApi, setErroApi] = useState<string | null>(null);

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
    setValue("nomeEmpresa", nome);
    if (!slugAtual || slugAtual === "") {
      const slugSugerido = nome
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", slugSugerido, { shouldValidate: true });
    }
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-background via-background to-secondary/30 py-8">
      <div className="w-full max-w-lg">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </Link>

        <Card className="border-border/80 shadow-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Cadastrar meu Negócio</CardTitle>
            <CardDescription>
              Crie seu catálogo personalizado de tranças e comece a receber solicitações.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {erroApi && (
              <div className="mb-4 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2.5 animate-in fade-in-50">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{erroApi}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Nome do Estúdio / Profissional
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Studio Afro Queen"
                  erro={!!errors.nomeEmpresa}
                  {...register("nomeEmpresa", { onChange: handleNomeEmpresaChange })}
                />
                {errors.nomeEmpresa && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.nomeEmpresa.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Link Público do seu Catálogo (Slug)
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="studio-afro-queen"
                    erro={!!errors.slug}
                    {...register("slug")}
                  />
                </div>
                {errors.slug ? (
                  <p className="text-xs text-destructive font-medium">
                    {errors.slug.message}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" />
                    Link das clientes: <span className="font-semibold text-foreground">/{slugAtual || "seu-link"}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Seu Nome
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Isadora Silva"
                    erro={!!errors.nomeUsuario}
                    {...register("nomeUsuario")}
                  />
                  {errors.nomeUsuario && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.nomeUsuario.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    E-mail
                  </label>
                  <Input
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    autoComplete="email"
                    erro={!!errors.email}
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
                <label className="text-sm font-medium text-foreground">
                  Senha
                </label>
                <Input
                  type="password"
                  placeholder="Mínimo 6 caracteres com maiúscula e número"
                  autoComplete="new-password"
                  erro={!!errors.senha}
                  {...register("senha")}
                />
                {errors.senha && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.senha.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold mt-4"
                carregando={isSubmitting}
              >
                Criar Minha Conta
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 text-center text-sm border-t border-border/40 pt-4">
            <p className="text-muted-foreground">
              Já possui conta?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Fazer login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
