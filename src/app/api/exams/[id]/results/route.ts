import { ExamStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, AppError } from "@/lib/http";
import { authorize, permissions } from "@/lib/rbac";

const schema = z.object({
  content: z.string().trim().min(1).max(10000),
  resultDate: z.union([z.iso.date(), z.iso.datetime()]).transform((value) => new Date(value)).optional(),
  fileUrl: z.url({ protocol: /^https$/ }).max(2048).optional(),
});

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
      if (exam.status !== ExamStatus.RESULTADO_PENDENTE && !(exam.status === ExamStatus.RESULTADO_DISPONIVEL && previous)) {
        throw new AppError(409, "O exame não está em um status que permite registrar ou corrigir resultados.");
      }
      const created = await tx.examResultVersion.create({ data: { examId: id, authorId: session.userId, content: input.content, resultDate: input.resultDate ?? new Date(), fileUrl: input.fileUrl, version: (previous?.version ?? 0) + 1 } });
      if (exam.status === ExamStatus.RESULTADO_PENDENTE) {
        await tx.examAppointment.update({ where: { id, status: exam.status }, data: { status: ExamStatus.RESULTADO_DISPONIVEL } });
        await tx.examAppointmentHistory.create({ data: {
          examId: id, previousStatus: exam.status, newStatus: ExamStatus.RESULTADO_DISPONIVEL,
          changedById: session.userId,
        } });
      }
      await audit({ actorId: session.userId, actorRole: session.role, action: previous ? "RESULTADO_CORRIGIDO" : "RESULTADO_REGISTRADO", entityType: "ExamResultVersion", entityId: created.id, patientId: exam.patientId, before: previous ? { version: previous.version } : undefined, after: { version: created.version } }, tx);
      return { id: created.id, version: created.version, createdAt: created.createdAt };
    }, { isolationLevel: "Serializable" });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2002", "P2034"].includes(error.code)) {
      return apiError(new AppError(409, "Outro resultado foi salvo simultaneamente. Atualize a página e confira a última versão."));
    }
    return apiError(error);
  }
}
