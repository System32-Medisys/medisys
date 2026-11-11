import { Role } from "@prisma/client";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { requirePageSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime, formatStatus } from "@/lib/format";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requirePageSession();
  const { q: rawQuery = "" } = await searchParams;
  const query = rawQuery.trim();
  const canViewPeople = session.role === Role.ATENDENTE || session.role === Role.ADMINISTRADOR;
  const consultationAccess = session.role === Role.PACIENTE
    ? { patientId: session.userId }
    : session.role === Role.MEDICO
      ? { doctorId: session.userId }
      : {};
  const examAccess = session.role === Role.PACIENTE ? { patientId: session.userId } : {};

  const [people, consultations, exams] = query.length >= 2
    ? await Promise.all([
        canViewPeople
          ? db.user.findMany({
              where: {
                role: { in: [Role.PACIENTE, Role.MEDICO] },
                OR: [
                  { fullName: { contains: query, mode: "insensitive" } },
                  { cpf: { contains: query } },
                  { doctor: { is: { crm: { contains: query, mode: "insensitive" } } } },
                ],
              },
              select: { id: true, fullName: true, cpf: true, role: true, status: true, doctor: { select: { crm: true, crmState: true } } },
              orderBy: { fullName: "asc" },
              take: 8,
            })
          : Promise.resolve([]),
        db.consultation.findMany({
          where: {
            AND: [
              consultationAccess,
              {
                OR: [
                  { patient: { fullName: { contains: query, mode: "insensitive" } } },
                  { patient: { cpf: { contains: query } } },
                  { doctor: { fullName: { contains: query, mode: "insensitive" } } },
                  { doctor: { cpf: { contains: query } } },
                ],
              },
            ],
          },
          include: { patient: { select: { fullName: true } }, doctor: { select: { fullName: true } } },
          orderBy: { scheduledAt: "desc" },
          take: 8,
        }),
        db.examAppointment.findMany({
          where: {
            AND: [
              examAccess,
              {
                OR: [
                  { patient: { fullName: { contains: query, mode: "insensitive" } } },
                  { patient: { cpf: { contains: query } } },
                  { examType: { name: { contains: query, mode: "insensitive" } } },
                ],
              },
            ],
          },
          include: { patient: { select: { fullName: true } }, examType: { select: { name: true } } },
          orderBy: { scheduledAt: "desc" },
          take: 8,
        }),
      ])
    : [[], [], []];

  const total = people.length + consultations.length + exams.length;

  return (
    <AppShell
      currentPath="/busca"
      role={session.role}
      title="Busca no sistema"
      subtitle={query.length >= 2 ? `Resultados para “${query}”` : "Digite pelo menos dois caracteres para pesquisar."}
      userName={session.user.fullName}
    >
      {query.length >= 2 && total === 0 && (
        <section className="card search-empty">
          <h2>Nenhum resultado encontrado</h2>
          <p className="muted">Revise o nome, CPF, CRM ou tipo de exame informado.</p>
        </section>
      )}

      <div className="search-results">
        {people.length > 0 && (
          <section className="card result-section">
            <div className="section-heading"><div><h2>Pessoas</h2><p className="muted">{people.length} resultado(s)</p></div></div>
            <div className="result-list">
              {people.map((person) => (
                <Link className="result-item" href={person.role === Role.MEDICO ? "/medicos" : "/pacientes"} key={person.id}>
                  <span className="result-avatar">{person.fullName.slice(0, 1).toUpperCase()}</span>
                  <span><strong>{person.fullName}</strong><small>{person.role === Role.MEDICO ? `Médico · CRM ${person.doctor?.crm}/${person.doctor?.crmState}` : "Paciente"} · CPF {person.cpf}</small></span>
                  <span className="status-badge">{formatStatus(person.status)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {consultations.length > 0 && (
          <section className="card result-section">
            <div className="section-heading"><div><h2>Consultas</h2><p className="muted">{consultations.length} resultado(s)</p></div><Link className="text-link" href="/consultas">Ver todas →</Link></div>
            <div className="result-list">
              {consultations.map((item) => (
                <Link className="result-item" href="/consultas" key={item.id}>
                  <span className="result-date">{formatDateTime(item.scheduledAt)}</span>
                  <span><strong>{item.patient.fullName}</strong><small>Profissional: {item.doctor.fullName}</small></span>
                  <span className="status-badge">{formatStatus(item.status)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {exams.length > 0 && (
          <section className="card result-section">
            <div className="section-heading"><div><h2>Exames</h2><p className="muted">{exams.length} resultado(s)</p></div><Link className="text-link" href="/exames">Ver todos →</Link></div>
            <div className="result-list">
              {exams.map((item) => (
                <Link className="result-item" href="/exames" key={item.id}>
                  <span className="result-date">{formatDateTime(item.scheduledAt)}</span>
                  <span><strong>{item.examType.name}</strong><small>Paciente: {item.patient.fullName}</small></span>
                  <span className="status-badge">{formatStatus(item.status)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
