import { SidebarNav } from "@/components/sidebar-nav";

export function AppSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-card/40 p-4 md:block">
      <div className="mb-6 font-[var(--font-grotesk)] text-lg font-bold">ContentOS</div>
      <SidebarNav />
    </aside>
  );
}
