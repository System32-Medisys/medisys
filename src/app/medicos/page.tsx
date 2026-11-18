import { Role } from "@prisma/client";
import { ListFilters } from "@/components/list-filters";
import { field, type ListParams } from "@/lib/list-filters";
import { AppShell } from "@/components/app-shell";
import { RegistrationActions } from "@/components/registration-actions";
import { AccountAccess } from "@/components/account-access";
import { requirePageRole } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DoctorsPage({ searchParams }: { searchParams: Promise<ListParams> }) {
  const session = await requirePageRole([Role.ATENDENTE, Role.ADMINISTRADOR]);
  const params = await searchParams;
  const query = field(params, "q");
  const doctors = await db.user.findMany({
    where: { role: Role.MEDICO, ...(query ? { OR: [
      { fullName: { contains: query, mode: "insensitive" } },
      { doctor: { crm: { contains: query } } },
      { doctor: { specialties: { some: { specialty: { name: { contains: query, mode: "insensitive" } } } } } },
    ] } : {}) },
    include: { doctor: { include: { specialties: { include: { specialty: true } } } } }, orderBy: { fullName: "asc" },
  });
  return <AppShell currentPath="/medicos" role={session.role} title="Médicos" subtitle="Edite ou desative médicos preservando consultas anteriores." userName={session.user.fullName}>
    <ListFilters action="/medicos" params={params} fields={[["q", "Nome, CRM ou especialidade"]]} />
    <section className="card table-card">
      {doctors.length === 0 ? <p className="empty-state">Nenhum médico cadastrado.</p> : <div className="table-scroll"><table>
        <thead><tr><th>Nome</th><th>CRM</th><th>Especialidades</th><th>Telefone</th><th>Status</th><th>Ações</th></tr></thead>
        <tbody>{doctors.map((doctor) => <tr key={doctor.id}>
          <td>{doctor.fullName}</td><td>{doctor.doctor ? `${doctor.doctor.crm}/${doctor.doctor.crmState}` : "—"}</td>
          <td>{doctor.doctor?.specialties.map((item) => item.specialty.name).join(", ") || "—"}</td><td>{doctor.phone}</td><td><span className="status-badge">{doctor.status.toLowerCase()}</span></td><td><RegistrationActions active={doctor.status === "ATIVO"} id={doctor.id} />{session.role === Role.ADMINISTRADOR && doctor.status !== "INATIVO" && <AccountAccess id={doctor.id} blocked={doctor.status === "BLOQUEADO"} />}</td>
        </tr>)}</tbody>
      </table></div>}
    </section>
  </AppShell>;
}
