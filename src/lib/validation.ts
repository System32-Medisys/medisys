import { Role } from "@prisma/client";
import { z } from "zod";
import { isValidCpf, normalizeCpf } from "./cpf";

const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

const stateSchema = z.string()
  .trim()
  .transform((value) => value.toUpperCase())
  .refine((value) => brazilianStates.includes(value as typeof brazilianStates[number]), "Informe uma UF válida.");

export const cpfSchema = z.string()
  .min(1, "Informe o CPF.")
  .transform(normalizeCpf)
  .refine((value) => value.length === 11, "O CPF deve possuir 11 dígitos.")
  .refine(isValidCpf, "CPF inválido.");

export const phoneSchema = z.string()
  .min(1, "Informe o telefone.")
  .transform((value) => value.replace(/\D/g, ""))
  .refine((value) => /^\d{10,11}$/.test(value), "O telefone deve possuir 10 ou 11 dígitos.");

export const loginSchema = z.object({
  cpf: cpfSchema,
  password: z.string().min(6, "A senha deve possuir pelo menos 6 caracteres."),
});

export const userSchema = z.object({
  cpf: cpfSchema,
  fullName: z.string()
    .trim()
    .min(3, "O nome deve possuir pelo menos 3 caracteres.")
    .regex(/^[^\d]+$/, "O nome não pode conter números."),
  birthDate: z.coerce.date({ error: "Informe uma data de nascimento válida." })
    .refine((date) => date <= new Date(), "A data de nascimento não pode estar no futuro."),
  phone: phoneSchema,
  email: z.string().email("Informe um endereço de e-mail válido.").optional(),
  sex: z.string().optional(),
  healthInsurance: z.string().optional(),
  password: z.string().min(6, "A senha deve possuir pelo menos 6 caracteres."),
  role: z.enum(Role),
  address: z.object({
    zipCode: z.string()
      .min(1, "Informe o CEP.")
      .transform((value) => value.replace(/\D/g, ""))
      .refine((value) => value.length === 8, "O CEP deve possuir 8 dígitos."),
    street: z.string().trim().min(2, "O logradouro deve possuir pelo menos 2 caracteres."),
    number: z.string().trim().min(1, "Informe o número do endereço."),
    complement: z.string().optional(),
    neighborhood: z.string().trim().min(2, "O bairro deve possuir pelo menos 2 caracteres."),
    city: z.string().trim().min(2, "A cidade deve possuir pelo menos 2 caracteres."),
    state: stateSchema,
  }),
  crm: z.string()
    .regex(/^\d+$/, "O CRM deve conter somente números.")
    .optional(),
  crmState: stateSchema.optional(),
  specialtyIds: z.array(z.string()).optional(),
  serviceDays: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role !== Role.MEDICO) return;

  if (!data.email) {
    ctx.addIssue({ code: "custom", path: ["email"], message: "Informe o e-mail do médico." });
  }
  if (!data.crm) {
    ctx.addIssue({ code: "custom", path: ["crm"], message: "Informe o CRM." });
  }
  if (!data.crmState) {
    ctx.addIssue({ code: "custom", path: ["crmState"], message: "Informe a UF do CRM." });
  }
  if (!data.specialtyIds?.length || data.specialtyIds.some((id) => !id)) {
    ctx.addIssue({ code: "custom", path: ["specialtyIds"], message: "Selecione pelo menos uma especialidade." });
  }
});

export const scheduleSchema = z.object({
  patientId: z.string().min(1),
  scheduledAt: z.coerce.date().refine((date) => date > new Date(), "Não é permitido agendar no passado."),
});
