import { ConsultationStatus, Role } from "@prisma/client";
import { ListFilters } from "@/components/list-filters";
import { clinicDay, field, type ListParams } from "@/lib/list-filters";
import Link from "next/link";
import { AppointmentActions } from "@/components/appointment-actions";
import { AppShell } from "@/components/app-shell";
import { requirePageSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime, formatStatus } from "@/lib/format";
import styles from "./consultas.module.css";

export default async function ConsultationsPage({ searchParams }: { searchParams: Promise<ListParams> }) {
  const session = await requirePageSession();
  const params = await searchParams;
  const status = Object.values(ConsultationStatus).find((value) => value === field(params, "status"));
  const where = session.role === Role.PACIENTE
    ? { patientId: session.userId }
    : session.role === Role.MEDICO
      ? { doctorId: session.userId }
      : {};
  const consultations = await db.consultation.findMany({
    where: { ...where, status, scheduledAt: clinicDay(field(params,"data")),
      ...(session.role !== Role.PACIENTE && field(params,"paciente") ? { patient: { fullName: { contains: field(params,"paciente"), mode: "insensitive" } } } : {}),
      ...(field(params,"medico") ? { doctor: { fullName: { contains: field(params,"medico"), mode: "insensitive" } } } : {}),
    },
    include: { patient: { select: { fullName: true } }, doctor: { select: { fullName: true } } },
    orderBy: { scheduledAt: "desc" },
  });
  const title = session.role === Role.MEDICO ? "Minha agenda" : session.role === Role.PACIENTE ? "Minhas consultas" : "Consultas";

  return <AppShell currentPath="/consultas" role={session.role} title={title} subtitle="Consulte os agendamentos disponíveis para o seu perfil." userName={session.user.fullName}>
    {(session.role === Role.ATENDENTE || session.role === Role.ADMINISTRADOR) && <div className={styles.toolbar}>
      <Link className={styles.createButton} href="/consultas/nova">Agendar consulta</Link>
    </div>}
    <ListFilters action="/consultas" params={params} fields={[["data","Data (Porto Velho)","date"], ["paciente","Paciente"], ["medico","Médico"]].filter(([key]) => key !== "paciente" || session.role !== Role.PACIENTE) as Array<[string,string,string?]>} statuses={Object.values(ConsultationStatus)} />
    <section className="card table-card">
      {consultations.length === 0 ? <p className="empty-state">Nenhuma consulta encontrada.</p> : <div className="table-scroll"><table>
        <thead><tr><th>Data e hora</th>{session.role !== Role.PACIENTE && <th>Paciente</th>}{session.role !== Role.MEDICO && <th>Médico</th>}<th>Status</th></tr></thead>
        <tbody>{consultations.map((item) => <tr key={item.id}>
          <td>{formatDateTime(item.scheduledAt)}</td>
          {session.role !== Role.PACIENTE && <td>{item.patient.fullName}</td>}
          {session.role !== Role.MEDICO && <td>{item.doctor.fullName}</td>}
          <td><span className="status-badge">{formatStatus(item.status)}</span>
            {(session.role === Role.ATENDENTE || session.role === Role.ADMINISTRADOR) &&
              <AppointmentActions key={item.status} kind="consultation" id={item.id} status={item.status} />}
          </td>
        </tr>)}</tbody>
      </table></div>}
    </section>
  </AppShell>;
}
