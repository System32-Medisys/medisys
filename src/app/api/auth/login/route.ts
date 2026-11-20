import { AuditResult, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { createSession, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, AppError } from "@/lib/http";
import { getLoginFailureMessage, parseLoginInput } from "@/lib/login-validation";

export async function POST(request: Request) {
  try {
    const parsedInput = parseLoginInput(await request.json());
    if (!parsedInput.success) throw new AppError(401, parsedInput.error);

    const input = parsedInput.data;
    const user = await db.user.findUnique({ where: { cpf: input.cpf } });
    if (!user || user.status === UserStatus.INATIVO) throw new AppError(401, getLoginFailureMessage(0));
    if (user.status === UserStatus.BLOQUEADO) throw new AppError(423, "Conta bloqueada. Procure um administrador.");

    if (!(await verifyPassword(input.password, user.passwordHash))) {
      const attempts = user.failedLoginCount + 1;
      await db.user.update({ where: { id: user.id }, data: { failedLoginCount: attempts, status: attempts >= 5 ? UserStatus.BLOQUEADO : undefined } });
      await audit({ actorId: user.id, actorRole: user.role, action: attempts >= 5 ? "CONTA_BLOQUEADA" : "LOGIN_FALHOU", result: AuditResult.FALHA });
      throw new AppError(401, getLoginFailureMessage(attempts));
    }

    await db.user.update({ where: { id: user.id }, data: { failedLoginCount: 0 } });
    await createSession({ userId: user.id, role: user.role, mustChangePassword: user.mustChangePassword }, user.passwordHash);
    await audit({ actorId: user.id, actorRole: user.role, action: "LOGIN_REALIZADO" });
    return NextResponse.json({ role: user.role, mustChangePassword: user.mustChangePassword });
  } catch (error) { return apiError(error); }
}
