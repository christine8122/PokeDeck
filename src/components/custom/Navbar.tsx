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
  Menu,
  X,
  type LucideIcon,
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
  const [authLoading, setAuthLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;
    let authChanged = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      authChanged = true;
      setLoggedIn(session !== null);
      setAuthLoading(false);
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted || authChanged) return;

      setLoggedIn(!error && data.session !== null);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Close the mobile menu whenever you go to a new page
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close the mobile menu on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // "/builder/12" should still highlight Builder, but "/" only matches Home exactly
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Same list of links for desktop and mobile, so they never get out of sync
  const links = (
    <>
      {navLinks.map((link) => (
        <NavItem
          key={link.href}
          href={link.href}
          label={link.label}
          icon={link.icon}
          active={isActive(link.href)}
        />
      ))}

      {!authLoading &&
        (loggedIn ? (
          <LogoutButton />
        ) : (
          <NavItem
            href="/auth/login"
            label="Login"
            icon={LogIn}
            active={pathname === "/auth/login"}
          />
        ))}
    </>
  );

  return (
    <nav className="relative border-b border-border bg-white">
      <div className="flex h-16 w-full items-center px-4 sm:px-8 lg:h-20">
        {/* PokéDecks Logo */}
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border">
            ⭐
          </span>

          <span className="text-left text-2xl font-bold sm:text-3xl lg:text-4xl">
            PokéDecks
          </span>
        </Link>

        {/* Desktop links: only on large screens */}
        <div className="ml-auto hidden items-center gap-3 lg:flex">
          {links}
        </div>

        {/* Menu button: only on smaller screens */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="ml-auto flex size-11 items-center justify-center rounded-xl hover:bg-gray-100 lg:hidden"
        >
          {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile menu: drops down under the navbar */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full z-50 flex flex-col gap-1 border-b border-border bg-white p-4 shadow-lg lg:hidden"
        >
          {links}
        </div>
      )}
    </nav>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-2 rounded-xl px-3 py-3 text-lg font-medium transition-colors lg:py-2 ${
        active ? "bg-black text-white" : "text-foreground hover:bg-gray-100"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}