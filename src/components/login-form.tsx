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
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ cpf: form.get("cpf"), password: form.get("password") }) });
    const data = await response.json(); setLoading(false);
    if (!response.ok) return setError(data.error);
    router.push(data.mustChangePassword ? "/trocar-senha" : "/dashboard"); router.refresh();
  }
  return <form onSubmit={submit} className="card form">
    <label>CPF<input name="cpf" inputMode="numeric" placeholder="000.000.000-00" required /></label>
    <label>Senha<input name="password" type="password" minLength={6} required /></label>
    {error && <p className="error" role="alert">{error}</p>}
    <button disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
  </form>;
}
