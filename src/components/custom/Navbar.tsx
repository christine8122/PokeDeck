"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  Library,
  Hammer,
  LogIn,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/collection", label: "Collection", icon: Library },
  { href: "/builder", label: "Builder", icon: Hammer },
  { href: "/login", label: "Login", icon: LogIn },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-white">
      <div className="flex h-16 w-full items-center px-8 py-10">

        {/* PokéDecks Logo */}
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border">
            ⭐
          </span>

          {/* Figure out the spacing of the name..*/}
          <span className="text-4xl font-large text-left">
            PokéDecks
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="ml-auto flex items-center gap-3">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-lg font-medium transition-colors ${
                  isActive
                    ? "bg-black text-white"
                    : "text-foreground hover:bg-gray-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

      </div>
    </nav>
  );
}