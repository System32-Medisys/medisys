import { Role } from "@prisma/client";
import Link from "next/link";
import type { ReactNode } from "react";
import { NavigationIcon } from "./navigation-icon";

type NavigationItem = {
  href: string;
  label: string;
  shortLabel: string;
  roles: readonly Role[];
};

const allRoles = [Role.PACIENTE, Role.MEDICO, Role.ATENDENTE, Role.ADMINISTRADOR] as const;
const staffRoles = [Role.ATENDENTE, Role.ADMINISTRADOR] as const;

const navigation: NavigationItem[] = [
  { href: "/dashboard", label: "Início", shortLabel: "IN", roles: allRoles },
  { href: "/consultas", label: "Consultas", shortLabel: "CO", roles: allRoles },
  { href: "/exames", label: "Exames e resultados", shortLabel: "EX", roles: allRoles },
  { href: "/pacientes", label: "Pacientes", shortLabel: "PA", roles: staffRoles },
  { href: "/medicos", label: "Médicos", shortLabel: "ME", roles: staffRoles },
  { href: "/cadastro", label: "Cadastrar pessoas", shortLabel: "CP", roles: staffRoles },
  { href: "/atendentes", label: "Atendentes", shortLabel: "AT", roles: [Role.ADMINISTRADOR] },
  { href: "/tipos-exames", label: "Tipos de exames", shortLabel: "TE", roles: staffRoles },
  { href: "/auditoria", label: "Auditoria", shortLabel: "AU", roles: [Role.ADMINISTRADOR] },
  { href: "/configuracoes", label: "Configurações", shortLabel: "CF", roles: [Role.ADMINISTRADOR] },
];

const roleLabels: Record<Role, string> = {
  PACIENTE: "Paciente",
  MEDICO: "Médico",
  ATENDENTE: "Atendente",
  ADMINISTRADOR: "Administrador",
};

export function AppShell({
  children,
  currentPath,
  role,
  title,
  subtitle,
  userName,
}: {
  children: ReactNode;
  currentPath: string;
  role: Role;
  title: string;
  subtitle?: string;
  userName: string;
}) {
  const items = navigation.filter((item) => item.roles.includes(role));

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Link className="sidebar-brand" href="/dashboard" aria-label="Página inicial do Medisys">
          <span className="brand brand-small">m<span>+</span></span>
          <span><strong>Medisys</strong><small>SYSTEM32</small></span>
        </Link>
        <nav className="main-navigation" aria-label="Navegação principal">
          {items.map((item) => (
            <Link
              className={currentPath === item.href ? "nav-link active" : "nav-link"}
              href={item.href}
              aria-current={currentPath === item.href ? "page" : undefined}
              key={item.href}
            >
              <span className="nav-icon" aria-hidden="true"><NavigationIcon name={item.shortLabel} /></span>
              {item.label}
            </Link>
          ))}
        </nav>
        <form action="/api/auth/logout" method="post" className="sidebar-footer">
          <button className="nav-link logout-button" type="submit">
            <span className="nav-icon" aria-hidden="true"><NavigationIcon name="SA" /></span>
            Sair
          </button>
        </form>
      </aside>

      <div className="app-content">
        <header className="page-header">
          <div>
            <p className="eyebrow">MEDISYS</p>
            <h1>{title}</h1>
            {subtitle && <p className="muted page-subtitle">{subtitle}</p>}
          </div>
          <div className="user-summary">
            <strong>{userName}</strong>
            <span>{roleLabels[role]}</span>
          </div>
        </header>
        <main className="page-main">{children}</main>
      </div>
    </div>
  );
}
