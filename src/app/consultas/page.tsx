import { Role } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { requirePageSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime, formatStatus } from "@/lib/format";

export default async function ConsultationsPage() {
  const session = await requirePageSession();
  const where = session.role === Role.PACIENTE
    ? { patientId: session.userId }
    : session.role === Role.MEDICO
      ? { doctorId: session.userId }
      : {};
  const consultations = await db.consultation.findMany({
    where,
    include: { patient: { select: { fullName: true } }, doctor: { select: { fullName: true } } },
    orderBy: { scheduledAt: "desc" },
  });
  const title = session.role === Role.MEDICO ? "Minha agenda" : session.role === Role.PACIENTE ? "Minhas consultas" : "Consultas";

  return <AppShell currentPath="/consultas" role={session.role} title={title} subtitle="Consulte os agendamentos disponíveis para o seu perfil." userName={session.user.fullName}>
    <section className="card table-card">
      {consultations.length === 0 ? <p className="empty-state">Nenhuma consulta encontrada.</p> : <div className="table-scroll"><table>
        <thead><tr><th>Data e hora</th>{session.role !== Role.PACIENTE && <th>Paciente</th>}{session.role !== Role.MEDICO && <th>Médico</th>}<th>Status</th></tr></thead>
        <tbody>{consultations.map((item) => <tr key={item.id}>
          <td>{formatDateTime(item.scheduledAt)}</td>
          {session.role !== Role.PACIENTE && <td>{item.patient.fullName}</td>}
          {session.role !== Role.MEDICO && <td>{item.doctor.fullName}</td>}
          <td><span className="status-badge">{formatStatus(item.status)}</span></td>
        </tr>)}</tbody>
      </table></div>}
    </section>
  </AppShell>;
}
