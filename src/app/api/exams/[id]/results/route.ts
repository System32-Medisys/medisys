import { ExamStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, AppError } from "@/lib/http";
import { authorize, permissions } from "@/lib/rbac";

const schema = z.object({ content: z.string().trim().min(1) });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    authorize(session.role, permissions.manageResults);
    const { id } = await context.params;
    const input = schema.parse(await request.json());
    const result = await db.$transaction(async (tx) => {
      const exam = await tx.examAppointment.findUnique({ where: { id }, include: { results: { orderBy: { version: "desc" }, take: 1 } } });
      if (!exam) throw new AppError(404, "Exame não encontrado.");
      const previous = exam.results[0];
      const created = await tx.examResultVersion.create({ data: { examId: id, authorId: session.userId, content: input.content, version: (previous?.version ?? 0) + 1 } });
      await tx.examAppointment.update({ where: { id }, data: { status: ExamStatus.RESULTADO_DISPONIVEL } });
      await audit({ actorId: session.userId, actorRole: session.role, action: previous ? "RESULTADO_CORRIGIDO" : "RESULTADO_REGISTRADO", entityType: "ExamResultVersion", entityId: created.id, patientId: exam.patientId, before: previous ? { version: previous.version } : undefined, after: { version: created.version } }, tx);
      return { id: created.id, version: created.version, createdAt: created.createdAt };
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) { return apiError(error); }
}
