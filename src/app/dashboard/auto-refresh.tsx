"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Atualiza somente os dados do servidor; não altera formulários nem permissões. */
export function DashboardAutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 60_000);
    return () => window.clearInterval(interval);
  }, [router]);
  return null;
}
