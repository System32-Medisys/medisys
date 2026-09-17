import { Role } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { requirePageSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime, formatStatus } from "@/lib/format";

export default async function ExamsPage() {
  const session = await requirePageSession();
  const where = session.role === Role.PACIENTE ? { patientId: session.userId } : {};
  const exams = await db.examAppointment.findMany({
    where,
    include: {
      patient: { select: { fullName: true } },
      examType: { select: { name: true } },
      results: { orderBy: { version: "desc" }, take: 1 },
    },
    orderBy: { scheduledAt: "desc" },
  });
  const title = session.role === Role.PACIENTE ? "Meus exames" : "Exames e resultados";

  return <AppShell currentPath="/exames" role={session.role} title={title} subtitle="Acompanhe os exames e a disponibilidade dos resultados." userName={session.user.fullName}>
    <section className="card table-card">
      {exams.length === 0 ? <p className="empty-state">Nenhum exame encontrado.</p> : <div className="table-scroll"><table>
        <thead><tr><th>Data e hora</th>{session.role !== Role.PACIENTE && <th>Paciente</th>}<th>Tipo</th><th>Status</th><th>Resultado</th></tr></thead>
        <tbody>{exams.map((item) => <tr key={item.id}>
          <td>{formatDateTime(item.scheduledAt)}</td>
          {session.role !== Role.PACIENTE && <td>{item.patient.fullName}</td>}
          <td>{item.examType.name}</td>
          <td><span className="status-badge">{formatStatus(item.status)}</span></td>
          <td>{item.results[0] ? `Versão ${item.results[0].version}` : "Pendente"}</td>
        </tr>)}</tbody>
      </table></div>}
    </section>
  </AppShell>;
}
