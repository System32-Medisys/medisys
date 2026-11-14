"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Revalida os dados a cada cinco minutos somente com a aba visível. */
export function DashboardAutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 300_000);
    return () => window.clearInterval(interval);
  }, [router]);
  return null;
}
