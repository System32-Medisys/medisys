import { ExamStatus, Role } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ExamResultForm } from "@/components/exam-result-form";
import { audit } from "@/lib/audit";
import { requirePageSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { permissions } from "@/lib/rbac";

function httpsLink(value: string | null) {
  if (!value) return null;
  try { return new URL(value).protocol === "https:" ? value : null; } catch { return null; }
}

export default async function ExamResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePageSession();
  const { id } = await params;
  const exam = await db.examAppointment.findFirst({
    where: { id, ...(session.role === Role.PACIENTE ? { patientId: session.userId } : {}) },
    select: {
      patientId: true, status: true, examType: { select: { name: true } },
      results: { orderBy: { version: "desc" }, select: {
        id: true, version: true, resultDate: true, content: true, fileUrl: true,
        author: { select: { fullName: true } },
      } },
    },
  });
  if (!exam) notFound();
  const latest = exam.results[0];
  const canEdit = permissions.manageResults.some((role) => role === session.role) &&
    (exam.status === ExamStatus.RESULTADO_PENDENTE || (exam.status === ExamStatus.RESULTADO_DISPONIVEL && !!latest));
  if (latest) await audit({ actorId: session.userId, actorRole: session.role, action: "RESULTADO_VISUALIZADO",
    entityType: "ExamAppointment", entityId: id, patientId: exam.patientId });
  const date = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "UTC" });
  return <AppShell currentPath="/exames" role={session.role} userName={session.user.fullName}
    title="Resultados do exame" subtitle={exam.examType.name}>
    <Link href="/exames" className="button-link secondary">Voltar para exames</Link>
    <section className="card">
      <h2>Histórico de versões</h2>
      {exam.results.length === 0 && <p>Nenhum resultado registrado.</p>}
      {exam.results.map((version) => {
        const file = httpsLink(version.fileUrl);
        return <details key={version.id} open={version.id === latest?.id}>
          <summary>Versão {version.version} · {date.format(version.resultDate)}{version.id === latest?.id ? " · atual" : ""}</summary>
          <p>Responsável: {version.author.fullName}</p>
          <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{version.content}</p>
          {file && <a className="text-link" href={file} target="_blank" rel="noopener noreferrer">Abrir arquivo</a>}
        </details>;
      })}
    </section>
    {canEdit && <ExamResultForm key={latest?.id ?? "novo"} examId={id} initial={latest ? {
      content: latest.content, date: latest.resultDate.toISOString().slice(0, 10), fileUrl: httpsLink(latest.fileUrl),
    } : undefined} />}
  </AppShell>;
}
