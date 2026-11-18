"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function AccountAccess({ id, blocked }: { id: string; blocked: boolean }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const native = event.nativeEvent as SubmitEvent;
    const action = (native.submitter as HTMLButtonElement | null)?.value ?? "reset";
    if (!window.confirm(action === "unlock" ? "Desbloquear esta conta?" : "Redefinir a senha desta conta?")) return;
    setBusy(true);
    try {
      const response = await fetch("/api/users/" + encodeURIComponent(id) + "/access", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, password: action === "reset" ? new FormData(form).get("password") : undefined }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      form.reset();
      setMessage(result.message);
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Falha ao atualizar acesso."); }
    finally { setBusy(false); }
  }
  return <details><summary>Gerenciar acesso</summary><form className="form" onSubmit={submit}>
    <label>Senha temporária<input name="password" type="password" autoComplete="new-password" minLength={12} required /></label>
    <button type="submit" value="reset" disabled={busy}>Redefinir senha</button>
    {blocked && <button type="submit" value="unlock" formNoValidate disabled={busy}>Desbloquear conta</button>}
    <p role="status">{message}</p>
  </form></details>;
}
