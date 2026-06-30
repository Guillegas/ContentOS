"use client";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarNav } from "@/components/sidebar-nav";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Abrir menú"
        className="inline-flex h-9 items-center rounded-md px-2 text-lg hover:bg-muted md:hidden"
      >
        ☰
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-4">
        <SheetTitle className="mb-6 font-[var(--font-grotesk)] text-lg font-bold">
          ContentOS
        </SheetTitle>
        <SidebarNav onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
