import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { hashPassword, requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, AppError } from "@/lib/http";
import { authorize } from "@/lib/rbac";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("unlock") }),
  z.object({ action: z.literal("reset"), password: z.string().min(12).refine((s) => Buffer.byteLength(s) <= 72) }),
]);

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    authorize(session.role, [Role.ADMINISTRADOR]);
    const { id } = await params;
    if (id === session.userId) throw new AppError(400, "Use a troca de senha para sua própria conta.");
    const input = schema.parse(await request.json());
    const passwordHash = input.action === "reset" ? await hashPassword(input.password) : undefined;
    await db.$transaction(async (tx) => {
      const { count } = await tx.user.updateMany({
        where: { id, status: input.action === "unlock" ? "BLOQUEADO" : { not: "INATIVO" } },
        data: input.action === "unlock" ? { status: "ATIVO", failedLoginCount: 0 } : { passwordHash, mustChangePassword: true },
      });
      if (count !== 1) throw new AppError(409, "Cadastro indisponível para esta operação.");
      await audit({ actorId: session.userId, actorRole: session.role, entityType: "User", entityId: id,
        action: input.action === "unlock" ? "CONTA_DESBLOQUEADA" : "SENHA_REDEFINIDA" }, tx);
    });
    return NextResponse.json({ message: input.action === "unlock" ? "Conta desbloqueada." : "Senha temporária definida." });
  } catch (error) { return apiError(error); }
}
