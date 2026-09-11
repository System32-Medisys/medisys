import { NextResponse } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError } from "@/lib/http";
import { authorize, permissions } from "@/lib/rbac";

export async function GET() {
  try { await requireSession(); return NextResponse.json(await db.examType.findMany({ orderBy: { name: "asc" } })); }
  catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    authorize(session.role, permissions.managePatientsAndDoctors);
    const input = z.object({ name: z.string().trim().min(2), description: z.string().trim().min(2) }).parse(await request.json());
    const item = await db.examType.create({ data: input });
    await audit({ actorId: session.userId, actorRole: session.role, action: "TIPO_EXAME_CADASTRADO", entityType: "ExamType", entityId: item.id, after: item });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { return apiError(error); }
}
