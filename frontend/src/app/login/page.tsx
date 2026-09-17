"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { esquemaLogin, FormularioLoginDados } from "@/validacoes/autenticacao";
import { useAutenticacao } from "@/hooks/useAutenticacao";
import { extrairMensagemErro } from "@/servicos/api/clienteApi";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/componentes/ui/card";
import { Sparkles, AlertCircle, ArrowLeft } from "lucide-react";

export default function PaginaLogin() {
  const { login } = useAutenticacao();
  const [erroApi, setErroApi] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormularioLoginDados>({
    resolver: zodResolver(esquemaLogin),
  });

  const onSubmit = async (dados: FormularioLoginDados) => {
    try {
      setErroApi(null);
      await login(dados);
    } catch (erro) {
      setErroApi(extrairMensagemErro(erro));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-background via-background to-secondary/30">
      <div className="w-full max-w-md">
        {/* Link Voltar */}
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
            <CardTitle className="text-2xl font-bold">Acessar Painel</CardTitle>
            <CardDescription>
              Entre com suas credenciais para gerenciar seus serviços e agendamentos.
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

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Senha
                  </label>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
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
                className="w-full h-12 text-base font-semibold mt-2"
                carregando={isSubmitting}
              >
                Entrar
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 text-center text-sm border-t border-border/40 pt-4">
            <p className="text-muted-foreground">
              Ainda não tem conta?{" "}
              <Link href="/registrar" className="text-primary font-semibold hover:underline">
                Cadastre seu estúdio
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
