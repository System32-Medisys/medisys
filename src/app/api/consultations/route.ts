import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError } from "@/lib/http";
import { authorize, permissions } from "@/lib/rbac";
import { scheduleSchema } from "@/lib/validation";
import { createConsultation } from "@/services/scheduling";
import { z } from "zod";

export async function GET() {
  try {
    const session = await requireSession();
    const where = session.role === Role.PACIENTE ? { patientId: session.userId } : session.role === Role.MEDICO ? { doctorId: session.userId } : {};
    const data = await db.consultation.findMany({ where, include: { patient: { select: { fullName: true } }, doctor: { select: { fullName: true } } }, orderBy: { scheduledAt: "desc" } });
    return NextResponse.json(data);
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    authorize(session.role, permissions.manageSchedules);
    const input = scheduleSchema.extend({ doctorId: z.string().min(1) }).parse(await request.json());
    const data = await createConsultation({ ...input, actorId: session.userId, actorRole: session.role });
    return NextResponse.json(data, { status: 201 });
  } catch (error) { return apiError(error); }
}
