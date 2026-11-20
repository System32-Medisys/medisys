/** Convert a datetime-local value in the clinic's Porto Velho time (UTC-04). */
export function clinicDateTimeToIso(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    throw new Error("Informe uma data e hora válidas.");
  }
  const date = new Date(`${value}:00-04:00`);
  if (Number.isNaN(date.getTime()) ||
      new Date(date.getTime() - 4 * 60 * 60 * 1000).toISOString().slice(0, 16) !== value) {
    throw new Error("Informe uma data e hora válidas.");
  }
  return date.toISOString();
}
