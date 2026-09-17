import { Role } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { requirePageRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export default async function PatientsPage() {
  const session = await requirePageRole([Role.ATENDENTE, Role.ADMINISTRADOR]);
  const patients = await db.user.findMany({ where: { role: Role.PACIENTE }, orderBy: { fullName: "asc" } });

  return <AppShell currentPath="/pacientes" role={session.role} title="Pacientes" subtitle="Consulte os pacientes cadastrados na clínica." userName={session.user.fullName}>
    <section className="card table-card">
      {patients.length === 0 ? <p className="empty-state">Nenhum paciente cadastrado.</p> : <div className="table-scroll"><table>
        <thead><tr><th>Nome</th><th>CPF</th><th>Nascimento</th><th>Telefone</th><th>Status</th></tr></thead>
        <tbody>{patients.map((patient) => <tr key={patient.id}><td>{patient.fullName}</td><td>{patient.cpf}</td><td>{formatDate(patient.birthDate)}</td><td>{patient.phone}</td><td><span className="status-badge">{patient.status.toLowerCase()}</span></td></tr>)}</tbody>
      </table></div>}
    </section>
  </AppShell>;
}
