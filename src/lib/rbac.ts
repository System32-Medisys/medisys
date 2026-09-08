import { Role } from "@prisma/client";
import { AppError } from "./http";

export const permissions = {
  manageUsers: [Role.ADMINISTRADOR],
  managePatientsAndDoctors: [Role.ATENDENTE, Role.ADMINISTRADOR],
  manageSchedules: [Role.ATENDENTE, Role.ADMINISTRADOR],
  manageResults: [Role.ATENDENTE, Role.ADMINISTRADOR],
  viewAllExams: [Role.ATENDENTE, Role.MEDICO, Role.ADMINISTRADOR],
  viewAudit: [Role.ADMINISTRADOR],
} as const;

export function authorize(role: Role, allowed: readonly Role[]) {
  if (!allowed.includes(role)) throw new AppError(403, "Você não tem permissão para esta ação.");
}
