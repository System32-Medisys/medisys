import { describe, expect, it } from "vitest";
import { consultationScheduleSchema, examScheduleSchema } from "./validation";

describe("schedule validation", () => {
  it("accepts a future consultation", () => {
    const scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const result = consultationScheduleSchema.safeParse({ patientId: "patient-1", doctorId: "doctor-1", scheduledAt });

    expect(result.success).toBe(true);
  });

  it("rejects a past consultation", () => {
    const scheduledAt = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const result = consultationScheduleSchema.safeParse({ patientId: "patient-1", doctorId: "doctor-1", scheduledAt });

    expect(result.success).toBe(false);
  });

  it("requires the exam type", () => {
    const scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const result = examScheduleSchema.safeParse({ patientId: "patient-1", examTypeId: "", scheduledAt });

    expect(result.success).toBe(false);
  });
});
