export function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Porto_Velho",
  }).format(value);
}

export function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeZone: "America/Porto_Velho",
  }).format(value);
}

export function formatStatus(value: string) {
  return value.toLowerCase().replaceAll("_", " ");
}
