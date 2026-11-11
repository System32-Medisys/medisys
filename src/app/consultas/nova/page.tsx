import { Role, UserStatus } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { ScheduleForm } from "@/components/schedule-form";
import { requirePageRole } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function NewConsultationPage() {
  const session = await requirePageRole([Role.ATENDENTE, Role.ADMINISTRADOR]);
  const [patients, doctors] = await Promise.all([
    db.user.findMany({
      where: { role: Role.PACIENTE, status: UserStatus.ATIVO },
      select: { id: true, fullName: true, cpf: true },
      orderBy: { fullName: "asc" },
    }),
    db.user.findMany({
      where: { role: Role.MEDICO, status: UserStatus.ATIVO },
      select: { id: true, fullName: true, doctor: { select: { crm: true, crmState: true } } },
      orderBy: { fullName: "asc" },
    }),
  ]);

  return (
    <AppShell
      currentPath="/consultas"
      role={session.role}
      title="Agendar consulta"
      subtitle="Selecione paciente, médico, data e horário."
      userName={session.user.fullName}
    >
      <ScheduleForm
        kind="consultation"
        patients={patients.map((patient) => ({ id: patient.id, label: `${patient.fullName} — CPF ${patient.cpf}` }))}
        targets={doctors.map((doctor) => ({
          id: doctor.id,
          label: doctor.doctor
            ? `${doctor.fullName} — CRM ${doctor.doctor.crm}/${doctor.doctor.crmState}`
            : doctor.fullName,
        }))}
      />
    </AppShell>
  );
}
