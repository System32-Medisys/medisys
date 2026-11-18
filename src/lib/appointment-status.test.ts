import { describe, expect, it } from "vitest";
import { allowedStatuses } from "./appointment-status";

describe("transições de agendamento", () => {
  it("permite cancelar, reagendar e registrar faltas em consultas abertas", () => {
    for (const status of ["AGENDADA", "CONFIRMADA"]) {
      expect(allowedStatuses("consultation", status)).toEqual(expect.arrayContaining([
        "CANCELADA", "REAGENDADA", "FALTA_PACIENTE", "FALTA_MEDICO",
      ]));
    }
  });
  it("não permite falta médica em exame nem reabrir estados finais", () => {
    expect(allowedStatuses("exam", "AGENDADO")).not.toContain("FALTA_MEDICO");
    for (const status of ["CANCELADO", "REAGENDADO", "FALTA_PACIENTE", "RESULTADO_DISPONIVEL"]) {
      expect(allowedStatuses("exam", status)).toEqual([]);
    }
  });
});
