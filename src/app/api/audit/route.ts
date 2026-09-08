import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError } from "@/lib/http";
import { authorize, permissions } from "@/lib/rbac";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    authorize(session.role, permissions.viewAudit);
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const logs = await db.auditLog.findMany({
      where: {
        actorId: searchParams.get("userId") || undefined,
        patientId: searchParams.get("patientId") || undefined,
        action: searchParams.get("action") || undefined,
        createdAt: from || to ? { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined } : undefined,
      },
      include: { actor: { select: { fullName: true } } }, orderBy: { createdAt: "desc" }, take: 200,
    });
    return NextResponse.json(logs);
  } catch (error) { return apiError(error); }
}
