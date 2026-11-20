"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, type ReactNode } from "react";

export function PrefetchNavLink({
  href,
  className,
  active = false,
  children,
}: {
  href: string;
  className: string;
  active?: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const hasPrefetched = useRef(false);

  function prefetchRoute() {
    if (hasPrefetched.current) return;
    hasPrefetched.current = true;
    router.prefetch(href);
  }

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={className}
      href={href}
      onFocus={prefetchRoute}
      onPointerEnter={prefetchRoute}
      onTouchStart={prefetchRoute}
      prefetch={false}
    >
      {children}
    </Link>
  );
}
