import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { hashPassword, requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, AppError } from "@/lib/http";
import { authorize, permissions } from "@/lib/rbac";
import { userSchema } from "@/lib/validation";

export async function GET() {
  try {
    const session = await requireSession();
    authorize(session.role, [Role.ATENDENTE, Role.ADMINISTRADOR]);
    const users = await db.user.findMany({ select: { id: true, cpf: true, fullName: true, role: true, status: true, phone: true, email: true }, orderBy: { fullName: "asc" } });
    return NextResponse.json(users);
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const input = userSchema.parse(await request.json());
    if ((input.role === Role.ATENDENTE || input.role === Role.ADMINISTRADOR) && session.role !== Role.ADMINISTRADOR) throw new AppError(403, "Somente administradores cadastram atendentes ou administradores.");
    authorize(session.role, input.role === Role.PACIENTE || input.role === Role.MEDICO ? permissions.managePatientsAndDoctors : permissions.manageUsers);
    const user = await db.$transaction(async (tx) => {
      const created = await tx.user.create({ data: {
        cpf: input.cpf, fullName: input.fullName, birthDate: input.birthDate, phone: input.phone,
        email: input.email, sex: input.sex, healthInsurance: input.healthInsurance,
        passwordHash: await hashPassword(input.password), role: input.role,
        address: { create: input.address },
        doctor: input.role === Role.MEDICO ? { create: { crm: input.crm!, crmState: input.crmState!, serviceDays: input.serviceDays, specialties: { create: input.specialtyIds!.map((specialtyId) => ({ specialtyId })) } } } : undefined,
      }, select: { id: true, cpf: true, fullName: true, role: true, status: true } });
      await audit({ actorId: session.userId, actorRole: session.role, action: "USUARIO_CADASTRADO", entityType: "User", entityId: created.id, patientId: input.role === Role.PACIENTE ? created.id : undefined, after: created }, tx);
      return created;
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) { return apiError(error); }
}
