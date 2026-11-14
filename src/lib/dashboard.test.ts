import { describe, expect, it } from "vitest";
import { getClinicDayRange, getClinicHour, getNextUpcomingAppointment, getDashboardPeriodRange, getDashboardDailySeries, parseDashboardPeriod } from "./dashboard";

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


describe("dashboard: filtros por período", () => {
  it("considera hoje como período padrão", () => {
    expect(parseDashboardPeriod(undefined)).toBe("hoje");
    expect(parseDashboardPeriod("inválido")).toBe("hoje");
    expect(parseDashboardPeriod("semana")).toBe("semana");
    expect(parseDashboardPeriod("mes")).toBe("mes");
  });

  it("considera a semana de segunda a domingo no fuso da clínica", () => {
    const range = getDashboardPeriodRange(new Date("2026-11-13T20:00:00.000Z"), "semana");
    expect(range.start.toISOString()).toBe("2026-11-09T04:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-11-16T04:00:00.000Z");
  });

  it("considera o mês civil da clínica", () => {
    const range = getDashboardPeriodRange(new Date("2026-11-14T02:30:00.000Z"), "mes");
    expect(range.start.toISOString()).toBe("2026-11-01T04:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-12-01T04:00:00.000Z");
  });

  it("gera contagens diárias, inclusive dias sem atendimentos", () => {
    const range = getDashboardPeriodRange(new Date("2026-11-13T16:00:00.000Z"), "semana");
    const series = getDashboardDailySeries(range.start, range.end, [
      { scheduledAt: new Date("2026-11-09T13:00:00.000Z") },
      { scheduledAt: new Date("2026-11-09T14:00:00.000Z") },
    ], [{ scheduledAt: new Date("2026-11-10T12:00:00.000Z") }]);
    expect(series).toHaveLength(7);
    expect(series[0].consultations).toBe(2);
    expect(series[0].exams).toBe(0);
    expect(series[1].exams).toBe(1);
    expect(series[2].consultations).toBe(0);
  });
});
