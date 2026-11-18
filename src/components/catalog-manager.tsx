"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Item = { id: string; name: string; description?: string; active: boolean };

export function CatalogManager({
  items,
  kind,
}: {
  items: Item[];
  kind: "exam-type" | "specialty";
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isExamType = kind === "exam-type";
  const baseEndpoint = isExamType ? "/api/exam-types" : "/api/specialties";
  const label = isExamType ? "tipo de exame" : "especialidade";

  async function request(endpoint: string, method: "POST" | "PATCH", body: object) {
    setLoading(true);
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error ?? "Não foi possível concluir a operação.");
      setEditing(null);
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Não foi possível concluir a operação.");
    } finally {
      setLoading(false);
    }
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await request(baseEndpoint, "POST", {
      name: String(form.get("name") ?? ""),
      ...(isExamType ? { description: String(form.get("description") ?? "") } : {}),
    });
    event.currentTarget.reset();
  }

  async function save(event: FormEvent<HTMLFormElement>, item: Item) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await request(`${baseEndpoint}/${item.id}`, "PATCH", {
      name: String(form.get("name") ?? ""),
      ...(isExamType ? { description: String(form.get("description") ?? "") } : {}),
      active: item.active,
    });
  }

  async function toggle(item: Item) {
    const action = item.active ? "desativar" : "reativar";
    if (!window.confirm(`Deseja ${action} ${label} “${item.name}”? Os registros anteriores serão preservados.`)) return;
    await request(`${baseEndpoint}/${item.id}`, "PATCH", {
      name: item.name,
      ...(isExamType ? { description: item.description ?? "" } : {}),
      active: !item.active,
    });
  }

  return (
    <div className="catalog-manager">
      <form className="catalog-create" onSubmit={create}>
        <label>Nome<input name="name" minLength={2} required /></label>
        {isExamType && <label>Descrição<input name="description" minLength={2} required /></label>}
        <button disabled={loading} type="submit">Cadastrar {label}</button>
      </form>

      <div className="catalog-list">
        {items.length === 0 && <p className="empty-state">Nenhum cadastro encontrado.</p>}
        {items.map((item) => editing === item.id ? (
          <form className="catalog-row editing" key={item.id} onSubmit={(event) => save(event, item)}>
            <input defaultValue={item.name} name="name" minLength={2} required />
            {isExamType && <input defaultValue={item.description} name="description" minLength={2} required />}
            <span className="status-badge">{item.active ? "ativo" : "inativo"}</span>
            <span className="registration-actions">
              <button className="table-action edit" disabled={loading} type="submit">Salvar</button>
              <button className="table-action" onClick={() => setEditing(null)} type="button">Cancelar</button>
            </span>
          </form>
        ) : (
          <div className="catalog-row" key={item.id}>
            <span><strong>{item.name}</strong>{isExamType && <small>{item.description}</small>}</span>
            <span className="status-badge">{item.active ? "ativo" : "inativo"}</span>
            <span className="registration-actions">
              <button className="table-action edit" onClick={() => setEditing(item.id)} type="button">Editar</button>
              <button className={item.active ? "table-action deactivate" : "table-action reactivate"} disabled={loading} onClick={() => toggle(item)} type="button">
                {item.active ? "Desativar" : "Reativar"}
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
