import { Button } from "@/components/ui/button";
import { MobileSidebar } from "@/components/mobile-sidebar";

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-4 md:px-6">
      <div className="flex items-center gap-2">
        <MobileSidebar />
        <div>
          <h1 className="font-[var(--font-grotesk)] text-lg font-semibold md:text-xl">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <form action="/auth/signout" method="post">
        <Button variant="ghost" size="sm" type="submit">
          Salir
        </Button>
      </form>
    </header>
  );
}
