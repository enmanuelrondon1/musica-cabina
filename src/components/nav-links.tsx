// src/components/nav-links.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Recepción" },
  { href: "/admin", label: "Panel del centro" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map(({ href, label }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm transition ${
              active
                ? "bg-sage-dark text-white"
                : "text-muted hover:bg-card hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}