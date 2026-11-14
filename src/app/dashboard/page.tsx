import { ConsultationStatus, ExamStatus, Prisma, Role, UserStatus } from "@prisma/client";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { requirePageSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime, formatStatus } from "@/lib/format";
import {
  CLINIC_TIME_ZONE, getClinicDayRange, getClinicHour, getNextUpcomingAppointment,
  getDashboardPeriodRange, getDashboardDailySeries, parseDashboardPeriod,
  getPreviousDashboardPeriodRange, calculatePeriodChange,
} from "@/lib/dashboard";
import styles from "./dashboard.module.css";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; medico?: string; tipoExame?: string; statusConsulta?: string; statusExame?: string }>;
}) {
  const session = await requirePageSession();
  const params = await searchParams;
  const period = parseDashboardPeriod(params.periodo);

  const isStaff = session.role === Role.ATENDENTE || session.role === Role.ADMINISTRADOR;
  const [doctorOptions, examTypeOptions] = await Promise.all([
    isStaff ? db.user.findMany({
      where: { role: Role.MEDICO, status: UserStatus.ATIVO },
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    }) : Promise.resolve([]),
    isStaff ? db.examType.findMany({
      where: { active: true }, select: { id: true, name: true },
      orderBy: { name: "asc" },
    }) : Promise.resolve([]),
  ]);
  // Os IDs e status passados na URL são validados, nunca usados diretamente.
  const doctorId = isStaff && doctorOptions.some((item) => item.id === params.medico) ? params.medico : undefined;
  const examTypeId = isStaff && examTypeOptions.some((item) => item.id === params.tipoExame) ? params.tipoExame : undefined;
  const consultationStatus = Object.values(ConsultationStatus).find((item) => item === params.statusConsulta);
  const examStatus = Object.values(ExamStatus).find((item) => item === params.statusExame);
  const filterParams = new URLSearchParams({ periodo: period });
  if (doctorId) filterParams.set("medico", doctorId);
  if (examTypeId) filterParams.set("tipoExame", examTypeId);
  if (consultationStatus) filterParams.set("statusConsulta", consultationStatus);
  if (examStatus) filterParams.set("statusExame", examStatus);
  const exportHref = "/dashboard/exportar?" + filterParams.toString();
  const consultationAccess: Prisma.ConsultationWhereInput = session.role === Role.PACIENTE
    ? { patientId: session.userId }
    : session.role === Role.MEDICO ? { doctorId: session.userId } : {};
  const examAccess: Prisma.ExamAppointmentWhereInput = session.role === Role.PACIENTE
    ? { patientId: session.userId } : {};

  const now = new Date();
  const { start: todayStart, end: todayEnd } = getClinicDayRange(now);
  const { start, end } = getDashboardPeriodRange(now, period);
  const periodRange = { gte: start, lt: end };
  const todayRange = { gte: todayStart, lt: todayEnd };
  const dayAhead = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const previousRange = getPreviousDashboardPeriodRange(now, period);
  const analyticsConsultations: Prisma.ConsultationWhereInput = {
    ...consultationAccess,
    ...(doctorId ? { doctorId } : {}),
    ...(consultationStatus ? { status: consultationStatus } : {}),
  };
  const analyticsExams: Prisma.ExamAppointmentWhereInput = {
    ...examAccess,
    ...(examTypeId ? { examTypeId } : {}),
    ...(examStatus ? { status: examStatus } : {}),
  };
  const pendingConsultationWhere: Prisma.ConsultationWhereInput = {
    ...consultationAccess,
    status: { in: [ConsultationStatus.AGENDADA, ConsultationStatus.CONFIRMADA] },
    scheduledAt: { gte: now },
  };
  const pendingExamWhere: Prisma.ExamAppointmentWhereInput = {
    ...examAccess,
    status: { in: [ExamStatus.AGENDADO, ExamStatus.RESULTADO_PENDENTE] },
  };

  const [
    periodConsultations, periodExams,
    todayConsultations, todayExams,
    activePatients, pendingConsultations, pendingExams,
    upcomingSoon, awaitingResults, nextConsultations, nextExams,
    previousConsultations, previousExams, overdueConsultations, productivity,
  ] = await Promise.all([
    db.consultation.findMany({
      where: { ...analyticsConsultations, scheduledAt: periodRange },
      select: { scheduledAt: true, status: true },
      orderBy: { scheduledAt: "asc" },
    }),
    db.examAppointment.findMany({
      where: { ...analyticsExams, scheduledAt: periodRange },
      select: { scheduledAt: true, status: true },
      orderBy: { scheduledAt: "asc" },
    }),
    db.consultation.findMany({
      where: { ...consultationAccess, scheduledAt: todayRange },
      include: {
        patient: { select: { fullName: true } },
        doctor: { select: { fullName: true } },
      },
      orderBy: { scheduledAt: "asc" },
    }),
    db.examAppointment.findMany({
      where: { ...examAccess, scheduledAt: todayRange },
      include: {
        patient: { select: { fullName: true } },
        examType: { select: { name: true } },
      },
      orderBy: { scheduledAt: "asc" },
    }),
    isStaff ? db.user.count({ where: { role: Role.PACIENTE, status: UserStatus.ATIVO } }) : Promise.resolve(0),
    db.consultation.count({ where: pendingConsultationWhere }),
    db.examAppointment.count({ where: pendingExamWhere }),
    db.consultation.count({
      where: { ...pendingConsultationWhere, scheduledAt: { gte: now, lt: dayAhead } },
    }),
    db.examAppointment.count({
      where: { ...examAccess, status: ExamStatus.RESULTADO_PENDENTE },
    }),
    db.consultation.findMany({
      where: pendingConsultationWhere,
      include: {
        patient: { select: { fullName: true } },
        doctor: { select: { fullName: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 1,
    }),
    db.examAppointment.findMany({
      where: { ...examAccess, scheduledAt: { gte: now }, status: ExamStatus.AGENDADO },
      include: {
        patient: { select: { fullName: true } },
        examType: { select: { name: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 1,
    }),
    db.consultation.count({
      where: { ...analyticsConsultations, scheduledAt: { gte: previousRange.start, lt: previousRange.end } },
    }),
    db.examAppointment.count({
      where: { ...analyticsExams, scheduledAt: { gte: previousRange.start, lt: previousRange.end } },
    }),
    db.consultation.count({
      where: { ...consultationAccess, status: { in: [ConsultationStatus.AGENDADA, ConsultationStatus.CONFIRMADA] }, scheduledAt: { lt: now } },
    }),
    isStaff ? db.consultation.groupBy({
      by: ["doctorId"],
      where: { ...(doctorId ? { doctorId } : {}), scheduledAt: periodRange, status: ConsultationStatus.REALIZADA },
      _count: { _all: true },
      orderBy: { doctorId: "asc" },
    }) : Promise.resolve([]),
  ]);

  const agenda = [
    ...todayConsultations.map((item) => ({
      id: item.id, kind: "Consulta" as const, scheduledAt: item.scheduledAt,
      title: session.role === Role.PACIENTE ? item.doctor.fullName : item.patient.fullName,
      detail: session.role === Role.PACIENTE ? "Consulta médica" : `Dr(a). ${item.doctor.fullName}`,
      status: formatStatus(item.status),
    })),
    ...todayExams.map((item) => ({
      id: item.id, kind: "Exame" as const, scheduledAt: item.scheduledAt,
      title: session.role === Role.PACIENTE ? item.examType.name : item.patient.fullName,
      detail: item.examType.name, status: formatStatus(item.status),
    })),
  ].sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime()).slice(0, 6);

  const firstName = session.user.fullName.split(" ")[0];
  const pendingTotal = pendingConsultations + pendingExams;
  const hour = getClinicHour(now);
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const todayLabel = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full", timeZone: CLINIC_TIME_ZONE,
  }).format(now);
  const nextItem = getNextUpcomingAppointment([
    ...nextConsultations.map((item) => ({
      id: item.id, kind: "Consulta" as const, scheduledAt: item.scheduledAt,
      title: session.role === Role.PACIENTE ? item.doctor.fullName : item.patient.fullName,
      detail: session.role === Role.PACIENTE ? "Consulta médica" : "Dr(a). " + item.doctor.fullName,
    })),
    ...nextExams.map((item) => ({
      id: item.id, kind: "Exame" as const, scheduledAt: item.scheduledAt,
      title: session.role === Role.PACIENTE ? item.examType.name : item.patient.fullName,
      detail: item.examType.name,
    })),
  ], now);

  const consultationsByStatus = [
    { label: "Agendadas", count: periodConsultations.filter((i) => i.status === ConsultationStatus.AGENDADA).length },
    { label: "Confirmadas", count: periodConsultations.filter((i) => i.status === ConsultationStatus.CONFIRMADA).length },
    { label: "Realizadas", count: periodConsultations.filter((i) => i.status === ConsultationStatus.REALIZADA).length },
    { label: "Canceladas", count: periodConsultations.filter((i) => i.status === ConsultationStatus.CANCELADA).length },
    { label: "Reagendadas", count: periodConsultations.filter((i) => i.status === ConsultationStatus.REAGENDADA).length },
    { label: "Faltas", count: periodConsultations.filter((i) => i.status === ConsultationStatus.FALTA_PACIENTE || i.status === ConsultationStatus.FALTA_MEDICO).length },
  ];
  const examsByStatus = [
    { label: "Agendados", count: periodExams.filter((i) => i.status === ExamStatus.AGENDADO).length },
    { label: "Realizados", count: periodExams.filter((i) => i.status === ExamStatus.REALIZADO).length },
    { label: "Resultado pendente", count: periodExams.filter((i) => i.status === ExamStatus.RESULTADO_PENDENTE).length },
    { label: "Resultado disponível", count: periodExams.filter((i) => i.status === ExamStatus.RESULTADO_DISPONIVEL).length },
    { label: "Cancelados", count: periodExams.filter((i) => i.status === ExamStatus.CANCELADO).length },
    { label: "Reagendados", count: periodExams.filter((i) => i.status === ExamStatus.REAGENDADO).length },
    { label: "Faltas", count: periodExams.filter((i) => i.status === ExamStatus.FALTA_PACIENTE).length },
  ];
  const series = getDashboardDailySeries(start, end, periodConsultations, periodExams);
  const maxDaily = Math.max(1, ...series.map((item) => Math.max(item.consultations, item.exams)));
  const periodLabel = period === "hoje" ? "hoje" : period === "semana" ? "nesta semana" : "neste mês";

  return (
    <AppShell
      currentPath="/dashboard"
      role={session.role}
      title={`${greeting}, ${firstName}`}
      subtitle={`Hoje é ${todayLabel}. Veja o resumo e as prioridades do dia.`}
      userName={session.user.fullName}
    >
      <div className={styles.toolbar}>
        <nav aria-label="Selecionar período dos indicadores" className={styles.periods}>
          {[
            { value: "hoje", label: "Hoje" },
            { value: "semana", label: "Semana" },
            { value: "mes", label: "Mês" },
          ].map((option) => (
            <Link
              key={option.value}
              href={"/dashboard?" + new URLSearchParams({ ...Object.fromEntries(filterParams.entries()), periodo: option.value }).toString()}
              className={period === option.value ? styles.selectedPeriod : styles.period}
              aria-current={period === option.value ? "page" : undefined}
            >
              {option.label}
            </Link>
          ))}
        </nav>
        <form action="/dashboard" method="get">
          {Array.from(filterParams.entries()).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
          <button className="text-link" type="submit">Atualizar indicadores</button>
        </form>
      </div>

      {isStaff && (
        <form action="/dashboard" method="get" className={styles.filterForm} aria-label="Filtros avançados">
          <input type="hidden" name="periodo" value={period} />
          <label>Médico
            <select name="medico" defaultValue={doctorId ?? ""}>
              <option value="">Todos os médicos</option>
              {doctorOptions.map((item) => <option key={item.id} value={item.id}>{item.fullName}</option>)}
            </select>
          </label>
          <label>Tipo de exame
            <select name="tipoExame" defaultValue={examTypeId ?? ""}>
              <option value="">Todos os tipos</option>
              {examTypeOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label>Status da consulta
            <select name="statusConsulta" defaultValue={consultationStatus ?? ""}>
              <option value="">Todos</option>
              {Object.values(ConsultationStatus).map((item) => <option key={item} value={item}>{formatStatus(item)}</option>)}
            </select>
          </label>
          <label>Status do exame
            <select name="statusExame" defaultValue={examStatus ?? ""}>
              <option value="">Todos</option>
              {Object.values(ExamStatus).map((item) => <option key={item} value={item}>{formatStatus(item)}</option>)}
            </select>
          </label>
          <button className="button-link" type="submit">Aplicar filtros</button>
          <Link className="text-link" href={"/dashboard?periodo=" + period}>Limpar</Link>
        </form>
      )}
      <div className={styles.reportingNote}>
        <span>Os filtros e as comparações se aplicam aos indicadores do período. A agenda e os alertas mostram a operação atual.</span>
        <Link className="text-link" href={exportHref}>Exportar CSV</Link>
      </div>
      <section className="kpi-grid" aria-label={`Resumo ${periodLabel}`}>
        <Link className="kpi-card" href="/consultas">
          <span className="kpi-icon calendar-icon" aria-hidden="true">▣</span>
          <span><small>Consultas {periodLabel}</small><strong>{periodConsultations.length}</strong><em>Ver consultas</em></span>
        </Link>
        <Link className="kpi-card" href="/exames">
          <span className="kpi-icon exam-icon" aria-hidden="true">✚</span>
          <span><small>Exames {periodLabel}</small><strong>{periodExams.length}</strong><em>Ver exames</em></span>
        </Link>
        <Link className="kpi-card" href={isStaff ? "/pacientes" : "/consultas"}>
          <span className="kpi-icon patient-icon" aria-hidden="true">●</span>
          <span>
            <small>{isStaff ? "Pacientes ativos (total)" : "Próximas consultas"}</small>
            <strong>{isStaff ? activePatients : pendingConsultations}</strong>
            <em>{isStaff ? "Ver cadastros" : "Ver agenda"}</em>
          </span>
        </Link>
        <Link className="kpi-card warning" href="/pendencias">
          <span className="kpi-icon pending-icon" aria-hidden="true">!</span>
          <span><small>{isStaff ? "Pendências (total)" : "Meus acompanhamentos"}</small><strong>{pendingTotal}</strong><em>Ver pendências</em></span>
        </Link>
      </section>

      <section className={styles.comparison} aria-label="Comparação com período anterior">
        <p>Consultas: <strong>{calculatePeriodChange(periodConsultations.length, previousConsultations)}</strong></p>
        <p>Exames: <strong>{calculatePeriodChange(periodExams.length, previousExams)}</strong></p>
      </section>
      <section className={styles.alerts} aria-label="Alertas operacionais">
        <Link href="/consultas" className={styles.alert}>
          <strong>{upcomingSoon}</strong>
          <span>Consultas nas próximas 24 horas</span>
        </Link>
        <Link href="/pendencias" className={styles.alert}>
          <strong>{awaitingResults}</strong>
          <span>Exames aguardando resultado</span>
        </Link>
        <Link href="/pendencias" className={styles.alert}>
          <strong>{overdueConsultations}</strong>
          <span>Consultas com horário ultrapassado e status ainda aberto (não equivale a falta)</span>
        </Link>
      </section>

      {nextItem ? (
        <Link className="daily-highlight" href={nextItem.kind === "Consulta" ? "/consultas" : "/exames"}>
          <span className="highlight-label">Próximo atendimento</span>
          <strong>{formatDateTime(nextItem.scheduledAt)} · {nextItem.title}</strong>
          <span>{nextItem.kind} · {nextItem.detail} →</span>
        </Link>
      ) : (
        <section className="card" aria-live="polite"><p className="muted">Nenhum próximo atendimento agendado.</p></section>
      )}

      <div className={styles.analytics}>
        <section className="card" aria-label="Indicadores de status">
          <h2>Atendimentos por status — {periodLabel}</h2>
          <div className={styles.statusColumns}>
            <div>
              <h3>Consultas</h3>
              <dl className={styles.statusList}>
                {consultationsByStatus.map((item) => (
                  <div key={item.label}><dt>{item.label}</dt><dd>{item.count}</dd></div>
                ))}
              </dl>
            </div>
            <div>
              <h3>Exames</h3>
              <dl className={styles.statusList}>
                {examsByStatus.map((item) => (
                  <div key={item.label}><dt>{item.label}</dt><dd>{item.count}</dd></div>
                ))}
              </dl>
            </div>
          </div>
        </section>
        <section className="card" aria-label="Gráfico de atendimentos">
          <h2>Movimentação de atendimentos — {periodLabel}</h2>
          <p className="muted">Quantidade de consultas e exames agendados por dia, independentemente do status.</p>
          <div className={styles.legend}><span>■ Consultas</span><span>■ Exames</span></div>
          <div className={styles.chartScroll}>
            <div className={styles.chart} role="img" aria-label={`Gráfico de ${periodLabel}: ${periodConsultations.length} consultas e ${periodExams.length} exames`}>
              {series.map((item) => (
                <div className={styles.chartDay} key={item.label} title={`${item.label}: ${item.consultations} consultas e ${item.exams} exames`}>
                  <div className={styles.chartBars}>
                    <span className={styles.consultationBar} style={{ height: `${(item.consultations / maxDaily) * 100}%` }} />
                    <span className={styles.examBar} style={{ height: `${(item.exams / maxDaily) * 100}%` }} />
                  </div>
                  <small>{item.label}</small>
                </div>
              ))}
            </div>
          </div>
          {periodConsultations.length + periodExams.length === 0 && <p className="muted">Nenhum atendimento no período.</p>}
        </section>
      </div>

      {isStaff && (
        <section className="card" aria-label="Produtividade por médico">
          <h2>Consultas realizadas por médico — {periodLabel}</h2>
          <p className="muted">Consultas com status realizada e data agendada no período. Não é uma avaliação de qualidade do atendimento.</p>
          {productivity.length === 0 ? <p className="empty-state">Nenhuma consulta realizada neste período.</p> : (
            <div className={styles.productivity}>
              {productivity.map((item) => (
                <div key={item.doctorId}>
                  <span>{doctorOptions.find((doctor) => doctor.id === item.doctorId)?.fullName ?? "Médico inativo"}</span>
                  <strong>{item._count._all}</strong>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
      <div className="dashboard-grid proposal-grid">
        <section className="card agenda-card" aria-labelledby="today-agenda-title">
          <div className="section-heading">
            <div><h2 id="today-agenda-title">Agenda de hoje</h2><p className="muted">Consultas e exames ordenados por horário.</p></div>
            <Link className="text-link" href="/consultas">Ver agenda completa →</Link>
          </div>
          {agenda.length === 0 ? (
            <p className="empty-state">Nenhum atendimento agendado para hoje.</p>
          ) : (
            <div className="agenda-list">
              {agenda.map((item) => (
                <article className="agenda-row" key={`${item.kind}-${item.id}`}>
                  <time>{formatDateTime(item.scheduledAt).split(" ")[1]}</time>
                  <span className={item.kind === "Consulta" ? "agenda-kind consultation" : "agenda-kind exam"}>{item.kind}</span>
                  <span className="agenda-person"><strong>{item.title}</strong><small>{item.detail}</small></span>
                  <span className="status-badge">{item.status}</span>
                </article>
              ))}
            </div>
          )}
        </section>
        <aside className="card actions-card">
          <div className="section-heading"><div><h2>Ações rápidas</h2><p className="muted">Atalhos para tarefas frequentes.</p></div></div>
          <div className="quick-actions">
            {isStaff ? (
              <>
                <Link className="quick-action primary-action" href="/consultas/nova"><span className="quick-action-icon">+</span><span><strong>Agendar consulta</strong><small>Novo atendimento médico</small></span></Link>
                <Link className="quick-action" href="/exames/novo"><span className="quick-action-icon">+</span><span><strong>Agendar exame</strong><small>Novo procedimento</small></span></Link>
                <Link className="quick-action" href="/cadastro"><span className="quick-action-icon">+</span><span><strong>Cadastrar paciente</strong><small>Novo cadastro no sistema</small></span></Link>
              </>
            ) : (
              <>
                <Link className="quick-action primary-action" href="/consultas"><span className="quick-action-icon">→</span><span><strong>Minhas consultas</strong><small>Ver horários e status</small></span></Link>
                <Link className="quick-action" href="/exames"><span className="quick-action-icon">→</span><span><strong>Exames e resultados</strong><small>Acessar informações</small></span></Link>
              </>
            )}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
