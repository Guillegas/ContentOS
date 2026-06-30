import { Button } from "@/components/ui/button";

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <div>
        <h1 className="font-[var(--font-grotesk)] text-xl font-semibold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <form action="/auth/signout" method="post">
        <Button variant="ghost" size="sm" type="submit">Salir</Button>
      </form>
    </header>
  );
}
