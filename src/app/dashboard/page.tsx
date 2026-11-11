import {
  ConsultationStatus,
  ExamStatus,
  Role,
  UserStatus,
} from "@prisma/client";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { requirePageSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime, formatStatus } from "@/lib/format";

export default async function DashboardPage() {
  const session = await requirePageSession();
  const whereConsultation = session.role === Role.PACIENTE
    ? { patientId: session.userId }
    : session.role === Role.MEDICO
      ? { doctorId: session.userId }
      : {};
  const whereExam = session.role === Role.PACIENTE ? { patientId: session.userId } : {};
  const isStaff = session.role === Role.ATENDENTE || session.role === Role.ADMINISTRADOR;

  const todayStart = new Date();
  todayStart.setUTCHours(3, 0, 0, 0);
  if (todayStart > new Date()) todayStart.setUTCDate(todayStart.getUTCDate() - 1);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);
  const todayRange = { gte: todayStart, lt: tomorrowStart };

  const [todayConsultations, todayExams, activePatients, pendingConsultations, pendingExams] =
    await Promise.all([
      db.consultation.findMany({
        where: { ...whereConsultation, scheduledAt: todayRange },
        include: {
          patient: { select: { fullName: true } },
          doctor: { select: { fullName: true } },
        },
        orderBy: { scheduledAt: "asc" },
      }),
      db.examAppointment.findMany({
        where: { ...whereExam, scheduledAt: todayRange },
        include: {
          patient: { select: { fullName: true } },
          examType: { select: { name: true } },
        },
        orderBy: { scheduledAt: "asc" },
      }),
      isStaff
        ? db.user.count({ where: { role: Role.PACIENTE, status: UserStatus.ATIVO } })
        : Promise.resolve(0),
      db.consultation.count({
        where: {
          ...whereConsultation,
          status: { in: [ConsultationStatus.AGENDADA, ConsultationStatus.CONFIRMADA] },
          scheduledAt: { gte: new Date() },
        },
      }),
      db.examAppointment.count({
        where: {
          ...whereExam,
          status: { in: [ExamStatus.AGENDADO, ExamStatus.RESULTADO_PENDENTE] },
        },
      }),
    ]);

  const agenda = [
    ...todayConsultations.map((item) => ({
      id: item.id,
      kind: "Consulta",
      scheduledAt: item.scheduledAt,
      title: session.role === Role.PACIENTE ? item.doctor.fullName : item.patient.fullName,
      detail: session.role === Role.PACIENTE ? "Consulta médica" : `Dr(a). ${item.doctor.fullName}`,
      status: formatStatus(item.status),
    })),
    ...todayExams.map((item) => ({
      id: item.id,
      kind: "Exame",
      scheduledAt: item.scheduledAt,
      title: session.role === Role.PACIENTE ? item.examType.name : item.patient.fullName,
      detail: item.examType.name,
      status: formatStatus(item.status),
    })),
  ]
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
    .slice(0, 6);

  const firstName = session.user.fullName.split(" ")[0];
  const pendingTotal = pendingConsultations + pendingExams;

  return (
    <AppShell
      currentPath="/dashboard"
      role={session.role}
      title={`Bom dia, ${firstName}`}
      subtitle="Aqui está o resumo da clínica para hoje."
      userName={session.user.fullName}
    >
      <section className="kpi-grid" aria-label="Resumo do dia">
        <Link className="kpi-card" href="/consultas">
          <span className="kpi-icon calendar-icon" aria-hidden="true">▣</span>
          <span><small>Consultas hoje</small><strong>{todayConsultations.length}</strong><em>Ver agenda</em></span>
        </Link>
        <Link className="kpi-card" href="/exames">
          <span className="kpi-icon exam-icon" aria-hidden="true">✚</span>
          <span><small>Exames hoje</small><strong>{todayExams.length}</strong><em>Ver exames</em></span>
        </Link>
        <Link className="kpi-card" href={isStaff ? "/pacientes" : "/configuracoes"}>
          <span className="kpi-icon patient-icon" aria-hidden="true">●</span>
          <span>
            <small>{isStaff ? "Pacientes ativos" : "Situação da conta"}</small>
            <strong>{isStaff ? activePatients : "Ativa"}</strong>
            <em>{isStaff ? "Ver cadastros" : "Acesso autorizado"}</em>
          </span>
        </Link>
        <article className="kpi-card warning">
          <span className="kpi-icon pending-icon" aria-hidden="true">!</span>
          <span><small>Pendências</small><strong>{pendingTotal}</strong><em>Requerem acompanhamento</em></span>
        </article>
      </section>

      <div className="dashboard-grid proposal-grid">
        <section className="card agenda-card" aria-labelledby="today-agenda-title">
          <div className="section-heading">
            <div>
              <h2 id="today-agenda-title">Agenda de hoje</h2>
              <p className="muted">Consultas e exames ordenados por horário.</p>
            </div>
            <Link className="text-link" href="/consultas">Ver agenda completa →</Link>
          </div>

          {agenda.length === 0 ? (
            <p className="empty-state">Nenhum atendimento agendado para hoje.</p>
          ) : (
            <div className="agenda-list">
              {agenda.map((item) => (
                <article className="agenda-row" key={`${item.kind}-${item.id}`}>
                  <time>{formatDateTime(item.scheduledAt).split(" ")[1]}</time>
                  <span className={item.kind === "Consulta" ? "agenda-kind consultation" : "agenda-kind exam"}>
                    {item.kind}
                  </span>
                  <span className="agenda-person"><strong>{item.title}</strong><small>{item.detail}</small></span>
                  <span className="status-badge">{item.status}</span>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="card actions-card" aria-labelledby="quick-actions-title">
          <div className="section-heading">
            <div>
              <h2 id="quick-actions-title">Ações rápidas</h2>
              <p className="muted">Atalhos para tarefas frequentes.</p>
            </div>
          </div>
          <div className="quick-actions">
            {isStaff ? (
              <>
                <Link className="quick-action primary-action" href="/consultas/nova">
                  <span className="quick-action-icon" aria-hidden="true">+</span>
                  <span><strong>Agendar consulta</strong><small>Novo atendimento médico</small></span>
                </Link>
                <Link className="quick-action" href="/exames/novo">
                  <span className="quick-action-icon" aria-hidden="true">+</span>
                  <span><strong>Agendar exame</strong><small>Novo procedimento</small></span>
                </Link>
                <Link className="quick-action" href="/cadastro">
                  <span className="quick-action-icon" aria-hidden="true">+</span>
                  <span><strong>Cadastrar paciente</strong><small>Novo cadastro no sistema</small></span>
                </Link>
              </>
            ) : (
              <>
                <Link className="quick-action primary-action" href="/consultas">
                  <span className="quick-action-icon" aria-hidden="true">→</span>
                  <span><strong>Minhas consultas</strong><small>Ver horários e status</small></span>
                </Link>
                <Link className="quick-action" href="/exames">
                  <span className="quick-action-icon" aria-hidden="true">→</span>
                  <span><strong>Exames e resultados</strong><small>Acessar informações</small></span>
                </Link>
              </>
            )}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
