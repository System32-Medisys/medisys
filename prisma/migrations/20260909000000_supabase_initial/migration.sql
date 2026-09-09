-- Estrutura PostgreSQL inicial do Medisys para o Supabase.
CREATE TYPE "Role" AS ENUM ('PACIENTE', 'ATENDENTE', 'MEDICO', 'ADMINISTRADOR');
CREATE TYPE "UserStatus" AS ENUM ('ATIVO', 'INATIVO', 'BLOQUEADO');
CREATE TYPE "ConsultationStatus" AS ENUM ('AGENDADA', 'CONFIRMADA', 'REALIZADA', 'CANCELADA', 'REAGENDADA', 'FALTA_PACIENTE', 'FALTA_MEDICO');
CREATE TYPE "ExamStatus" AS ENUM ('AGENDADO', 'REALIZADO', 'RESULTADO_PENDENTE', 'RESULTADO_DISPONIVEL', 'CANCELADO', 'FALTA_PACIENTE');
CREATE TYPE "AuditResult" AS ENUM ('SUCESSO', 'FALHA');

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "sex" TEXT,
    "healthInsurance" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ATIVO',
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DoctorProfile" (
    "id" TEXT NOT NULL,
    "crm" TEXT NOT NULL,
    "crmState" TEXT NOT NULL,
    "serviceDays" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "DoctorProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Specialty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Specialty_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DoctorSpecialty" (
    "doctorId" TEXT NOT NULL,
    "specialtyId" TEXT NOT NULL,
    CONSTRAINT "DoctorSpecialty_pkey" PRIMARY KEY ("doctorId", "specialtyId")
);

CREATE TABLE "ExamType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "ExamType_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Consultation" (
    "id" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "ConsultationStatus" NOT NULL DEFAULT 'AGENDADA',
    "justification" TEXT,
    "previousDate" TIMESTAMP(3),
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Consultation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExamAppointment" (
    "id" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "ExamStatus" NOT NULL DEFAULT 'AGENDADO',
    "justification" TEXT,
    "previousDate" TIMESTAMP(3),
    "patientId" TEXT NOT NULL,
    "examTypeId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ExamAppointment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExamResultVersion" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "examId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExamResultVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AppointmentHistory" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "previousStatus" TEXT NOT NULL,
    "newStatus" TEXT NOT NULL,
    "previousDate" TIMESTAMP(3),
    "newDate" TIMESTAMP(3),
    "justification" TEXT,
    "changedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AppointmentHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClinicHours" (
    "id" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "opensAt" TEXT NOT NULL,
    "closesAt" TEXT NOT NULL,
    "slotMinutes" INTEGER NOT NULL DEFAULT 30,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "ClinicHours_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actorRole" "Role",
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "patientId" TEXT,
    "result" "AuditResult" NOT NULL,
    "justification" TEXT,
    "beforeData" TEXT,
    "afterData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Address_userId_key" ON "Address"("userId");
CREATE UNIQUE INDEX "DoctorProfile_userId_key" ON "DoctorProfile"("userId");
CREATE UNIQUE INDEX "DoctorProfile_crm_crmState_key" ON "DoctorProfile"("crm", "crmState");
CREATE UNIQUE INDEX "Specialty_name_key" ON "Specialty"("name");
CREATE UNIQUE INDEX "ExamType_name_key" ON "ExamType"("name");
CREATE INDEX "Consultation_doctorId_scheduledAt_idx" ON "Consultation"("doctorId", "scheduledAt");
CREATE INDEX "Consultation_patientId_scheduledAt_idx" ON "Consultation"("patientId", "scheduledAt");
CREATE INDEX "ExamAppointment_patientId_scheduledAt_idx" ON "ExamAppointment"("patientId", "scheduledAt");
CREATE UNIQUE INDEX "ExamResultVersion_examId_version_key" ON "ExamResultVersion"("examId", "version");
CREATE UNIQUE INDEX "ClinicHours_weekday_key" ON "ClinicHours"("weekday");
CREATE INDEX "AuditLog_actorId_action_createdAt_idx" ON "AuditLog"("actorId", "action", "createdAt");
CREATE INDEX "AuditLog_patientId_createdAt_idx" ON "AuditLog"("patientId", "createdAt");

ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DoctorProfile" ADD CONSTRAINT "DoctorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DoctorSpecialty" ADD CONSTRAINT "DoctorSpecialty_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DoctorSpecialty" ADD CONSTRAINT "DoctorSpecialty_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExamAppointment" ADD CONSTRAINT "ExamAppointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExamAppointment" ADD CONSTRAINT "ExamAppointment_examTypeId_fkey" FOREIGN KEY ("examTypeId") REFERENCES "ExamType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExamAppointment" ADD CONSTRAINT "ExamAppointment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExamResultVersion" ADD CONSTRAINT "ExamResultVersion_examId_fkey" FOREIGN KEY ("examId") REFERENCES "ExamAppointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExamResultVersion" ADD CONSTRAINT "ExamResultVersion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AppointmentHistory" ADD CONSTRAINT "AppointmentHistory_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
