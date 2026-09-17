import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function zodFieldErrors(error: ZodError) {
  return error.issues.reduce<Record<string, string[]>>((fields, issue) => {
    const path = issue.path.join(".");
    if (!path) return fields;
    fields[path] ??= [];
    fields[path].push(issue.message);
    return fields;
  }, {});
}

function uniqueConstraintFields(error: Prisma.PrismaClientKnownRequestError) {
  const target = error.meta?.target;
  if (Array.isArray(target)) return target.map(String);
  if (typeof target === "string") return [target];
  return [];
}

export function apiError(error: unknown) {
  if (error instanceof ZodError) {
    const fields = zodFieldErrors(error);
    const generalError = error.issues.find((issue) => issue.path.length === 0)?.message;
    return NextResponse.json(
      {
        error: generalError ?? "Não foi possível realizar o cadastro. Corrija os campos destacados.",
        fields,
      },
      { status: 400 },
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const fields = uniqueConstraintFields(error);
      if (fields.includes("cpf")) {
        return NextResponse.json(
          { error: "Este CPF já está cadastrado.", fields: { cpf: ["Este CPF já está cadastrado."] } },
          { status: 409 },
        );
      }
      if (fields.includes("email")) {
        return NextResponse.json(
          { error: "Este e-mail já está cadastrado.", fields: { email: ["Este e-mail já está cadastrado."] } },
          { status: 409 },
        );
      }
      if (fields.includes("crm") && fields.includes("crmState")) {
        return NextResponse.json(
          {
            error: "Já existe um médico cadastrado com este CRM e esta UF.",
            fields: {
              crm: ["A combinação de CRM e UF já está cadastrada."],
              crmState: ["A combinação de CRM e UF já está cadastrada."],
            },
          },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: "Já existe um registro com estes dados." },
        { status: 409 },
      );
    }

    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Um dos registros relacionados não está mais disponível." },
        { status: 400 },
      );
    }
  }

  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error(error);
  return NextResponse.json(
    { error: "Não foi possível concluir a operação. Tente novamente." },
    { status: 500 },
  );
}
