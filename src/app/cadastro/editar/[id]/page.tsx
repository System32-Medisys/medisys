import { Role } from "@prisma/client";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { EditUserForm } from "@/components/edit-user-form";
import { requirePageSession } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function EditRegistrationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePageSession();
  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    include: { address: true, doctor: { include: { specialties: true } } },
  });
  if (!user || !user.address || user.role === Role.ADMINISTRADOR) notFound();
  const allowed = user.role === Role.ATENDENTE
    ? session.role === Role.ADMINISTRADOR
    : session.role === Role.ATENDENTE || session.role === Role.ADMINISTRADOR;
  if (!allowed) notFound();

  const specialties = user.role === Role.MEDICO
    ? await db.specialty.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } })
    : [];
  const destination = user.role === Role.PACIENTE ? "/pacientes" : user.role === Role.MEDICO ? "/medicos" : "/atendentes";
  const roleLabel = user.role === Role.PACIENTE ? "paciente" : user.role === Role.MEDICO ? "médico" : "atendente";

  return (
    <AppShell currentPath={destination} role={session.role} title={`Editar ${roleLabel}`} subtitle="Atualize os dados sem apagar o histórico do cadastro." userName={session.user.fullName}>
      <EditUserForm
        destination={destination}
        specialties={specialties}
        user={{
          id: user.id,
          role: user.role as "PACIENTE" | "MEDICO" | "ATENDENTE",
          cpf: user.cpf,
          fullName: user.fullName,
          birthDate: user.birthDate.toISOString().slice(0, 10),
          phone: user.phone,
          email: user.email,
          sex: user.sex,
          healthInsurance: user.healthInsurance,
          crm: user.doctor?.crm,
          crmState: user.doctor?.crmState,
          serviceDays: user.doctor?.serviceDays,
          specialtyIds: user.doctor?.specialties.map((item) => item.specialtyId) ?? [],
          address: user.address,
        }}
      />
    </AppShell>
  );
}
