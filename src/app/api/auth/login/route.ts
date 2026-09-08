import { AuditResult, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { createSession, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, AppError } from "@/lib/http";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());
    const user = await db.user.findUnique({ where: { cpf: input.cpf } });
    if (!user || user.status === UserStatus.INATIVO) throw new AppError(401, "CPF ou senha inválidos.");
    if (user.status === UserStatus.BLOQUEADO) throw new AppError(423, "Conta bloqueada. Procure um administrador.");

    if (!(await verifyPassword(input.password, user.passwordHash))) {
      const attempts = user.failedLoginCount + 1;
      await db.user.update({ where: { id: user.id }, data: { failedLoginCount: attempts, status: attempts >= 5 ? UserStatus.BLOQUEADO : undefined } });
      await audit({ actorId: user.id, actorRole: user.role, action: attempts >= 5 ? "CONTA_BLOQUEADA" : "LOGIN_FALHOU", result: AuditResult.FALHA });
      throw new AppError(401, attempts >= 5 ? "Conta bloqueada após cinco tentativas." : "CPF ou senha inválidos.");
    }

    await db.user.update({ where: { id: user.id }, data: { failedLoginCount: 0 } });
    await createSession({ userId: user.id, role: user.role, mustChangePassword: user.mustChangePassword });
    await audit({ actorId: user.id, actorRole: user.role, action: "LOGIN_REALIZADO" });
    return NextResponse.json({ role: user.role, mustChangePassword: user.mustChangePassword });
  } catch (error) { return apiError(error); }
}
