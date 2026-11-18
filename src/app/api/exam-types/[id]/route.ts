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
    authorize(session.role, permissions.managePatientsAndDoctors);
    const { id } = await context.params;
    const current = await db.examType.findUnique({ where: { id } });
    if (!current) throw new AppError(404, "Tipo de exame não encontrado.");
    const input = catalogSchema.parse(await request.json());
    const updated = await db.examType.update({
      where: { id },
      data: { name: input.name, description: input.description ?? current.description, active: input.active },
    });
    await audit({
      actorId: session.userId, actorRole: session.role,
      action: input.active === false && current.active ? "TIPO_EXAME_DESATIVADO" : input.active === true && !current.active ? "TIPO_EXAME_REATIVADO" : "TIPO_EXAME_ATUALIZADO",
      entityType: "ExamType", entityId: id, before: current, after: updated,
    });
    return NextResponse.json({ message: "Tipo de exame atualizado com sucesso.", item: updated });
  } catch (error) { return apiError(error); }
}
