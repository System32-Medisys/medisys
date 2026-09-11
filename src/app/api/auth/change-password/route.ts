import { NextResponse } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { createSession, hashPassword, requireSession, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, AppError } from "@/lib/http";

const schema = z.object({ currentPassword: z.string().min(6), newPassword: z.string().min(6) });

export async function POST(request: Request) {
  try {
    const session = await requireSession({ allowPasswordChange: true });
    const input = schema.parse(await request.json());
    if (!(await verifyPassword(input.currentPassword, session.user.passwordHash))) throw new AppError(400, "Senha atual incorreta.");
    await db.user.update({ where: { id: session.userId }, data: { passwordHash: await hashPassword(input.newPassword), mustChangePassword: false } });
    await audit({ actorId: session.userId, actorRole: session.role, action: "SENHA_ALTERADA" });
    await createSession({ userId: session.userId, role: session.role, mustChangePassword: false });
    return NextResponse.json({ message: "Senha alterada com sucesso." });
  } catch (error) { return apiError(error); }
}
