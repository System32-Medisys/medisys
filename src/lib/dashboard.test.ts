import { describe, expect, it } from "vitest";
import { getClinicDayRange, getClinicHour, getNextUpcomingAppointment, getDashboardPeriodRange, getDashboardDailySeries, parseDashboardPeriod, getPreviousDashboardPeriodRange, calculatePeriodChange, isOverdueConsultation, escapeCsvCell } from "./dashboard";

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


describe("dashboard: comparação e alertas", () => {
  it("calcula o período anterior sem incluir o período atual", () => {
    const previous = getPreviousDashboardPeriodRange(new Date("2026-11-13T20:00:00.000Z"), "semana");
    expect(previous.start.toISOString()).toBe("2026-11-02T04:00:00.000Z");
    expect(previous.end.toISOString()).toBe("2026-11-09T04:00:00.000Z");
  });

  it("compara aumentos, reduções e ausência de base", () => {
    expect(calculatePeriodChange(12, 10)).toBe("+20% em relação ao período anterior");
    expect(calculatePeriodChange(8, 10)).toBe("-20% em relação ao período anterior");
    expect(calculatePeriodChange(3, 0)).toBe("Sem base anterior");
    expect(calculatePeriodChange(0, 0)).toBe("Sem variação");
  });

  it("não confunde atraso potencial com falta ou cancelamento", () => {
    const now = new Date("2026-11-13T18:00:00.000Z");
    const past = new Date("2026-11-13T16:00:00.000Z");
    expect(isOverdueConsultation({ status: "AGENDADA", scheduledAt: past }, now)).toBe(true);
    expect(isOverdueConsultation({ status: "CONFIRMADA", scheduledAt: past }, now)).toBe(true);
    expect(isOverdueConsultation({ status: "FALTA_PACIENTE", scheduledAt: past }, now)).toBe(false);
    expect(isOverdueConsultation({ status: "REALIZADA", scheduledAt: past }, now)).toBe(false);
    expect(isOverdueConsultation({ status: "AGENDADA", scheduledAt: now }, now)).toBe(false);
  });

  it("protege células de planilha contra injeção de fórmulas", () => {
    expect(escapeCsvCell("=1+1")).toBe('"\'=1+1"');
    expect(escapeCsvCell("consulta")).toBe('"consulta"');
    expect(escapeCsvCell('a"b')).toBe('"a""b"');
  });
});
