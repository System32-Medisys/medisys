import { ConsultationStatus, ExamStatus, Role } from "@prisma/client";
import { audit } from "@/lib/audit";
import { db } from "@/lib/db";
import { AppError } from "@/lib/http";

const inactiveConsultations = [ConsultationStatus.CANCELADA, ConsultationStatus.REAGENDADA];
const inactiveExams = [ExamStatus.CANCELADO, ExamStatus.REAGENDADO];

export async function createConsultation(input: {
  patientId: string; doctorId: string; scheduledAt: Date; actorId: string; actorRole: Role;
}) {
  if (input.scheduledAt <= new Date()) throw new AppError(400, "Não é permitido agendar no passado.");
  return db.$transaction(async (tx) => {
    const [patient, doctor, doctorConflict, patientConsultation, patientExam] = await Promise.all([
      tx.user.findFirst({ where: { id: input.patientId, role: Role.PACIENTE, status: "ATIVO" } }),
      tx.user.findFirst({ where: { id: input.doctorId, role: Role.MEDICO, status: "ATIVO" } }),
      tx.consultation.findFirst({ where: { doctorId: input.doctorId, scheduledAt: input.scheduledAt, status: { notIn: inactiveConsultations } } }),
      tx.consultation.findFirst({ where: { patientId: input.patientId, scheduledAt: input.scheduledAt, status: { notIn: inactiveConsultations } } }),
      tx.examAppointment.findFirst({ where: { patientId: input.patientId, scheduledAt: input.scheduledAt, status: { notIn: inactiveExams } } }),
    ]);
    if (!patient || !doctor) throw new AppError(400, "Paciente ou médico inválido/inativo.");
    if (doctorConflict) throw new AppError(409, "O médico já possui consulta nesse horário.");
    if (patientConsultation || patientExam) throw new AppError(409, "O paciente já possui agendamento nesse horário.");
    const consultation = await tx.consultation.create({ data: { patientId: input.patientId, doctorId: input.doctorId, scheduledAt: input.scheduledAt, createdById: input.actorId } });
    await audit({ actorId: input.actorId, actorRole: input.actorRole, action: "CONSULTA_AGENDADA", entityType: "Consultation", entityId: consultation.id, patientId: input.patientId, after: { scheduledAt: input.scheduledAt } }, tx);
    return consultation;
  });
}

export async function createExam(input: {
  patientId: string; examTypeId: string; scheduledAt: Date; actorId: string; actorRole: Role;
}) {
  if (input.scheduledAt <= new Date()) throw new AppError(400, "Não é permitido agendar no passado.");
  return db.$transaction(async (tx) => {
    const [patient, examType, consultation, exam] = await Promise.all([
      tx.user.findFirst({ where: { id: input.patientId, role: Role.PACIENTE, status: "ATIVO" } }),
      tx.examType.findFirst({ where: { id: input.examTypeId, active: true } }),
      tx.consultation.findFirst({ where: { patientId: input.patientId, scheduledAt: input.scheduledAt, status: { notIn: inactiveConsultations } } }),
      tx.examAppointment.findFirst({ where: { patientId: input.patientId, scheduledAt: input.scheduledAt, status: { notIn: inactiveExams } } }),
    ]);
    if (!patient || !examType) throw new AppError(400, "Paciente ou tipo de exame inválido/inativo.");
    if (consultation || exam) throw new AppError(409, "O paciente já possui agendamento nesse horário.");
    const created = await tx.examAppointment.create({ data: { patientId: input.patientId, examTypeId: input.examTypeId, scheduledAt: input.scheduledAt, createdById: input.actorId } });
    await audit({ actorId: input.actorId, actorRole: input.actorRole, action: "EXAME_AGENDADO", entityType: "ExamAppointment", entityId: created.id, patientId: input.patientId, after: { scheduledAt: input.scheduledAt } }, tx);
    return created;
  });
}
