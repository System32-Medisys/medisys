import { describe, expect, it } from "vitest";
import { clinicDateTimeToIso } from "./clinic-date";
import { formatDate, formatDateTime } from "./format";

describe("civil dates and clinic time", () => {
  it.each(["1990-01-10", "2000-01-01", "2000-02-29", "2025-12-31"])("preserves birth date %s", (value) => {
    const [year, month, day] = value.split("-");
    expect(formatDate(new Date(value))).toBe(`${day}/${month}/${year}`);
  });
  it.each(["UTC", "America/Sao_Paulo", "America/Porto_Velho"])("uses clinic time even in %s", (zone) => {
    const previous = process.env.TZ;
    process.env.TZ = zone;
    try {
      const iso = clinicDateTimeToIso("2026-12-01T09:00");
      expect(iso).toBe("2026-12-01T13:00:00.000Z");
      expect(formatDateTime(new Date(iso))).toContain("09:00");
    } finally {
      if (previous === undefined) delete process.env.TZ;
      else process.env.TZ = previous;
    }
  });
  it.each(["", "2026-02-30T09:00", "2026-12-01T25:00", "2026-12-01T09:00Z"])("rejects invalid local input %s", (value) => {
    expect(() => clinicDateTimeToIso(value)).toThrow("Informe uma data e hora válidas.");
  });
});
