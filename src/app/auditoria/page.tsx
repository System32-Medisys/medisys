import { Role } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { requirePageRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime, formatStatus } from "@/lib/format";

export default async function AuditPage() {
  const session = await requirePageRole([Role.ADMINISTRADOR]);
  const logs = await db.auditLog.findMany({
    include: { actor: { select: { fullName: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return <AppShell currentPath="/auditoria" role={session.role} title="Auditoria" subtitle="Acompanhe as operações importantes registradas pelo sistema." userName={session.user.fullName}>
    <section className="card table-card">
      {logs.length === 0 ? <p className="empty-state">Nenhum registro de auditoria encontrado.</p> : <div className="table-scroll"><table>
        <thead><tr><th>Data e hora</th><th>Usuário</th><th>Ação</th><th>Entidade</th><th>Resultado</th></tr></thead>
        <tbody>{logs.map((log) => <tr key={log.id}><td>{formatDateTime(log.createdAt)}</td><td>{log.actor?.fullName || "Sistema"}</td><td>{formatStatus(log.action)}</td><td>{log.entityType || "—"}</td><td><span className="status-badge">{formatStatus(log.result)}</span></td></tr>)}</tbody>
      </table></div>}
    </section>
  </AppShell>;
}
