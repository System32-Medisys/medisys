export const transitions = {
  consultation: {
    AGENDADA: ["CONFIRMADA", "CANCELADA", "REAGENDADA", "FALTA_PACIENTE", "FALTA_MEDICO"],
    CONFIRMADA: ["REALIZADA", "CANCELADA", "REAGENDADA", "FALTA_PACIENTE", "FALTA_MEDICO"],
  },
  exam: {
    AGENDADO: ["REALIZADO", "CANCELADO", "REAGENDADO", "FALTA_PACIENTE"],
    REALIZADO: ["RESULTADO_PENDENTE"],
  },
} satisfies Record<string, Record<string, readonly string[]>>;

export type AppointmentKind = keyof typeof transitions;
export function allowedStatuses(kind: AppointmentKind, status: string): readonly string[] {
  const statuses = transitions[kind] as Record<string, readonly string[]>;
  return Object.hasOwn(statuses, status) ? statuses[status] : [];
}
