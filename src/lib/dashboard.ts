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
