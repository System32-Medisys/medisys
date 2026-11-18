import { Role, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, AppError } from "@/lib/http";
import { authorize, permissions } from "@/lib/rbac";
import { userUpdateSchema } from "@/lib/validation";

async function getManagedUser(id: string, actorRole: Role) {
  const user = await db.user.findUnique({
    where: { id },
    include: {
      address: true,
      doctor: { include: { specialties: true } },
    },
  });
  if (!user || user.role === Role.ADMINISTRADOR) throw new AppError(404, "Cadastro não encontrado.");
  if (user.role === Role.ATENDENTE) {
    authorize(actorRole, permissions.manageUsers);
  } else {
    authorize(actorRole, permissions.managePatientsAndDoctors);
  }
  return user;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    const user = await getManagedUser(id, session.role);
    return NextResponse.json({
      id: user.id,
      cpf: user.cpf,
      fullName: user.fullName,
      birthDate: user.birthDate,
      phone: user.phone,
      email: user.email,
      sex: user.sex,
      healthInsurance: user.healthInsurance,
      role: user.role,
      status: user.status,
      address: user.address,
      crm: user.doctor?.crm,
      crmState: user.doctor?.crmState,
      serviceDays: user.doctor?.serviceDays,
      specialtyIds: user.doctor?.specialties.map((item) => item.specialtyId) ?? [],
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    const current = await getManagedUser(id, session.role);
    const input = userUpdateSchema.parse(await request.json());

    if (current.role === Role.MEDICO) {
      if (!input.crm || !input.crmState || !input.email || !input.specialtyIds?.length) {
        throw new AppError(400, "CRM, UF, e-mail e especialidade são obrigatórios para médicos.");
      }
      const activeSpecialties = await db.specialty.count({
        where: { id: { in: input.specialtyIds }, active: true },
      });
      if (activeSpecialties !== new Set(input.specialtyIds).size) {
        throw new AppError(400, "Selecione somente especialidades ativas.");
      }
    }

    const updated = await db.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: {
          cpf: input.cpf,
          fullName: input.fullName,
          birthDate: input.birthDate,
          phone: input.phone,
          email: input.email,
          sex: current.role === Role.ATENDENTE ? null : input.sex,
          healthInsurance: current.role === Role.ATENDENTE ? null : input.healthInsurance,
          status: input.status ? UserStatus[input.status] : undefined,
          address: {
            upsert: {
              create: input.address,
              update: input.address,
            },
          },
          doctor: current.role === Role.MEDICO ? {
            update: {
              crm: input.crm!,
              crmState: input.crmState!,
              serviceDays: input.serviceDays,
              specialties: {
                deleteMany: {},
                create: input.specialtyIds!.map((specialtyId) => ({ specialtyId })),
              },
            },
          } : undefined,
        },
        select: { id: true, cpf: true, fullName: true, role: true, status: true, phone: true, email: true },
      });
      const action = input.status === "INATIVO" && current.status !== UserStatus.INATIVO
        ? "USUARIO_DESATIVADO"
        : input.status === "ATIVO" && current.status !== UserStatus.ATIVO
          ? "USUARIO_REATIVADO"
          : "USUARIO_ATUALIZADO";
      await audit({
        actorId: session.userId,
        actorRole: session.role,
        action,
        entityType: "User",
        entityId: id,
        patientId: current.role === Role.PACIENTE ? id : undefined,
        before: { cpf: current.cpf, fullName: current.fullName, phone: current.phone, email: current.email, status: current.status },
        after: user,
      }, tx);
      return user;
    });

    return NextResponse.json({ message: "Cadastro atualizado com sucesso.", user: updated });
  } catch (error) {
    return apiError(error);
  }
}
