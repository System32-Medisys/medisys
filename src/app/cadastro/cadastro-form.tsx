"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./cadastro.module.css";

type PersonType = "PACIENTE" | "MEDICO";

const PERSON_TYPE = {
  PATIENT: "PACIENTE" as const,
  DOCTOR: "MEDICO" as const,
};
type SpecialtyOption = { id: string; name: string };

function onlyDigits(value: string, limit: number) {
  return value.replace(/\D/g, "").slice(0, limit);
}

function formatCpf(value: string) {
  const digits = onlyDigits(value, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatPhone(value: string) {
  const digits = onlyDigits(value, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function formatZipCode(value: string) {
  return onlyDigits(value, 8).replace(/(\d{5})(\d)/, "$1-$2");
}

export function CadastroForm({
  initialType,
  specialties,
}: {
  initialType: PersonType;
  specialties: SpecialtyOption[];
}) {
  const router = useRouter();
  const [personType, setPersonType] = useState<PersonType>(initialType);
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const form = new FormData(event.currentTarget);
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
      sex: optional("sex"),
      healthInsurance: optional("healthInsurance"),
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
        ? String(form.get("crmState") ?? "").toUpperCase()
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
        setMessage({
          type: "error",
          text: result?.error ?? "Não foi possível realizar o cadastro.",
        });
        return;
      }

      setMessage({ type: "success", text: "Cadastro realizado com sucesso." });
      router.push(personType === PERSON_TYPE.PATIENT ? "/pacientes" : "/medicos");
      router.refresh();
    } catch {
      setMessage({
        type: "error",
        text: "Não foi possível conectar ao servidor. Tente novamente.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const destination = personType === PERSON_TYPE.PATIENT ? "/pacientes" : "/medicos";

  return (
    <section className={styles.card}>
      <div className={styles.typeSelector} aria-label="Tipo de cadastro">
        <button
          className={personType === PERSON_TYPE.PATIENT ? styles.activeType : styles.inactiveType}
          onClick={() => {
            setPersonType(PERSON_TYPE.PATIENT);
            setMessage(null);
          }}
          type="button"
        >
          Paciente
        </button>
        <button
          className={personType === PERSON_TYPE.DOCTOR ? styles.activeType : styles.inactiveType}
          onClick={() => {
            setPersonType(PERSON_TYPE.DOCTOR);
            setMessage(null);
          }}
          type="button"
        >
          Médico
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <fieldset className={styles.fieldset}>
          <legend>Dados pessoais</legend>
          <div className={styles.grid}>
            <label>
              Nome completo
              <input name="fullName" minLength={3} pattern="[^0-9]+" required />
            </label>
            <label>
              CPF
              <input
                inputMode="numeric"
                name="cpf"
                onChange={(event) => setCpf(formatCpf(event.target.value))}
                placeholder="000.000.000-00"
                required
                value={cpf}
              />
            </label>
            <label>
              Data de nascimento
              <input
                max={new Date().toISOString().split("T")[0]}
                name="birthDate"
                required
                type="date"
              />
            </label>
            <label>
              Telefone
              <input
                inputMode="tel"
                name="phone"
                onChange={(event) => setPhone(formatPhone(event.target.value))}
                placeholder="(00) 00000-0000"
                required
                value={phone}
              />
            </label>
            <label>
              E-mail
              <input name="email" required={personType === PERSON_TYPE.DOCTOR} type="email" />
            </label>
            <label>
              Sexo
              <select defaultValue="" name="sex">
                <option value="">Não informado</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </label>
            <label>
              Convênio
              <input name="healthInsurance" />
            </label>
            <label>
              Senha inicial
              <input minLength={6} name="password" required type="password" />
            </label>
          </div>
        </fieldset>

        {personType === PERSON_TYPE.DOCTOR && (
          <fieldset className={styles.fieldset}>
            <legend>Dados profissionais</legend>
            <div className={styles.grid}>
              <label>
                CRM
                <input inputMode="numeric" name="crm" pattern="[0-9]+" required />
              </label>
              <label>
                UF do CRM
                <input maxLength={2} minLength={2} name="crmState" required />
              </label>
              <label>
                Especialidade
                <select defaultValue="" name="specialtyId" required>
                  <option disabled value="">Selecione</option>
                  {specialties.map((specialty) => (
                    <option key={specialty.id} value={specialty.id}>
                      {specialty.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Dias de atendimento
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
              CEP
              <input
                inputMode="numeric"
                name="zipCode"
                onChange={(event) => setZipCode(formatZipCode(event.target.value))}
                placeholder="00000-000"
                required
                value={zipCode}
              />
            </label>
            <label>
              Estado
              <input maxLength={2} minLength={2} name="state" required />
            </label>
            <label className={styles.wide}>
              Logradouro
              <input name="street" required />
            </label>
            <label>
              Número
              <input name="number" required />
            </label>
            <label>
              Complemento
              <input name="complement" />
            </label>
            <label>
              Bairro
              <input name="neighborhood" required />
            </label>
            <label>
              Cidade
              <input name="city" required />
            </label>
          </div>
        </fieldset>

        {message && (
          <p
            aria-live="polite"
            className={message.type === "success" ? styles.success : styles.error}
            role="status"
          >
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
            {submitting
              ? "Cadastrando..."
              : `Cadastrar ${personType === PERSON_TYPE.PATIENT ? "paciente" : "médico"}`}
          </button>
        </div>
      </form>
    </section>
  );
}
