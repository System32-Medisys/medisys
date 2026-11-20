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
      const blocked = await db.$transaction(async (tx) => {
        // The atomic update locks the row until the counter, status and audit commit.
        // A password reset, deactivation or previous lock must not be overwritten.
        const { count } = await tx.user.updateMany({
          where: { id: user.id, status: UserStatus.ATIVO, passwordHash: user.passwordHash },
          data: { failedLoginCount: { increment: 1 } },
        });
        if (!count) throw new AppError(401, "CPF ou senha inválidos.");
        const current = await tx.user.findUniqueOrThrow({ where: { id: user.id } });
        const shouldBlock = current.failedLoginCount >= 5;
        if (shouldBlock) {
          await tx.user.update({ where: { id: user.id }, data: { status: UserStatus.BLOQUEADO } });
        }
        await audit({ actorId: user.id, actorRole: user.role, action: shouldBlock ? "CONTA_BLOQUEADA" : "LOGIN_FALHOU", result: AuditResult.FALHA }, tx);
        return shouldBlock;
      });
      throw new AppError(401, blocked ? "Conta bloqueada após cinco tentativas." : "CPF ou senha inválidos.");
    }

    const { count } = await db.user.updateMany({
      where: { id: user.id, status: UserStatus.ATIVO, passwordHash: user.passwordHash },
      data: { failedLoginCount: 0 },
    });
    if (!count) throw new AppError(401, "Conta alterada durante o acesso. Tente entrar novamente.");
    await createSession({ userId: user.id, role: user.role, mustChangePassword: user.mustChangePassword }, user.passwordHash);
    await audit({ actorId: user.id, actorRole: user.role, action: "LOGIN_REALIZADO" });
    return NextResponse.json({ role: user.role, mustChangePassword: user.mustChangePassword });
  } catch (error) { return apiError(error); }
}
