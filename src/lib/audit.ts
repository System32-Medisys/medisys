import { AuditResult, Prisma, Role } from "@prisma/client";
import { db } from "./db";

type AuditInput = {
  actorId?: string;
  actorRole?: Role;
  action: string;
  entityType?: string;
  entityId?: string;
  patientId?: string;
  result?: AuditResult;
  justification?: string;
  before?: unknown;
  after?: unknown;
};

function safe(value: unknown) {
  if (value === undefined) return undefined;
  return JSON.stringify(value, (key, item) =>
    /password|token|content/i.test(key) ? "[PROTEGIDO]" : item,
  );
}

export async function audit(input: AuditInput, tx: Prisma.TransactionClient | typeof db = db) {
  return tx.auditLog.create({
    data: {
      actorId: input.actorId,
      actorRole: input.actorRole,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      patientId: input.patientId,
      result: input.result ?? AuditResult.SUCESSO,
      justification: input.justification,
      beforeData: safe(input.before),
      afterData: safe(input.after),
    },
  });
}
