import { Role } from "@prisma/client";
import { ListFilters } from "@/components/list-filters";
import { field, type ListParams } from "@/lib/list-filters";
import { AppShell } from "@/components/app-shell";
import { RegistrationActions } from "@/components/registration-actions";
import { AccountAccess } from "@/components/account-access";
import { requirePageRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export default async function PatientsPage({ searchParams }: { searchParams: Promise<ListParams> }) {
  const session = await requirePageRole([Role.ATENDENTE, Role.ADMINISTRADOR]);
  const params = await searchParams;
  const query = field(params, "q");
  const cpf = /^[\d.\-\s]+$/.test(query) ? query.replace(/\D/g, "") : "";
  const patients = await db.user.findMany({
    where: { role: Role.PACIENTE, ...(query ? { OR: [
      { fullName: { contains: query, mode: "insensitive" } },
      ...(cpf ? [{ cpf: { contains: cpf } }] : []),
    ] } : {}) }, orderBy: { fullName: "asc" },
  });
  return <AppShell currentPath="/pacientes" role={session.role} title="Pacientes" subtitle="Edite ou desative pacientes sem excluir o histórico." userName={session.user.fullName}>
    <ListFilters action="/pacientes" params={params} fields={[["q", "Nome ou CPF"]]} />
    <section className="card table-card">
      {patients.length === 0 ? <p className="empty-state">Nenhum paciente cadastrado.</p> : <div className="table-scroll"><table>
        <thead><tr><th>Nome</th><th>CPF</th><th>Nascimento</th><th>Telefone</th><th>Status</th><th>Ações</th></tr></thead>
        <tbody>{patients.map((patient) => <tr key={patient.id}><td>{patient.fullName}</td><td>{patient.cpf}</td><td>{formatDate(patient.birthDate)}</td><td>{patient.phone}</td><td><span className="status-badge">{patient.status.toLowerCase()}</span></td><td><RegistrationActions active={patient.status === "ATIVO"} id={patient.id} />{session.role === Role.ADMINISTRADOR && patient.status !== "INATIVO" && <AccountAccess id={patient.id} blocked={patient.status === "BLOQUEADO"} />}</td></tr>)}</tbody>
      </table></div>}
    </section>
  </AppShell>;
}
