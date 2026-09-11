import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError } from "@/lib/http";
import { authorize, permissions } from "@/lib/rbac";
import { scheduleSchema } from "@/lib/validation";
import { createExam } from "@/services/scheduling";
import { z } from "zod";

export async function GET() {
  try {
    const session = await requireSession();
    const where = session.role === Role.PACIENTE ? { patientId: session.userId } : {};
    const data = await db.examAppointment.findMany({ where, include: { patient: { select: { fullName: true } }, examType: true, results: { orderBy: { version: "desc" }, take: 1 } }, orderBy: { scheduledAt: "desc" } });
    await Promise.all(data.filter((item) => item.results.length).map((item) => auditView(session, item.id, item.patientId)));
    return NextResponse.json(data);
  } catch (error) { return apiError(error); }
}

async function auditView(session: Awaited<ReturnType<typeof requireSession>>, entityId: string, patientId: string) {
  const { audit } = await import("@/lib/audit");
  return audit({ actorId: session.userId, actorRole: session.role, action: "RESULTADO_VISUALIZADO", entityType: "ExamAppointment", entityId, patientId });
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    authorize(session.role, permissions.manageSchedules);
    const input = scheduleSchema.extend({ examTypeId: z.string().min(1) }).parse(await request.json());
    const data = await createExam({ ...input, actorId: session.userId, actorRole: session.role });
    return NextResponse.json(data, { status: 201 });
  } catch (error) { return apiError(error); }
}
