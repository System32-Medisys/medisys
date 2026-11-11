import { Role } from "@prisma/client";
import Link from "next/link";
import type { ReactNode } from "react";

type IconName =
  | "home"
  | "calendar"
  | "exam"
  | "patient"
  | "doctor"
  | "people"
  | "attendant"
  | "clipboard"
  | "audit"
  | "settings"
  | "logout";

type NavigationItem = {
  href: string;
  label: string;
  icon: IconName;
  roles: readonly Role[];
};

type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

const allRoles = [Role.PACIENTE, Role.MEDICO, Role.ATENDENTE, Role.ADMINISTRADOR] as const;
const staffRoles = [Role.ATENDENTE, Role.ADMINISTRADOR] as const;

const navigation: NavigationGroup[] = [
  {
    label: "Visão geral",
    items: [{ href: "/dashboard", label: "Início", icon: "home", roles: allRoles }],
  },
  {
    label: "Agenda",
    items: [
      { href: "/consultas", label: "Consultas", icon: "calendar", roles: allRoles },
      { href: "/exames", label: "Exames e resultados", icon: "exam", roles: allRoles },
    ],
  },
  {
    label: "Pessoas",
    items: [
      { href: "/pacientes", label: "Pacientes", icon: "patient", roles: staffRoles },
      { href: "/medicos", label: "Médicos", icon: "doctor", roles: staffRoles },
      { href: "/cadastro", label: "Cadastrar pessoas", icon: "people", roles: staffRoles },
      { href: "/atendentes", label: "Atendentes", icon: "attendant", roles: [Role.ADMINISTRADOR] },
    ],
  },
  {
    label: "Gestão",
    items: [
      { href: "/tipos-exames", label: "Tipos de exames", icon: "clipboard", roles: staffRoles },
      { href: "/auditoria", label: "Auditoria", icon: "audit", roles: [Role.ADMINISTRADOR] },
      { href: "/configuracoes", label: "Configurações", icon: "settings", roles: [Role.ADMINISTRADOR] },
    ],
  },
];

const roleLabels: Record<Role, string> = {
  PACIENTE: "Paciente",
  MEDICO: "Médico",
  ATENDENTE: "Atendente",
  ADMINISTRADOR: "Administrador",
};

function NavIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="m3 11 9-7 9 7" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    exam: <><path d="M9 3h6l1 3h3v15H5V6h3l1-3Z" /><path d="M9 13h6M12 10v6" /></>,
    patient: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    doctor: <><circle cx="12" cy="7" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0M18 12v6M15 15h6" /></>,
    people: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M16 11h6" /></>,
    attendant: <><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0M17 8h5M19.5 5.5v5" /></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V2h6v2M9 10h6M9 14h6" /></>,
    audit: <><path d="M4 4h10v16H4zM8 8h3M8 12h3" /><circle cx="17" cy="16" r="4" /><path d="m20 19 2 2" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M15 4h5v16h-5" /></>,
  };

  return <span className="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24">{paths[name]}</svg></span>;
}

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
  const initials = userName.split(" ").slice(0, 2).map((name) => name[0]).join("").toUpperCase();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Link className="sidebar-brand" href="/dashboard" aria-label="Página inicial do Medisys">
          <span className="brand brand-small">M+</span>
          <span><strong>Medisys</strong><small>SYSTEM32</small></span>
        </Link>

        <nav className="main-navigation" aria-label="Navegação principal">
          {navigation.map((group) => {
            const items = group.items.filter((item) => item.roles.includes(role));
            if (!items.length) return null;

            return (
              <section className="nav-group" key={group.label}>
                <p className="nav-group-label">{group.label}</p>
                <div className="nav-group-items">
                  {items.map((item) => {
                    const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
                    return (
                      <Link className={active ? "nav-link active" : "nav-link"} href={item.href} key={item.href}>
                        <NavIcon name={item.icon} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </nav>

        <div className="sidebar-account">
          <span className="user-avatar" aria-hidden="true">{initials}</span>
          <span className="sidebar-user"><strong>{userName}</strong><small>{roleLabels[role]}</small></span>
        </div>
        <form action="/api/auth/logout" method="post" className="sidebar-footer">
          <button className="nav-link logout-button" type="submit">
            <NavIcon name="logout" />
            <span>Sair</span>
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
            <span className="user-avatar" aria-hidden="true">{initials}</span>
            <span><strong>{userName}</strong><small>{roleLabels[role]}</small></span>
          </div>
        </header>
        <main className="page-main">{children}</main>
      </div>
    </div>
  );
}
