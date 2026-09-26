"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/collection", label: "Collection" },
  { href: "/builder", label: "Builder" },
  { href: "/login", label: "Login" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-white">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center px-6">

        {/* PokéDecks Logo */}
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border">
            ⭐
          </span>

          <span className="text-xl font-medium">
            PokéDecks
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="ml-auto flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-black text-white"
                    : "text-foreground hover:text-pink-500"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

      </div>
    </nav>
  );
}