import { Role } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { requirePageRole } from "@/lib/auth";
import { db } from "@/lib/db";

const weekdays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

export default async function SettingsPage() {
  const session = await requirePageRole([Role.ADMINISTRADOR]);
  const [hours, specialties] = await Promise.all([
    db.clinicHours.findMany({ orderBy: { weekday: "asc" } }),
    db.specialty.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <AppShell currentPath="/configuracoes" role={session.role} title="Configurações" subtitle="Consulte os horários da clínica e as especialidades cadastradas." userName={session.user.fullName}>
    <section className="settings-grid">
      <article className="card"><h2>Horários da clínica</h2>{hours.length === 0 ? <p className="empty-state">Nenhum horário configurado.</p> : <ul className="settings-list">{hours.map((item) => <li key={item.id}><span>{weekdays[item.weekday] ?? `Dia ${item.weekday}`}</span><strong>{item.active ? `${item.opensAt} às ${item.closesAt}` : "Inativo"}</strong></li>)}</ul>}</article>
      <article className="card"><h2>Especialidades</h2>{specialties.length === 0 ? <p className="empty-state">Nenhuma especialidade cadastrada.</p> : <ul className="settings-list">{specialties.map((item) => <li key={item.id}><span>{item.name}</span><strong>{item.active ? "Ativa" : "Inativa"}</strong></li>)}</ul>}</article>
    </section>
  </AppShell>;
}
