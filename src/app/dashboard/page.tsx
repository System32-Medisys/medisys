import { Role } from "@prisma/client";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { requirePageSession } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const session = await requirePageSession();
  const whereConsultation = session.role === Role.PACIENTE
    ? { patientId: session.userId }
    : session.role === Role.MEDICO
      ? { doctorId: session.userId }
      : {};
  const whereExam = session.role === Role.PACIENTE ? { patientId: session.userId } : {};

  const [consultations, exams] = await Promise.all([
    db.consultation.count({ where: whereConsultation }),
    db.examAppointment.count({ where: whereExam }),
  ]);

  const firstName = session.user.fullName.split(" ")[0];
  const canSchedule = session.role === Role.ATENDENTE || session.role === Role.ADMINISTRADOR;

  return (
    <AppShell
      currentPath="/dashboard"
      role={session.role}
      title={`Olá, ${firstName}`}
      subtitle="Acompanhe as informações mais importantes e acesse rapidamente as tarefas do dia."
      userName={session.user.fullName}
    >
      <section className="grid" aria-label="Resumo do sistema">
        <Link className="metric metric-link" href="/consultas">
          <span className="metric-label"><span className="metric-dot" />Consultas acessíveis</span>
          <strong>{consultations}</strong>
          <small>Consulte agendamentos e seus status</small>
        </Link>
        <Link className="metric metric-link accent" href="/exames">
          <span className="metric-label"><span className="metric-dot" />Exames acessíveis</span>
          <strong>{exams}</strong>
          <small>Acompanhe agendamentos e resultados</small>
        </Link>
        <article className="metric">
          <span className="metric-label"><span className="metric-dot" />Situação da conta</span>
          <strong>Ativa</strong>
          <small>Acesso protegido conforme o seu perfil</small>
        </article>
      </section>

      <div className="dashboard-grid">
        <div className="dashboard-primary">
          <section className="card welcome-panel">
            <div className="section-heading">
              <div>
                <h2>Seu painel de trabalho</h2>
                <p className="muted">Tudo o que você precisa, organizado por tarefa.</p>
              </div>
            </div>
            <p className="muted">
              Use o menu lateral para navegar entre Agenda, Pessoas e Gestão. Os módulos exibidos
              respeitam automaticamente as permissões do seu perfil.
            </p>
            <div className="welcome-actions">
              <Link className="button-link" href="/consultas">Ver consultas</Link>
              <Link className="button-link secondary" href="/exames">Ver exames</Link>
            </div>
          </section>
        </div>

        <aside className="card" aria-labelledby="quick-actions-title">
          <div className="section-heading">
            <div>
              <h2 id="quick-actions-title">Ações rápidas</h2>
              <p className="muted">Atalhos para tarefas frequentes.</p>
            </div>
          </div>
          <div className="quick-actions">
            {canSchedule && (
              <>
                <Link className="quick-action" href="/consultas/nova">
                  <span className="quick-action-icon" aria-hidden="true">+</span>
                  <span><strong>Agendar consulta</strong><small>Novo atendimento médico</small></span>
                </Link>
                <Link className="quick-action" href="/exames/novo">
                  <span className="quick-action-icon" aria-hidden="true">+</span>
                  <span><strong>Agendar exame</strong><small>Novo procedimento</small></span>
                </Link>
                <Link className="quick-action" href="/cadastro">
                  <span className="quick-action-icon" aria-hidden="true">+</span>
                  <span><strong>Cadastrar pessoa</strong><small>Paciente ou médico</small></span>
                </Link>
              </>
            )}
            {!canSchedule && (
              <>
                <Link className="quick-action" href="/consultas">
                  <span className="quick-action-icon" aria-hidden="true">→</span>
                  <span><strong>Minhas consultas</strong><small>Ver agenda e status</small></span>
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
