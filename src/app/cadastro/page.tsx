import { Role } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { requirePageRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { CadastroForm } from "./cadastro-form";

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const session = await requirePageRole([Role.ATENDENTE, Role.ADMINISTRADOR]);
  const params = await searchParams;
  const initialType = params.tipo === Role.MEDICO ? Role.MEDICO : Role.PACIENTE;
  const specialties = await db.specialty.findMany({
    where: { active: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <AppShell
      currentPath="/cadastro"
      role={session.role}
      title="Cadastro de pessoas"
      subtitle="Cadastre pacientes e médicos conforme as regras da clínica."
      userName={session.user.fullName}
    >
      <CadastroForm initialType={initialType} specialties={specialties} />
    </AppShell>
  );
}
