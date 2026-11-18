export type ListParams = Record<string, string | string[] | undefined>;
export function field(params: ListParams, key: string) {
  const value = params[key];
  return typeof value === "string" ? value.trim().slice(0, 100) : "";
}
export function clinicDay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const start = new Date(value + "T00:00:00-04:00");
  if (Number.isNaN(+start) || start.toISOString().slice(0, 10) !== value) return undefined;
  return { gte: start, lt: new Date(+start + 86400000) };
}
