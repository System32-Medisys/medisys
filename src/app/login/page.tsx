import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return <main className="auth-page"><section className="auth-shell"><div className="brand">M+</div><p className="eyebrow">SYSTEM32</p><h1>Medisys</h1><p className="muted">Acesse a gestão da clínica com seu CPF.</p><LoginForm /></section></main>;
}
