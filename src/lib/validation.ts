import { Role } from "@prisma/client";
import { z } from "zod";
import { isValidCpf, normalizeCpf } from "./cpf";

export const cpfSchema = z.string().transform(normalizeCpf).refine(isValidCpf, "CPF inválido.");

// Remove a formatação antes de validar e armazenar telefones com DDD.
export const phoneSchema = z.string()
  .transform((value) => value.replace(/\D/g, ""))
  .refine((value) => /^\d{10,11}$/.test(value), "Telefone deve possuir 10 ou 11 dígitos.");

export const loginSchema = z.object({ cpf: cpfSchema, password: z.string().min(6) });

export const userSchema = z.object({
  cpf: cpfSchema,
  fullName: z.string().trim().min(3).regex(/^[^\d]+$/, "O nome não pode conter números."),
  birthDate: z.coerce.date().refine((date) => date <= new Date(), "Data de nascimento inválida."),
  phone: phoneSchema,
  email: z.email().optional(),
  sex: z.string().optional(),
  healthInsurance: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(Role),
  address: z.object({
    zipCode: z.string().min(8), street: z.string().trim().min(2), number: z.string().trim().min(1),
    complement: z.string().optional(), neighborhood: z.string().trim().min(2),
    city: z.string().trim().min(2), state: z.string().length(2),
  }),
  crm: z.string().optional(), crmState: z.string().length(2).optional(),
  specialtyIds: z.array(z.string()).optional(), serviceDays: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === Role.MEDICO && (!data.crm || !data.crmState || !data.specialtyIds?.length)) {
    ctx.addIssue({ code: "custom", message: "Médico deve possuir CRM, UF e especialidade." });
  }
});

export const scheduleSchema = z.object({
  patientId: z.string().min(1),
  scheduledAt: z.coerce.date().refine((date) => date > new Date(), "Não é permitido agendar no passado."),
});
