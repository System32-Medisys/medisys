"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { allowedStatuses, type AppointmentKind } from "@/lib/appointment-status";
import { formatStatus } from "@/lib/format";

export function AppointmentActions({ id, kind, status }: { id: string; kind: AppointmentKind; status: string }) {
  const router = useRouter();
  const options = allowedStatuses(kind, status);
  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  if (!options.length) return null;
  const reschedule = target.startsWith("REAGENDAD");
  const requiresReason = reschedule || target.startsWith("CANCELAD");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setMessage("");
    try {
      const date = String(data.get("scheduledAt") ?? "");
      const response = await fetch("/api/" + (kind === "exam" ? "exams" : "consultations") + "/" + encodeURIComponent(id), {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: target, justification: requiresReason ? data.get("justification") : undefined,
          scheduledAt: reschedule ? new Date(date + ":00-04:00").toISOString() : undefined,
        }),
      });
      if (!response.ok) throw new Error((await response.json()).error ?? "Não foi possível alterar o agendamento.");
      setMessage("Agendamento atualizado.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível alterar o agendamento.");
    } finally {
      setBusy(false);
    }
  }

  return <details>
    <summary>Alterar agendamento</summary>
    <form className="form" onSubmit={submit}>
      <label>Novo status
        <select required value={target} onChange={(event) => setTarget(event.target.value)}>
          <option value="">Selecione</option>
          {options.map((option) => <option key={option} value={option}>{formatStatus(option)}</option>)}
        </select>
      </label>
      {requiresReason && <label>Justificativa<textarea required maxLength={1000} name="justification" /></label>}
      {reschedule && <label>Novo horário (Porto Velho)<input required type="datetime-local" name="scheduledAt" /></label>}
      <button type="submit" disabled={!target || busy}>{busy ? "Salvando…" : "Confirmar alteração"}</button>
      <p role="status">{message}</p>
    </form>
  </details>;
}
