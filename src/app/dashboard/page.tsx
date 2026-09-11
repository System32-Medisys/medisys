import { Role } from "@prisma/client";
import { requirePageSession } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const session = await requirePageSession();
  const whereConsultation = session.role === Role.PACIENTE ? { patientId: session.userId } : session.role === Role.MEDICO ? { doctorId: session.userId } : {};
  const whereExam = session.role === Role.PACIENTE ? { patientId: session.userId } : {};
  const [user, consultations, exams] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: session.userId }, select: { fullName: true } }),
    db.consultation.count({ where: whereConsultation }), db.examAppointment.count({ where: whereExam }),
  ]);
  return <main><header><div><p className="eyebrow">MEDISYS</p><h1>Olá, {user.fullName.split(" ")[0]}</h1><p className="muted">Perfil: {session.role.toLowerCase()}</p></div><form action="/api/auth/logout" method="post"><button className="ghost">Sair</button></form></header>
    <section className="grid"><article className="metric"><span>Consultas</span><strong>{consultations}</strong><small>Registros acessíveis ao seu perfil</small></article><article className="metric accent"><span>Exames</span><strong>{exams}</strong><small>Agendamentos e resultados</small></article><article className="metric"><span>Acesso</span><strong>Ativo</strong><small>Permissões verificadas no servidor</small></article></section>
    <section className="card"><h2>Núcleo do sistema</h2><p>Autenticação, usuários, consultas, exames, resultados, permissões e auditoria estão disponíveis pela API.</p><div className="tags"><span>/api/users</span><span>/api/consultations</span><span>/api/exams</span><span>/api/audit</span></div></section>
  </main>;
}
