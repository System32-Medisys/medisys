"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type MouseEvent, type ReactNode, useEffect, useState } from "react";

export function DashboardInteractions({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [pendingElement, setPendingElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    pendingElement?.classList.remove("is-loading");
    pendingElement?.querySelector(".dashboard-inline-spinner")?.remove();
    setPendingHref(null);
    setPendingElement(null);
  }, [pathname, searchParams]);

  function navigate(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const link = target.closest<HTMLAnchorElement>("a[href]");
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || link.target === "_blank") return;
    const isPeriod = Boolean(link.closest("nav") && href.startsWith("/dashboard?"));
    const isCard = link.matches(".kpi-card, .alert, .daily-highlight, .quick-action");
    if (!isPeriod && !isCard) return;

    event.preventDefault();
    pendingElement?.classList.remove("is-loading");
    pendingElement?.querySelector(".dashboard-inline-spinner")?.remove();
    link.classList.add("is-loading");
    const spinner = document.createElement("span");
    spinner.className = "dashboard-inline-spinner";
    spinner.setAttribute("role", "status");
    spinner.setAttribute("aria-label", "Carregando");
    link.append(spinner);
    setPendingElement(link);
    setPendingHref(href);
    router.push(href);
  }

  return (
    <div className="dashboard-interactions" onClick={navigate} aria-busy={pendingHref !== null}>
      {children}
    </div>
  );
}
