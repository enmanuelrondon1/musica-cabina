// src/components/admin/admin-tabs.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin/tratamientos", label: "Tratamientos" },
  { href: "/admin/musica", label: "Música" },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Secciones del panel" className="flex gap-2 border-b border-border pb-4">
      {tabs.map(({ href, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-5 py-2 text-sm transition ${
              active
                ? "bg-sage/20 font-medium text-sage-dark"
                : "text-muted hover:bg-card hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}