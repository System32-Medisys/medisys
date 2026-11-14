import { ConsultationStatus, ExamStatus, Prisma, Role } from "@prisma/client";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { requirePageSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime, formatStatus } from "@/lib/format";

export default async function PendingPage() {
  const session = await requirePageSession();
  const consultationAccess = session.role === Role.PACIENTE
    ? { patientId: session.userId }
    : session.role === Role.MEDICO
      ? { doctorId: session.userId }
      : {};
  const examAccess = session.role === Role.PACIENTE ? { patientId: session.userId } : {};

  const consultationWhere: Prisma.ConsultationWhereInput = {
    ...consultationAccess,
    status: { in: [ConsultationStatus.AGENDADA, ConsultationStatus.CONFIRMADA] },
    scheduledAt: { gte: new Date() },
  };
  const examWhere: Prisma.ExamAppointmentWhereInput = {
    ...examAccess,
    status: { in: [ExamStatus.AGENDADO, ExamStatus.RESULTADO_PENDENTE] },
  };

  const [consultations, exams, consultationTotal, examTotal] = await Promise.all([
    db.consultation.findMany({
      where: consultationWhere,
      include: { patient: { select: { fullName: true } }, doctor: { select: { fullName: true } } },
      orderBy: { scheduledAt: "asc" },
      take: 20,
    }),
    db.examAppointment.findMany({
      where: examWhere,
      include: { patient: { select: { fullName: true } }, examType: { select: { name: true } } },
      orderBy: { scheduledAt: "asc" },
      take: 20,
    }),
    db.consultation.count({ where: consultationWhere }),
    db.examAppointment.count({ where: examWhere }),
  ]);

  return (
    <AppShell
      currentPath="/pendencias"
      role={session.role}
      title="Pendências"
      subtitle="Acompanhe os registros que ainda precisam de confirmação, realização ou resultado."
      userName={session.user.fullName}
    >
      <section className="pending-summary" aria-label="Resumo das pendências">
        <article className="mini-summary"><small>Consultas</small><strong>{consultationTotal}</strong><span>Aguardando atendimento</span></article>
        <article className="mini-summary"><small>Exames</small><strong>{examTotal}</strong><span>Agendados ou sem resultado</span></article>
        <article className="mini-summary total"><small>Total</small><strong>{consultationTotal + examTotal}</strong><span>Itens para acompanhar</span></article>
      </section>

      <div className="pending-columns">
        <section className="card table-card">
          <div className="section-heading pending-heading">
            <div><h2>Consultas pendentes</h2><p className="muted">Agendadas ou confirmadas. Exibindo até 20 registros.</p></div>
            <Link className="text-link" href="/consultas">Ver consultas →</Link>
          </div>
          {consultations.length === 0 ? (
            <p className="empty-state">Não há consultas pendentes.</p>
          ) : (
            <div className="compact-list">
              {consultations.map((item) => (
                <Link className="compact-item" href="/consultas" key={item.id}>
                  <span><strong>{item.patient.fullName}</strong><small>{formatDateTime(item.scheduledAt)} · {item.doctor.fullName}</small></span>
                  <span className="status-badge">{formatStatus(item.status)}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="card table-card">
          <div className="section-heading pending-heading">
            <div><h2>Exames pendentes</h2><p className="muted">Agendados ou aguardando resultado. Exibindo até 20 registros.</p></div>
            <Link className="text-link" href="/exames">Ver exames →</Link>
          </div>
          {exams.length === 0 ? (
            <p className="empty-state">Não há exames pendentes.</p>
          ) : (
            <div className="compact-list">
              {exams.map((item) => (
                <Link className="compact-item" href="/exames" key={item.id}>
                  <span><strong>{item.examType.name}</strong><small>{item.patient.fullName} · {formatDateTime(item.scheduledAt)}</small></span>
                  <span className="status-badge">{formatStatus(item.status)}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
