import { Role } from "@prisma/client";
import { ListFilters } from "@/components/list-filters";
import { clinicDay, field, type ListParams } from "@/lib/list-filters";
import { AppShell } from "@/components/app-shell";
import { requirePageRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime, formatStatus } from "@/lib/format";

export default async function AuditPage({ searchParams }: { searchParams: Promise<ListParams> }) {
  const session = await requirePageRole([Role.ADMINISTRADOR]);
  const params = await searchParams;
  const start = clinicDay(field(params, "de"));
  const end = clinicDay(field(params, "ate"));
  const logs = await db.auditLog.findMany({
    where: {
      actorId: field(params, "usuario") || undefined,
      patientId: field(params, "paciente") || undefined,
      action: field(params, "acao") ? { contains: field(params, "acao"), mode: "insensitive" } : undefined,
      createdAt: { gte: start?.gte, lt: end?.lt },
    },
    include: { actor: { select: { fullName: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return <AppShell currentPath="/auditoria" role={session.role} title="Auditoria" subtitle="Acompanhe as operações importantes registradas pelo sistema." userName={session.user.fullName}>
    <ListFilters action="/auditoria" params={params} fields={[["usuario","ID do usuário"], ["paciente","ID do paciente"], ["acao","Ação"], ["de","De","date"], ["ate","Até","date"]]} />
    <section className="card table-card">
      {logs.length === 0 ? <p className="empty-state">Nenhum registro de auditoria encontrado.</p> : <div className="table-scroll"><table>
        <thead><tr><th>Data e hora</th><th>Usuário</th><th>Ação</th><th>Entidade</th><th>Resultado</th></tr></thead>
        <tbody>{logs.map((log) => <tr key={log.id}><td>{formatDateTime(log.createdAt)}</td><td>{log.actor?.fullName || "Sistema"}</td><td>{formatStatus(log.action)}</td><td>{log.entityType || "—"}</td><td><span className="status-badge">{formatStatus(log.result)}</span></td></tr>)}</tbody>
      </table></div>}
    </section>
  </AppShell>;
}
