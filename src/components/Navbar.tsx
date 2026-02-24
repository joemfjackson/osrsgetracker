"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Flip Finder" },
  { href: "/watchlist", label: "Watchlist" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-surface sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-gold text-xl font-bold tracking-tight">GE Tracker</span>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-gold/15 text-gold"
                  : "text-muted hover:text-foreground hover:bg-white/5"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto">
          <ItemSearchNav />
        </div>
      </div>
    </nav>
  );
}

function ItemSearchNav() {
  return (
    <Link
      href="/"
      className="text-sm text-muted hover:text-foreground transition-colors"
    >
      Search Items
    </Link>
  );
}
