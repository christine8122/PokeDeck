import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/collection", label: "Collection" },
  { href: "/builder", label: "Builder" },
  { href: "/login", label: "Login" },
];

export default function Navbar() {
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
      </div>
    </nav>
  );
}