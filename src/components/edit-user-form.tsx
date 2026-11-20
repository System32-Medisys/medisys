"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type UserData = {
  id: string;
  role: "PACIENTE" | "MEDICO" | "ATENDENTE";
  cpf: string;
  fullName: string;
  birthDate: string;
  phone: string;
  email?: string | null;
  sex?: string | null;
  healthInsurance?: string | null;
  crm?: string | null;
  crmState?: string | null;
  serviceDays?: string | null;
  specialtyIds: string[];
  address: {
    zipCode: string; street: string; number: string; complement?: string | null;
    neighborhood: string; city: string; state: string;
  };
};

export function EditUserForm({
  user,
  specialties,
  destination,
}: {
  user: UserData;
  specialties: Array<{ id: string; name: string }>;
  destination: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const isDoctor = user.role === "MEDICO";
  const isAttendant = user.role === "ATENDENTE";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const optional = (name: string) => String(form.get(name) ?? "").trim() || null;
    const payload = {
      cpf: String(form.get("cpf") ?? ""),
      fullName: String(form.get("fullName") ?? ""),
      birthDate: String(form.get("birthDate") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: optional("email"),
      sex: isAttendant ? undefined : optional("sex"),
      healthInsurance: isAttendant ? undefined : optional("healthInsurance"),
      address: {
        zipCode: String(form.get("zipCode") ?? ""),
        street: String(form.get("street") ?? ""),
        number: String(form.get("number") ?? ""),
        complement: optional("complement"),
        neighborhood: String(form.get("neighborhood") ?? ""),
        city: String(form.get("city") ?? ""),
        state: String(form.get("state") ?? ""),
      },
      crm: isDoctor ? String(form.get("crm") ?? "") : undefined,
      crmState: isDoctor ? String(form.get("crmState") ?? "") : undefined,
      specialtyIds: isDoctor ? form.getAll("specialtyId").map(String) : undefined,
      serviceDays: isDoctor ? optional("serviceDays") : undefined,
    };
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error ?? "Não foi possível atualizar o cadastro.");
      setMessage("Cadastro atualizado com sucesso.");
      window.setTimeout(() => {
        router.push(destination);
        router.refresh();
      }, 700);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível atualizar o cadastro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card edit-registration-card">
      <form className="edit-registration-form" onSubmit={submit}>
        <fieldset>
          <legend>Dados pessoais</legend>
          <div className="edit-form-grid">
            <label>Nome completo<input defaultValue={user.fullName} name="fullName" required /></label>
            <label>CPF<input defaultValue={user.cpf} name="cpf" required /></label>
            <label>Data de nascimento<input defaultValue={user.birthDate} name="birthDate" required type="date" /></label>
            <label>Telefone<input defaultValue={user.phone} name="phone" required /></label>
            <label>E-mail<input defaultValue={user.email ?? ""} name="email" required={isDoctor} type="email" /></label>
            {!isAttendant && <label>Sexo<input defaultValue={user.sex ?? ""} name="sex" /></label>}
            {!isAttendant && <label>Convênio<input defaultValue={user.healthInsurance ?? ""} name="healthInsurance" /></label>}
          </div>
        </fieldset>

        {isDoctor && (
          <fieldset>
            <legend>Dados profissionais</legend>
            <div className="edit-form-grid">
              <label>CRM<input defaultValue={user.crm ?? ""} name="crm" required /></label>
              <label>UF do CRM<input defaultValue={user.crmState ?? ""} maxLength={2} name="crmState" required /></label>
              <label>Especialidade
                <select defaultValue={user.specialtyIds} multiple name="specialtyId" required>

                  {specialties.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label>Dias de atendimento<input defaultValue={user.serviceDays ?? ""} name="serviceDays" /></label>
            </div>
          </fieldset>
        )}

        <fieldset>
          <legend>Endereço</legend>
          <div className="edit-form-grid">
            <label>CEP<input defaultValue={user.address.zipCode} name="zipCode" required /></label>
            <label>Estado<input defaultValue={user.address.state} maxLength={2} name="state" required /></label>
            <label>Logradouro<input defaultValue={user.address.street} name="street" required /></label>
            <label>Número<input defaultValue={user.address.number} name="number" required /></label>
            <label>Complemento<input defaultValue={user.address.complement ?? ""} name="complement" /></label>
            <label>Bairro<input defaultValue={user.address.neighborhood} name="neighborhood" required /></label>
            <label>Cidade<input defaultValue={user.address.city} name="city" required /></label>
          </div>
        </fieldset>

        {message && <p aria-live="polite" className="form-message">{message}</p>}
        <div className="form-actions">
          <button className="button-link secondary" disabled={loading} onClick={() => router.push(destination)} type="button">Cancelar</button>
          <button disabled={loading} type="submit">{loading ? "Salvando..." : "Salvar alterações"}</button>
        </div>
      </form>
    </section>
  );
}
