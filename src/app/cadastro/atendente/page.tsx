import { Role } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { requirePageRole } from "@/lib/auth";
import { CadastroForm } from "../cadastro-form";

export default async function CadastroAtendentePage() {
  const session = await requirePageRole([Role.ADMINISTRADOR]);

  return (
    <AppShell
      currentPath="/atendentes"
      role={session.role}
      title="Cadastro de atendente"
      subtitle="Cadastre um novo atendente para operar os módulos da clínica."
      userName={session.user.fullName}
    >
      <CadastroForm fixedType initialType="ATENDENTE" specialties={[]} />
    </AppShell>
  );
}
