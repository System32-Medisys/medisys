import { describe, expect, it } from "vitest";
import { catalogSchema, consultationScheduleSchema, examScheduleSchema, userUpdateSchema } from "./validation";

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


describe("registration update validation", () => {
  const validUser = {
    cpf: "52998224725",
    fullName: "Maria da Silva",
    birthDate: "1990-01-10",
    phone: "69999999999",
    email: "maria@example.com",
    address: {
      zipCode: "76801000",
      street: "Rua Principal",
      number: "100",
      neighborhood: "Centro",
      city: "Porto Velho",
      state: "RO",
    },
  };

  it("accepts valid user update data", () => {
    expect(userUpdateSchema.safeParse(validUser).success).toBe(true);
  });

  it("rejects invalid CPF and future birth date", () => {
    const result = userUpdateSchema.safeParse({
      ...validUser,
      cpf: "11111111111",
      birthDate: "2999-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("validates catalog name and description", () => {
    expect(catalogSchema.safeParse({ name: "Hemograma", description: "Exame de sangue", active: true }).success).toBe(true);
    expect(catalogSchema.safeParse({ name: "A", description: "B" }).success).toBe(false);
  });
});
