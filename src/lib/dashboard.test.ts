import { describe, expect, it } from "vitest";
import { getClinicDayRange, getClinicHour, getNextUpcomingAppointment } from "./dashboard";

describe("dashboard: horário da clínica", () => {
  it("identifica o dia em Porto Velho na virada UTC", () => {
    const range = getClinicDayRange(new Date("2026-11-14T02:30:00.000Z"));
    expect(range.start.toISOString()).toBe("2026-11-13T04:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-11-14T04:00:00.000Z");
  });

  it("reconhece o início do dia da clínica", () => {
    const range = getClinicDayRange(new Date("2026-11-14T04:00:00.000Z"));
    expect(range.start.toISOString()).toBe("2026-11-14T04:00:00.000Z");
  });

  it("calcula a hora local", () => {
    expect(getClinicHour(new Date("2026-11-14T02:30:00.000Z"))).toBe(22);
  });
});

describe("dashboard: próximo atendimento", () => {
  const now = new Date("2026-11-13T17:00:00.000Z");
  it("ignora atendimentos passados e seleciona o futuro mais próximo", () => {
    const items = [
      { id: "ontem", scheduledAt: new Date("2026-11-12T17:00:00.000Z") },
      { id: "amanha", scheduledAt: new Date("2026-11-14T17:00:00.000Z") },
      { id: "hoje", scheduledAt: new Date("2026-11-13T19:00:00.000Z") },
    ];
    expect(getNextUpcomingAppointment(items, now)?.id).toBe("hoje");
  });

  it("retorna vazio quando não há atendimentos futuros", () => {
    expect(getNextUpcomingAppointment([
      { scheduledAt: new Date("2026-11-12T10:00:00.000Z") },
    ], now)).toBeUndefined();
  });
});
