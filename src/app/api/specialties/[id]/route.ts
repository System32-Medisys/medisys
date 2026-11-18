import { NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, AppError } from "@/lib/http";
import { authorize, permissions } from "@/lib/rbac";
import { catalogSchema } from "@/lib/validation";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    authorize(session.role, permissions.manageUsers);
    const { id } = await context.params;
    const current = await db.specialty.findUnique({ where: { id } });
    if (!current) throw new AppError(404, "Especialidade não encontrada.");
    const input = catalogSchema.pick({ name: true, active: true }).parse(await request.json());
    const updated = await db.specialty.update({ where: { id }, data: input });
    await audit({
      actorId: session.userId, actorRole: session.role,
      action: input.active === false && current.active ? "ESPECIALIDADE_DESATIVADA" : input.active === true && !current.active ? "ESPECIALIDADE_REATIVADA" : "ESPECIALIDADE_ATUALIZADA",
      entityType: "Specialty", entityId: id, before: current, after: updated,
    });
    return NextResponse.json({ message: "Especialidade atualizada com sucesso.", item: updated });
  } catch (error) { return apiError(error); }
}
