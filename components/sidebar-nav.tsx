"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/calendario", label: "Calendario" },
  { href: "/ideas", label: "Ideas" },
  { href: "/metricas", label: "Métricas" },
  { href: "/ajustes", label: "Ajustes" },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`block rounded-md px-3 py-2 text-sm ${active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
