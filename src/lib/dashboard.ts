/**
 * O Medisys utiliza o horário local de Porto Velho (UTC-04:00).
 * Centralizar o cálculo evita divergências entre os indicadores diários.
 */
export const CLINIC_TIME_ZONE = "America/Porto_Velho";
const CLINIC_UTC_OFFSET_HOURS = 4;

export function getClinicDayRange(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const numberPart = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);

  const start = new Date(Date.UTC(
    numberPart("year"),
    numberPart("month") - 1,
    numberPart("day"),
    CLINIC_UTC_OFFSET_HOURS,
  ));

  return {
    start,
    end: new Date(start.getTime() + 24 * 60 * 60 * 1000),
  };
}

export function getClinicHour(now: Date) {
  return Number(new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hourCycle: "h23",
    timeZone: CLINIC_TIME_ZONE,
  }).format(now));
}

export function getNextUpcomingAppointment<T extends { scheduledAt: Date }>(
  items: T[],
  now: Date,
): T | undefined {
  return items
    .filter((item) => item.scheduledAt.getTime() >= now.getTime())
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())[0];
}


export type DashboardPeriod = "hoje" | "semana" | "mes";

export function parseDashboardPeriod(value: unknown): DashboardPeriod {
  return value === "semana" || value === "mes" ? value : "hoje";
}

/**
 * Períodos civis da clínica; a semana começa na segunda-feira.
 * Porto Velho não observa horário de verão atualmente (UTC-04).
 */
export function getDashboardPeriodRange(now: Date, period: DashboardPeriod) {
  const today = getClinicDayRange(now).start;
  if (period === "hoje") return getClinicDayRange(now);
  const local = new Date(today.getTime() - CLINIC_UTC_OFFSET_HOURS * 3_600_000);
  const year = local.getUTCFullYear();
  const month = local.getUTCMonth();
  const day = local.getUTCDate();
  if (period === "mes") {
    return {
      start: new Date(Date.UTC(year, month, 1, CLINIC_UTC_OFFSET_HOURS)),
      end: new Date(Date.UTC(year, month + 1, 1, CLINIC_UTC_OFFSET_HOURS)),
    };
  }
  const dayOfWeek = local.getUTCDay();
  const mondayOffset = (dayOfWeek + 6) % 7;
  const start = new Date(today.getTime() - mondayOffset * 86_400_000);
  return { start, end: new Date(start.getTime() + 7 * 86_400_000) };
}

export function getDashboardPeriodDays(start: Date, end: Date) {
  const result: Array<{ day: string; label: string }> = [];
  for (let time = start.getTime(); time < end.getTime(); time += 86_400_000) {
    const date = new Date(time);
    const day = new Intl.DateTimeFormat("en-CA", {
      timeZone: CLINIC_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
    }).format(date);
    result.push({
      day,
      label: new Intl.DateTimeFormat("pt-BR", {
        timeZone: CLINIC_TIME_ZONE, day: "2-digit", month: "2-digit",
      }).format(date),
    });
  }
  return result;
}

export function getDashboardDailySeries(
  start: Date,
  end: Date,
  consultations: Array<{ scheduledAt: Date }>,
  exams: Array<{ scheduledAt: Date }>,
) {
  const days = getDashboardPeriodDays(start, end);
  const keyOf = (date: Date) => new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date);
  const c = new Map<string, number>();
  const e = new Map<string, number>();
  for (const item of consultations) c.set(keyOf(item.scheduledAt), (c.get(keyOf(item.scheduledAt)) ?? 0) + 1);
  for (const item of exams) e.set(keyOf(item.scheduledAt), (e.get(keyOf(item.scheduledAt)) ?? 0) + 1);
  return days.map(({ day, label }) => ({ label, consultations: c.get(day) ?? 0, exams: e.get(day) ?? 0 }));
}


export function getPreviousDashboardPeriodRange(now: Date, period: DashboardPeriod) {
  const current = getDashboardPeriodRange(now, period);
  const previousInstant = new Date(current.start.getTime() - 1);
  return getDashboardPeriodRange(previousInstant, period);
}

export function calculatePeriodChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? "Sem variação" : "Sem base anterior";
  const change = Math.round(((current - previous) / previous) * 100);
  return `${change > 0 ? "+" : ""}${change}% em relação ao período anterior`;
}

export function isOverdueConsultation(
  item: { scheduledAt: Date; status: string },
  now: Date,
) {
  return item.scheduledAt.getTime() < now.getTime()
    && (item.status === "AGENDADA" || item.status === "CONFIRMADA");
}

export function escapeCsvCell(value: string | number) {
  const str = String(value);
  const safe = /^[=+@\-\t\r]/.test(str) ? "'" + str : str;
  return '"' + safe.replaceAll('"', '""') + '"';
}
