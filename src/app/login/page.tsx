import { LoginForm } from "@/components/login-form";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <main className={styles.loginPage}>
      <section className={styles.visualPanel} aria-label="Boas-vindas ao Medisys">
        <div className={styles.visualContent}>
          <span className={styles.visualBadge}>
            <span className={styles.badgeMark} aria-hidden="true">+</span>
            Cuidado conectado
          </span>
          <h2>Cuidado em cada detalhe.</h2>
          <p>Consultas, exames e informações da clínica organizados em um só lugar.</p>
          <div className={styles.visualFooter}>
            <span className={styles.pulseMark} aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none">
                <path d="M3 16h7l3-8 6 16 3-8h7" />
              </svg>
            </span>
            <span>Medisys <span aria-hidden="true">·</span> Gestão de saúde</span>
          </div>
        </div>
      </section>

      <section className={styles.formPanel} aria-labelledby="login-title">
        <div className={styles.loginShell}>
          <div className="brand" aria-hidden="true">M+</div>
          <p className="eyebrow">SYSTEM32</p>
          <h1 id="login-title">Medisys</h1>
          <p className={`muted ${styles.loginSubtitle}`}>Acesse a gestão da clínica com seu CPF.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
