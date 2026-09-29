"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  LayoutDashboard,
  Library,
  Hammer,
  LogIn,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "../logout-button";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/collection", label: "Collection", icon: Library },
  { href: "/builder", label: "Builder", icon: Hammer },
];

export default function Navbar() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data, error }) => {
      setLoggedIn(!error && data.session !== null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(session !== null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="border-b border-border bg-white">
      <div className="flex h-16 w-full items-center px-8 py-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border">
            ⭐
          </span>
          <span className="text-left text-4xl font-large">PokéDecks</span>
        </Link>

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

          {loggedIn ? (
            <LogoutButton />
          ) : (
            <Link
              href="/auth/login"
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-lg font-medium transition-colors ${
                pathname === "/auth/login"
                  ? "bg-black text-white"
                  : "text-foreground hover:bg-gray-100"
              }`}
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}