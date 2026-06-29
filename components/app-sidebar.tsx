"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/calendario", label: "Calendario" },
  { href: "/ideas", label: "Ideas" },
  { href: "/metricas", label: "Métricas" },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 shrink-0 border-r border-border bg-card/40 p-4">
      <div className="mb-6 font-[var(--font-grotesk)] text-lg font-bold">ContentOS</div>
      <nav className="space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm ${active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted"}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
