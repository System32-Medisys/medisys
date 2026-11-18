import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError } from "@/lib/http";
import { authorize, permissions } from "@/lib/rbac";
import { catalogSchema } from "@/lib/validation";

export async function GET() {
  try {
    const session = await requireSession();
    authorize(session.role, [Role.ADMINISTRADOR]);
    return NextResponse.json(await db.specialty.findMany({ orderBy: { name: "asc" } }));
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    authorize(session.role, permissions.manageUsers);
    const input = catalogSchema.pick({ name: true }).parse(await request.json());
    const item = await db.specialty.create({ data: { name: input.name } });
    await audit({ actorId: session.userId, actorRole: session.role, action: "ESPECIALIDADE_CADASTRADA", entityType: "Specialty", entityId: item.id, after: item });
    return NextResponse.json(item, { status: 201 });
  } catch (error) { return apiError(error); }
}
