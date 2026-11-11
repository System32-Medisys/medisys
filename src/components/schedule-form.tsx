"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./schedule-form.module.css";

type Option = { id: string; label: string };
type FieldErrors = Record<string, string[]>;
type ScheduleKind = "consultation" | "exam";

function FieldError({ errors, name }: { errors: FieldErrors; name: string }) {
  const message = errors[name]?.[0];
  return message ? <span className={styles.fieldError} id={`${name}-error`}>{message}</span> : null;
}

function errorProps(errors: FieldErrors, name: string) {
  return {
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
    "aria-invalid": errors[name] ? true as const : undefined,
  };
}

export function ScheduleForm({
  kind,
  patients,
  targets,
}: {
  kind: ScheduleKind;
  patients: Option[];
  targets: Option[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const isConsultation = kind === "consultation";
  const endpoint = isConsultation ? "/api/consultations" : "/api/exams";
  const destination = isConsultation ? "/consultas" : "/exames";
  const targetName = isConsultation ? "doctorId" : "examTypeId";
  const targetLabel = isConsultation ? "Médico" : "Tipo de exame";
  const scheduleLabel = isConsultation ? "Consulta" : "Exame";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setMessage(null);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const localDateTime = String(form.get("scheduledAt") ?? "");
    const parsedDate = new Date(localDateTime);

    if (!localDateTime || Number.isNaN(parsedDate.getTime())) {
      setFieldErrors({ scheduledAt: ["Informe uma data e hora válidas."] });
      setMessage({ type: "error", text: "Corrija os campos destacados." });
      setSubmitting(false);
      return;
    }

    const payload = {
      patientId: String(form.get("patientId") ?? ""),
      [targetName]: String(form.get(targetName) ?? ""),
      scheduledAt: parsedDate.toISOString(),
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        const errors = result?.fields && typeof result.fields === "object"
          ? result.fields as FieldErrors
          : {};
        setFieldErrors(errors);
        setMessage({
          type: "error",
          text: result?.error ?? `Não foi possível agendar o ${scheduleLabel.toLowerCase()}.`,
        });
        window.requestAnimationFrame(() => {
          formElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
        });
        return;
      }

      setMessage({ type: "success", text: `${scheduleLabel} agendado com sucesso.` });
      window.setTimeout(() => {
        router.push(destination);
        router.refresh();
      }, 900);
    } catch {
      setMessage({
        type: "error",
        text: "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const unavailable = patients.length === 0 || targets.length === 0;

  return (
    <section className={styles.card}>
      {unavailable && (
        <p className={styles.warning} role="alert">
          {patients.length === 0
            ? "Não há pacientes ativos disponíveis para agendamento."
            : `Não há ${isConsultation ? "médicos ativos" : "tipos de exames ativos"} disponíveis para agendamento.`}
        </p>
      )}

      <form className={styles.form} noValidate onSubmit={handleSubmit}>
        <div className={styles.grid}>
          <label>
            <span>Paciente <strong aria-hidden="true">*</strong></span>
            <select defaultValue="" disabled={submitting} name="patientId" required {...errorProps(fieldErrors, "patientId")}>
              <option disabled value="">Selecione um paciente</option>
              {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.label}</option>)}
            </select>
            <FieldError errors={fieldErrors} name="patientId" />
          </label>

          <label>
            <span>{targetLabel} <strong aria-hidden="true">*</strong></span>
            <select defaultValue="" disabled={submitting} name={targetName} required {...errorProps(fieldErrors, targetName)}>
              <option disabled value="">Selecione {isConsultation ? "um médico" : "um tipo de exame"}</option>
              {targets.map((target) => <option key={target.id} value={target.id}>{target.label}</option>)}
            </select>
            <FieldError errors={fieldErrors} name={targetName} />
          </label>

          <label className={styles.wide}>
            <span>Data e hora <strong aria-hidden="true">*</strong></span>
            <input disabled={submitting} name="scheduledAt" required type="datetime-local" {...errorProps(fieldErrors, "scheduledAt")} />
            <FieldError errors={fieldErrors} name="scheduledAt" />
          </label>
        </div>

        {message && (
          <p aria-live="polite" className={message.type === "success" ? styles.success : styles.error} role="status">
            {message.text}
          </p>
        )}

        <div className={styles.actions}>
          <button className={styles.secondaryButton} disabled={submitting} onClick={() => router.push(destination)} type="button">
            Cancelar
          </button>
          <button className={styles.primaryButton} disabled={submitting || unavailable} type="submit">
            {submitting ? "Agendando..." : `Agendar ${scheduleLabel.toLowerCase()}`}
          </button>
        </div>
      </form>
    </section>
  );
}
