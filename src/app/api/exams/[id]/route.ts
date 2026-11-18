import { ExamStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { allowedStatuses } from "@/lib/appointment-status";
import { audit } from "@/lib/audit";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, AppError } from "@/lib/http";
import { authorize, permissions } from "@/lib/rbac";
import { createExam } from "@/services/scheduling";

const schema = z.object({
  status: z.enum(ExamStatus),
  justification: z.string().trim().min(1).max(1000).optional(),
  scheduledAt: z.iso.datetime().transform((value) => new Date(value)).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    authorize(session.role, permissions.manageSchedules);
    const { id } = await params;
    const input = schema.parse(await request.json());
    const result = await db.$transaction(async (tx) => {
      const current = await tx.examAppointment.findUnique({ where: { id } });
      if (!current) throw new AppError(404, "Agendamento não encontrado.");
      if (!allowedStatuses("exam", current.status).includes(input.status)) throw new AppError(409, "Transição de status não permitida.");
      const reschedule = input.status === "REAGENDADO";
      if ((reschedule || input.status === "CANCELADO") && !input.justification) throw new AppError(400, "Informe a justificativa.");
      const date = input.scheduledAt;
      if (reschedule && (!date || date <= new Date() || +date === +current.scheduledAt)) throw new AppError(400, "Informe um novo horário futuro e diferente do atual.");
      if (input.status.startsWith("FALTA_") && current.scheduledAt > new Date()) throw new AppError(400, "Não registre falta antes do horário.");
      const { count } = await tx.examAppointment.updateMany({
        where: { id, status: current.status },
        data: { status: input.status, justification: input.justification, ...(reschedule ? { previousDate: current.scheduledAt } : {}) },
      });
      if (!count) throw new AppError(409, "O agendamento foi alterado. Atualize a página.");
      const replacement = reschedule && date ? await createExam({
        patientId: current.patientId, examTypeId: current.examTypeId, scheduledAt: date,
        actorId: session.userId, actorRole: session.role, rescheduledFromId: id,
      }, tx) : null;
      await tx.examAppointmentHistory.create({ data: {
        examId: id, previousStatus: current.status, newStatus: input.status,
        previousDate: current.scheduledAt, newDate: replacement?.scheduledAt ?? current.scheduledAt,
        justification: input.justification, changedById: session.userId,
      } });
      await audit({
        actorId: session.userId, actorRole: session.role, patientId: current.patientId,
        action: "AGENDAMENTO_STATUS_ALTERADO", entityType: "ExamAppointment",
        entityId: id, justification: input.justification, before: { status: current.status },
        after: { status: input.status, replacementId: replacement?.id },
      }, tx);
      return { status: input.status, replacementId: replacement?.id };
    }, { isolationLevel: "Serializable" });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return apiError(new AppError(409, "Houve uma alteração simultânea. Atualize a página e tente novamente."));
    }
    return apiError(error);
  }
}
