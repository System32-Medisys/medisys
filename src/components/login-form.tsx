"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ cpf: form.get("cpf"), password: form.get("password") }), signal: AbortSignal.timeout(20000) });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(typeof data?.error === "string" ? data.error : "Não foi possível entrar. Tente novamente.");
        return;
      }
      if (!data || typeof data.mustChangePassword !== "boolean") {
        setError("O servidor retornou uma resposta inesperada. Tente novamente.");
        return;
      }
      router.push(data.mustChangePassword ? "/trocar-senha" : "/dashboard");
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  }
  return <form onSubmit={submit} className="card form" aria-busy={loading}>
    <label>CPF<input name="cpf" inputMode="numeric" placeholder="000.000.000-00" required /></label>
    <label>Senha<input name="password" type="password" minLength={6} required /></label>
    {error && <p className="error" role="alert">{error}</p>}
    <button disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
  </form>;
}
