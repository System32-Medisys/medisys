-- Add the exam rescheduling status.
ALTER TYPE "ExamStatus" ADD VALUE IF NOT EXISTS 'REAGENDADO';

-- Link rescheduled consultations and exams to their previous records.
ALTER TABLE "Consultation" ADD COLUMN "rescheduledFromId" TEXT;
ALTER TABLE "ExamAppointment" ADD COLUMN "rescheduledFromId" TEXT;

CREATE UNIQUE INDEX "Consultation_rescheduledFromId_key" ON "Consultation"("rescheduledFromId");
CREATE UNIQUE INDEX "ExamAppointment_rescheduledFromId_key" ON "ExamAppointment"("rescheduledFromId");

ALTER TABLE "Consultation"
ADD CONSTRAINT "Consultation_rescheduledFromId_fkey"
FOREIGN KEY ("rescheduledFromId") REFERENCES "Consultation"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ExamAppointment"
ADD CONSTRAINT "ExamAppointment_rescheduledFromId_fkey"
FOREIGN KEY ("rescheduledFromId") REFERENCES "ExamAppointment"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Extend versioned exam results.
ALTER TABLE "ExamResultVersion"
ADD COLUMN "resultDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "fileUrl" TEXT;

-- Preserve status and date changes for exam appointments.
CREATE TABLE "ExamAppointmentHistory" (
  "id" TEXT NOT NULL,
  "examId" TEXT NOT NULL,
  "previousStatus" TEXT NOT NULL,
  "newStatus" TEXT NOT NULL,
  "previousDate" TIMESTAMP(3),
  "newDate" TIMESTAMP(3),
  "justification" TEXT,
  "changedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ExamAppointmentHistory_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ExamAppointmentHistory_examId_fkey"
    FOREIGN KEY ("examId") REFERENCES "ExamAppointment"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);
