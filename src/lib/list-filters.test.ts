import { expect, it } from "vitest";
import { clinicDay, field } from "./list-filters";

it("usa o dia civil de Porto Velho", () => {
  const range = clinicDay("2026-11-18");
  expect(range?.gte.toISOString()).toBe("2026-11-18T04:00:00.000Z");
  expect(range?.lt.toISOString()).toBe("2026-11-19T04:00:00.000Z");
});

it("ignora datas inválidas e parâmetros repetidos", () => {
  expect(clinicDay("2026-02-30")).toBeUndefined();
  expect(field({ data: ["a", "b"] }, "data")).toBe("");
});
