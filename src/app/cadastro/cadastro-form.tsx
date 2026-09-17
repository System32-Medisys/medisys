"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./cadastro.module.css";

type PersonType = "PACIENTE" | "MEDICO" | "ATENDENTE";
type SpecialtyOption = { id: string; name: string };
type FieldErrors = Record<string, string[]>;

const PERSON_TYPE = {
  PATIENT: "PACIENTE" as const,
  DOCTOR: "MEDICO" as const,
  ATTENDANT: "ATENDENTE" as const,
};

function onlyDigits(value: string, limit: number) {
  return value.replace(/\D/g, "").slice(0, limit);
}

function formatCpf(value: string) {
  return onlyDigits(value, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatPhone(value: string) {
  const digits = onlyDigits(value, 11);
  return digits.length <= 10
    ? digits.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2")
    : digits.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

function formatZipCode(value: string) {
  return onlyDigits(value, 8).replace(/(\d{5})(\d)/, "$1-$2");
}

function RequiredMark() {
  return <span aria-hidden="true" className={styles.required}>*</span>;
}

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

export function CadastroForm({
  fixedType = false,
  initialType,
  specialties,
}: {
  fixedType?: boolean;
  initialType: PersonType;
  specialties: SpecialtyOption[];
}) {
  const router = useRouter();
  const [personType, setPersonType] = useState<PersonType>(initialType);
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  function changePersonType(type: PersonType) {
    setPersonType(type);
    setFieldErrors({});
    setMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setMessage(null);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const optional = (name: string) => {
      const value = String(form.get(name) ?? "").trim();
      return value || undefined;
    };

    const payload = {
      cpf,
      fullName: String(form.get("fullName") ?? "").trim(),
      birthDate: String(form.get("birthDate") ?? ""),
      phone,
      email: optional("email"),
      sex: personType === PERSON_TYPE.ATTENDANT ? undefined : optional("sex"),
      healthInsurance: personType === PERSON_TYPE.ATTENDANT ? undefined : optional("healthInsurance"),
      password: String(form.get("password") ?? ""),
      role: personType,
      address: {
        zipCode,
        street: String(form.get("street") ?? "").trim(),
        number: String(form.get("number") ?? "").trim(),
        complement: optional("complement"),
        neighborhood: String(form.get("neighborhood") ?? "").trim(),
        city: String(form.get("city") ?? "").trim(),
        state: String(form.get("state") ?? "").trim().toUpperCase(),
      },
      crm: personType === PERSON_TYPE.DOCTOR ? optional("crm") : undefined,
      crmState: personType === PERSON_TYPE.DOCTOR
        ? String(form.get("crmState") ?? "").trim().toUpperCase()
        : undefined,
      specialtyIds: personType === PERSON_TYPE.DOCTOR
        ? [String(form.get("specialtyId") ?? "")]
        : undefined,
      serviceDays: personType === PERSON_TYPE.DOCTOR ? optional("serviceDays") : undefined,
    };

    try {
      const response = await fetch("/api/users", {
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
          text: result?.error ?? "Não foi possível realizar o cadastro. Tente novamente.",
        });
        window.requestAnimationFrame(() => {
          formElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
        });
        return;
      }

      setMessage({
        type: "success",
        text: `${personLabel.charAt(0).toUpperCase() + personLabel.slice(1)} cadastrado com sucesso.`,
      });
      window.setTimeout(() => {
        router.push(personType === PERSON_TYPE.PATIENT ? "/pacientes" : "/medicos");
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

  const destination = personType === PERSON_TYPE.PATIENT
    ? "/pacientes"
    : personType === PERSON_TYPE.DOCTOR
      ? "/medicos"
      : "/atendentes";

  const personLabel = personType === PERSON_TYPE.PATIENT
    ? "paciente"
    : personType === PERSON_TYPE.DOCTOR
      ? "médico"
      : "atendente";

  return (
    <section className={styles.card}>
      <p className={styles.requiredLegend}><RequiredMark /> Campos obrigatórios</p>

      {!fixedType && (
        <div className={styles.typeSelector} aria-label="Tipo de cadastro">
          <button
            className={personType === PERSON_TYPE.PATIENT ? styles.activeType : styles.inactiveType}
            onClick={() => changePersonType(PERSON_TYPE.PATIENT)}
            type="button"
          >
            Paciente
          </button>
          <button
            className={personType === PERSON_TYPE.DOCTOR ? styles.activeType : styles.inactiveType}
            onClick={() => changePersonType(PERSON_TYPE.DOCTOR)}
            type="button"
          >
            Médico
          </button>
        </div>
      )}

      <form className={styles.form} noValidate onSubmit={handleSubmit}>
        <fieldset className={styles.fieldset}>
          <legend>Dados pessoais</legend>
          <div className={styles.grid}>
            <label>
              <span>Nome completo <RequiredMark /></span>
              <input minLength={3} name="fullName" pattern="[^0-9]+" required {...errorProps(fieldErrors, "fullName")} />
              <FieldError errors={fieldErrors} name="fullName" />
            </label>
            <label>
              <span>CPF <RequiredMark /></span>
              <input
                inputMode="numeric"
                name="cpf"
                onChange={(event) => setCpf(formatCpf(event.target.value))}
                placeholder="000.000.000-00"
                required
                value={cpf}
                {...errorProps(fieldErrors, "cpf")}
              />
              <FieldError errors={fieldErrors} name="cpf" />
            </label>
            <label>
              <span>Data de nascimento <RequiredMark /></span>
              <input
                max={new Date().toISOString().split("T")[0]}
                name="birthDate"
                required
                type="date"
                {...errorProps(fieldErrors, "birthDate")}
              />
              <FieldError errors={fieldErrors} name="birthDate" />
            </label>
            <label>
              <span>Telefone <RequiredMark /></span>
              <input
                inputMode="tel"
                name="phone"
                onChange={(event) => setPhone(formatPhone(event.target.value))}
                placeholder="(00) 00000-0000"
                required
                value={phone}
                {...errorProps(fieldErrors, "phone")}
              />
              <FieldError errors={fieldErrors} name="phone" />
            </label>
            <label>
              <span>E-mail {personType === PERSON_TYPE.DOCTOR && <RequiredMark />}</span>
              <input
                name="email"
                required={personType === PERSON_TYPE.DOCTOR}
                type="email"
                {...errorProps(fieldErrors, "email")}
              />
              <FieldError errors={fieldErrors} name="email" />
            </label>
            {personType !== PERSON_TYPE.ATTENDANT && (
              <>
                <label>
                  <span>Sexo</span>
                  <select defaultValue="" name="sex">
                    <option value="">Não informado</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </label>
                <label>
                  <span>Convênio</span>
                  <input name="healthInsurance" />
                </label>
              </>
            )}
            <label>
              <span>Senha inicial <RequiredMark /></span>
              <input minLength={6} name="password" required type="password" {...errorProps(fieldErrors, "password")} />
              <FieldError errors={fieldErrors} name="password" />
            </label>
          </div>
        </fieldset>

        {personType === PERSON_TYPE.DOCTOR && (
          <fieldset className={styles.fieldset}>
            <legend>Dados profissionais</legend>
            <div className={styles.grid}>
              <label>
                <span>CRM <RequiredMark /></span>
                <input inputMode="numeric" name="crm" pattern="[0-9]+" required {...errorProps(fieldErrors, "crm")} />
                <FieldError errors={fieldErrors} name="crm" />
              </label>
              <label>
                <span>UF do CRM <RequiredMark /></span>
                <input maxLength={2} minLength={2} name="crmState" required {...errorProps(fieldErrors, "crmState")} />
                <FieldError errors={fieldErrors} name="crmState" />
              </label>
              <label>
                <span>Especialidade <RequiredMark /></span>
                <select defaultValue="" name="specialtyId" required {...errorProps(fieldErrors, "specialtyIds")}>
                  <option disabled value="">Selecione</option>
                  {specialties.map((specialty) => (
                    <option key={specialty.id} value={specialty.id}>{specialty.name}</option>
                  ))}
                </select>
                <FieldError errors={fieldErrors} name="specialtyIds" />
              </label>
              <label>
                <span>Dias de atendimento</span>
                <input name="serviceDays" placeholder="Ex.: segunda, quarta e sexta" />
              </label>
            </div>
            {specialties.length === 0 && (
              <p className={styles.hint}>
                Não há especialidades ativas. Cadastre uma especialidade antes de cadastrar o médico.
              </p>
            )}
          </fieldset>
        )}

        <fieldset className={styles.fieldset}>
          <legend>Endereço</legend>
          <div className={styles.grid}>
            <label>
              <span>CEP <RequiredMark /></span>
              <input
                inputMode="numeric"
                name="zipCode"
                onChange={(event) => setZipCode(formatZipCode(event.target.value))}
                placeholder="00000-000"
                required
                value={zipCode}
                {...errorProps(fieldErrors, "address.zipCode")}
              />
              <FieldError errors={fieldErrors} name="address.zipCode" />
            </label>
            <label>
              <span>Estado <RequiredMark /></span>
              <input maxLength={2} minLength={2} name="state" required {...errorProps(fieldErrors, "address.state")} />
              <FieldError errors={fieldErrors} name="address.state" />
            </label>
            <label className={styles.wide}>
              <span>Logradouro <RequiredMark /></span>
              <input name="street" required {...errorProps(fieldErrors, "address.street")} />
              <FieldError errors={fieldErrors} name="address.street" />
            </label>
            <label>
              <span>Número <RequiredMark /></span>
              <input name="number" required {...errorProps(fieldErrors, "address.number")} />
              <FieldError errors={fieldErrors} name="address.number" />
            </label>
            <label>
              <span>Complemento</span>
              <input name="complement" />
            </label>
            <label>
              <span>Bairro <RequiredMark /></span>
              <input name="neighborhood" required {...errorProps(fieldErrors, "address.neighborhood")} />
              <FieldError errors={fieldErrors} name="address.neighborhood" />
            </label>
            <label>
              <span>Cidade <RequiredMark /></span>
              <input name="city" required {...errorProps(fieldErrors, "address.city")} />
              <FieldError errors={fieldErrors} name="address.city" />
            </label>
          </div>
        </fieldset>

        {message && (
          <p aria-live="polite" className={message.type === "success" ? styles.success : styles.error} role="status">
            {message.text}
          </p>
        )}

        <div className={styles.actions}>
          <button
            className={styles.secondaryButton}
            disabled={submitting}
            onClick={() => router.push(destination)}
            type="button"
          >
            Cancelar
          </button>
          <button
            className={styles.primaryButton}
            disabled={submitting || (personType === PERSON_TYPE.DOCTOR && specialties.length === 0)}
            type="submit"
          >
            {submitting ? "Cadastrando..." : `Cadastrar ${personLabel}`}
          </button>
        </div>
      </form>
    </section>
  );
}
