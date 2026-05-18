"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "../hooks/useSession";

const links = [
  { href: "/", label: "Home" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
  { href: "/notes", label: "Notes" },
  { href: "/posts", label: "Posts" },
  { href: "/admin", label: "Admin Management" },
];

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, logout } = useSession();

  return (
    <nav className="border-b border-slate-800 bg-slate-950 px-6 py-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-semibold text-slate-100">Secure Notes</p>
          <p className="text-xs text-slate-400">
            {currentUser ? `${currentUser.email} · ${currentUser.role}` : "Not signed in"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`border px-3 py-2 text-sm font-medium ${
                  active
                    ? "border-cyan-400 bg-cyan-400 text-slate-950"
                    : "border-slate-700 bg-slate-900 text-slate-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {currentUser && (
            <button
              className="border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100"
              onClick={logout}
              type="button"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
