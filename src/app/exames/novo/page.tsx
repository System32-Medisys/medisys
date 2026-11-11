import { Role, UserStatus } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { ScheduleForm } from "@/components/schedule-form";
import { requirePageRole } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function NewExamPage() {
  const session = await requirePageRole([Role.ATENDENTE, Role.ADMINISTRADOR]);
  const [patients, examTypes] = await Promise.all([
    db.user.findMany({
      where: { role: Role.PACIENTE, status: UserStatus.ATIVO },
      select: { id: true, fullName: true, cpf: true },
      orderBy: { fullName: "asc" },
    }),
    db.examType.findMany({
      where: { active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <AppShell
      currentPath="/exames"
      role={session.role}
      title="Agendar exame"
      subtitle="Selecione paciente, tipo de exame, data e horário."
      userName={session.user.fullName}
    >
      <ScheduleForm
        kind="exam"
        patients={patients.map((patient) => ({ id: patient.id, label: `${patient.fullName} — CPF ${patient.cpf}` }))}
        targets={examTypes.map((examType) => ({ id: examType.id, label: examType.name }))}
      />
    </AppShell>
  );
}
