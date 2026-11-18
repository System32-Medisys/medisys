import { Role } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { CatalogManager } from "@/components/catalog-manager";
import { requirePageRole } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function ExamTypesPage() {
  const session = await requirePageRole([Role.ATENDENTE, Role.ADMINISTRADOR]);
  const examTypes = await db.examType.findMany({ orderBy: { name: "asc" } });
  return <AppShell currentPath="/tipos-exames" role={session.role} title="Tipos de exames" subtitle="Cadastre, edite e desative tipos de exames." userName={session.user.fullName}>
    <section className="card"><CatalogManager items={examTypes} kind="exam-type" /></section>
  </AppShell>;
}
