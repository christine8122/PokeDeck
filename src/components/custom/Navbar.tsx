"use client";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoutButton } from "../logout-button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/collection", label: "Collection" },
  { href: "/builder", label: "Builder" },
];

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.getSession();

      setLoggedIn(!error && data.session !== null);

      supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_OUT") {
          setLoggedIn(false);
        } else if (event === "SIGNED_IN") {
          setLoggedIn(true);
        }
      });
    };
    checkLoggedIn();
  }, []);

  return (
    <nav className="flex items-center justify-between border-b border-border px-8 py-4">
      <Link href="/" className="text-lg font-bold">
        ⭐ PokéDecks
      </Link>

      <div className="flex items-center gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-foreground hover:text-pink-500 transition-colors"
          >
            {link.label}
          </Link>
        ))}
        {loggedIn && <LogoutButton />}
      </div>
    </nav>
  );
}
