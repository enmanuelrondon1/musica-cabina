// src/components/site-header.tsx

import Link from "next/link";
import { auth, signOut } from "@/auth";
import { NavLinks } from "./nav-links";

export async function SiteHeader() {
  const session = await auth();

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href="/" className="font-serif text-xl">
          Música de cabina
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          <NavLinks />
          {session?.user && (
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full px-4 py-2 text-sm text-terracotta transition hover:bg-card"
              >
                Cerrar sesión
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}