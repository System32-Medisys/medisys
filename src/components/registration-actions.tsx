"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RegistrationActions({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function changeStatus() {
    const action = active ? "desativar" : "reativar";
    if (!window.confirm(`Deseja realmente ${action} este cadastro? O histórico será preservado.`)) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: active ? "INATIVO" : "ATIVO" }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error ?? "Não foi possível alterar o cadastro.");
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Não foi possível alterar o cadastro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="registration-actions">
      <Link className="table-action edit" href={`/cadastro/editar/${id}`}>Editar</Link>
      <button className={active ? "table-action deactivate" : "table-action reactivate"} disabled={loading} onClick={changeStatus} type="button">
        {loading ? "Aguarde..." : active ? "Desativar" : "Reativar"}
      </button>
    </span>
  );
}
