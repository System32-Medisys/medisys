import { Role } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { requirePageRole } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AttendantsPage() {
  const session = await requirePageRole([Role.ADMINISTRADOR]);
  const attendants = await db.user.findMany({ where: { role: Role.ATENDENTE }, orderBy: { fullName: "asc" } });

  return <AppShell currentPath="/atendentes" role={session.role} title="Atendentes" subtitle="Consulte os atendentes cadastrados no sistema." userName={session.user.fullName}>
    <section className="card table-card">
      {attendants.length === 0 ? <p className="empty-state">Nenhum atendente cadastrado.</p> : <div className="table-scroll"><table>
        <thead><tr><th>Nome</th><th>CPF</th><th>Telefone</th><th>E-mail</th><th>Status</th></tr></thead>
        <tbody>{attendants.map((item) => <tr key={item.id}><td>{item.fullName}</td><td>{item.cpf}</td><td>{item.phone}</td><td>{item.email || "—"}</td><td><span className="status-badge">{item.status.toLowerCase()}</span></td></tr>)}</tbody>
      </table></div>}
    </section>
  </AppShell>;
}
