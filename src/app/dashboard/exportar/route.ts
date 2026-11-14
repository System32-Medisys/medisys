import { ConsultationStatus, ExamStatus, Prisma, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError } from "@/lib/http";
import { escapeCsvCell, getDashboardPeriodRange, parseDashboardPeriod } from "@/lib/dashboard";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const url = new URL(request.url);
    const params = url.searchParams;
    const period = parseDashboardPeriod(params.get("periodo"));
    const isStaff = session.role === Role.ATENDENTE || session.role === Role.ADMINISTRADOR;
    const consultationAccess: Prisma.ConsultationWhereInput = session.role === Role.PACIENTE
      ? { patientId: session.userId }
      : session.role === Role.MEDICO ? { doctorId: session.userId } : {};
    const examAccess: Prisma.ExamAppointmentWhereInput = session.role === Role.PACIENTE
      ? { patientId: session.userId } : {};

    let doctorId: string | undefined;
    let examTypeId: string | undefined;
    if (isStaff && params.get("medico")) {
      const doctor = await db.user.findFirst({
        where: { id: params.get("medico")!, role: Role.MEDICO, status: "ATIVO" },
        select: { id: true },
      });
      doctorId = doctor?.id;
    }
    if (isStaff && params.get("tipoExame")) {
      const examType = await db.examType.findFirst({
        where: { id: params.get("tipoExame")!, active: true },
        select: { id: true },
      });
      examTypeId = examType?.id;
    }
    const consultationStatus = Object.values(ConsultationStatus).find((value) => value === params.get("statusConsulta"));
    const examStatus = Object.values(ExamStatus).find((value) => value === params.get("statusExame"));
    const { start, end } = getDashboardPeriodRange(new Date(), period);
    const dateRange = { gte: start, lt: end };
    const [consultations, exams] = await Promise.all([
      db.consultation.groupBy({
        by: ["status"],
        where: {
          ...consultationAccess, scheduledAt: dateRange,
          ...(doctorId ? { doctorId } : {}),
          ...(consultationStatus ? { status: consultationStatus } : {}),
        },
        _count: { _all: true },
      }),
      db.examAppointment.groupBy({
        by: ["status"],
        where: {
          ...examAccess, scheduledAt: dateRange,
          ...(examTypeId ? { examTypeId } : {}),
          ...(examStatus ? { status: examStatus } : {}),
        },
        _count: { _all: true },
      }),
    ]);
    const lines: Array<Array<string | number>> = [
      ["Tipo", "Período", "Status", "Quantidade"],
      ...consultations.map((item) => ["Consulta", period, item.status, item._count._all]),
      ...exams.map((item) => ["Exame", period, item.status, item._count._all]),
    ];
    const csv = "\uFEFF" + lines.map((line) => line.map(escapeCsvCell).join(";")).join("\r\n") + "\r\n";
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="medisys-dashboard.csv"',
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
