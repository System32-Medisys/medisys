import { Role } from "@prisma/client";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { requirePageSession } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const session = await requirePageSession();
  const whereConsultation = session.role === Role.PACIENTE ? { patientId: session.userId } : session.role === Role.MEDICO ? { doctorId: session.userId } : {};
  const whereExam = session.role === Role.PACIENTE ? { patientId: session.userId } : {};
  const [consultations, exams] = await Promise.all([
    db.consultation.count({ where: whereConsultation }), db.examAppointment.count({ where: whereExam }),
  ]);
  const firstName = session.user.fullName.split(" ")[0];

  return <AppShell currentPath="/dashboard" role={session.role} title={`Olá, ${firstName}`} subtitle="Acompanhe os módulos disponíveis para o seu perfil." userName={session.user.fullName}>
    <section className="grid">
      <Link className="metric metric-link" href="/consultas"><span>Consultas</span><strong>{consultations}</strong><small>Ver registros acessíveis</small></Link>
      <Link className="metric metric-link accent" href="/exames"><span>Exames</span><strong>{exams}</strong><small>Ver agendamentos e resultados</small></Link>
      <article className="metric"><span>Acesso</span><strong>Ativo</strong><small>Permissões verificadas no servidor</small></article>
    </section>
    <section className="card"><h2>Acesso rápido</h2><p className="muted">Use o menu para navegar entre os módulos sem sair do sistema.</p></section>
  </AppShell>;
}
