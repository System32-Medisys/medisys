"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function ExamResultForm({ examId, initial }: {
  examId: string;
  initial?: { content: string; date: string; fileUrl: string | null };
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/exams/" + encodeURIComponent(examId) + "/results", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data.get("content"), resultDate: data.get("resultDate"),
          fileUrl: String(data.get("fileUrl") ?? "").trim() || undefined }),
      });
      if (!response.ok) throw new Error((await response.json()).error ?? "Não foi possível salvar.");
      setMessage("Resultado salvo.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally { setBusy(false); }
  }
  return <section className="card">
    <h2>{initial ? "Corrigir resultado" : "Registrar resultado"}</h2>
    <p className="muted">{initial ? "A correção cria uma nova versão e preserva as anteriores." : "O responsável será registrado automaticamente pela sessão."}</p>
    <form className="form" onSubmit={save}>
      <label>Descrição<textarea name="content" rows={5} required maxLength={10000} defaultValue={initial?.content} /></label>
      <label>Data do resultado<input type="date" name="resultDate" required defaultValue={initial?.date} /></label>
      <label>Link HTTPS do arquivo (opcional)
        <input type="url" name="fileUrl" maxLength={2048} defaultValue={initial?.fileUrl ?? ""} />
      </label>
      <p className="muted">Use apenas links de arquivos protegidos. Não use links públicos para resultados clínicos.</p>
      <button disabled={busy} type="submit">{busy ? "Salvando…" : "Salvar resultado"}</button>
      <p role="status">{message}</p>
    </form>
  </section>;
}
