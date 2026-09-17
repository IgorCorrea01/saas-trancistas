import { z } from "zod";

export const esquemaLogin = z.object({
  email: z
    .string()
    .min(1, "O e-mail é obrigatório.")
    .email("Informe um e-mail válido."),
  senha: z
    .string()
    .min(1, "A senha é obrigatória.")
    .min(6, "A senha deve ter no mínimo 6 caracteres."),
});

export type FormularioLoginDados = z.infer<typeof esquemaLogin>;

export const esquemaRegistro = z.object({
  nomeEmpresa: z
    .string()
    .min(1, "O nome do estúdio/negócio é obrigatório.")
    .min(3, "O nome deve ter no mínimo 3 caracteres."),
  slug: z
    .string()
    .min(1, "O link personalizado (slug) é obrigatório.")
    .min(3, "O slug deve ter no mínimo 3 caracteres.")
    .regex(
      /^[a-z0-9-]+$/,
      "O link deve conter apenas letras minúsculas, números e hífens."
    ),
  nomeUsuario: z
    .string()
    .min(1, "Seu nome é obrigatório.")
    .min(2, "Seu nome deve ter no mínimo 2 caracteres."),
  email: z
    .string()
    .min(1, "O e-mail é obrigatório.")
    .email("Informe um e-mail válido."),
  senha: z
    .string()
    .min(1, "A senha é obrigatória.")
    .min(6, "A senha deve ter no mínimo 6 caracteres.")
    .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula.")
    .regex(/[a-z]/, "A senha deve conter ao menos uma letra minúscula.")
    .regex(/[0-9]/, "A senha deve conter ao menos um número."),
});

export type FormularioRegistroDados = z.infer<typeof esquemaRegistro>;
