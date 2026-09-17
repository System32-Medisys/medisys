import { Role } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { requirePageRole } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function ExamTypesPage() {
  const session = await requirePageRole([Role.ATENDENTE, Role.ADMINISTRADOR]);
  const examTypes = await db.examType.findMany({ orderBy: { name: "asc" } });

  return <AppShell currentPath="/tipos-exames" role={session.role} title="Tipos de exames" subtitle="Consulte os exames oferecidos pela clínica." userName={session.user.fullName}>
    <section className="card table-card">
      {examTypes.length === 0 ? <p className="empty-state">Nenhum tipo de exame cadastrado.</p> : <div className="table-scroll"><table>
        <thead><tr><th>Nome</th><th>Descrição</th><th>Status</th></tr></thead>
        <tbody>{examTypes.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.description}</td><td><span className="status-badge">{item.active ? "ativo" : "inativo"}</span></td></tr>)}</tbody>
      </table></div>}
    </section>
  </AppShell>;
}
