# Responsive móvil + apartado Ajustes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hacer ContentOS usable en móvil (sidebar como cajón, cuadrículas/tablas adaptables, hook de Ideas visible entero) y añadir un apartado `/ajustes` (info de cuenta, cambio de contraseña, cerrar sesión, toggle de tema claro/oscuro).

**Architecture:** App Next.js 16 (App Router) ya existente. El sidebar se parte en un componente de navegación reutilizable usado por la columna fija (desktop) y por un `Sheet` de shadcn (móvil). El tema deja de estar forzado a oscuro y lo gestiona `next-themes`. Ajustes es una ruta nueva bajo el route group `(app)` con un Server Component que lee el usuario y componentes cliente para las acciones.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, shadcn/ui (+ `sheet`), `next-themes`, Supabase (`@supabase/ssr`), Vitest.

## Global Constraints

- **Idioma de la UI:** español. Todo texto de cara al usuario en español.
- **No romper auth:** las rutas siguen protegidas por el middleware existente; no tocar `middleware.ts` ni `lib/supabase/middleware.ts`.
- **No enviar `owner_id`** desde el cliente en ninguna mutación (lo rellena el default `auth.uid()` de la BD).
- **Sin secretos** en cliente salvo `NEXT_PUBLIC_*`.
- **shadcn Select/!** es Base UI: handlers tipados `(value: string | null) => void` cuando aplique.
- **Tema:** oscuro por defecto; el toggle persiste (next-themes usa localStorage).
- **Mínimo de contraseña:** 8 caracteres; las dos entradas deben coincidir.
- La suite existente (**34 tests**) debe seguir verde; los nuevos tests se suman.
- Trabajar en la rama `feature/responsive-ajustes` (ya creada). No cambiar de rama.

---

## File Structure

```
components/
  sidebar-nav.tsx          # (nuevo) lista de enlaces de navegación, reutilizable
  app-sidebar.tsx          # (modif) columna fija en md+, usa SidebarNav
  app-header.tsx           # (modif) + botón ☰ (Sheet trigger) visible en móvil
  mobile-sidebar.tsx       # (nuevo) Sheet con SidebarNav para móvil
  theme-provider.tsx       # (nuevo) wrapper next-themes
  theme-toggle.tsx         # (nuevo) botón claro/oscuro
  ui/sheet.tsx             # (nuevo, generado por shadcn)
  ajustes/
    change-password-form.tsx  # (nuevo) form cliente cambio de contraseña
app/
  layout.tsx               # (modif) ThemeProvider; quitar dark forzado
  (app)/layout.tsx         # (modif) integra MobileSidebar + AppSidebar
  (app)/ajustes/page.tsx   # (nuevo) Server Component: info cuenta + secciones
lib/
  validate-password.ts     # (nuevo) validación pura testeable
tests/
  lib/validate-password.test.ts   # (nuevo)
```

---

## Task 1: Validación de contraseña (función pura, TDD)

**Files:**
- Create: `lib/validate-password.ts`, `tests/lib/validate-password.test.ts`

**Interfaces:**
- Produces: `validatePassword(nueva: string, confirmar: string): string | null` — devuelve un mensaje de error en español, o `null` si es válida.

- [ ] **Step 1: Escribir el test que falla**

```ts
// tests/lib/validate-password.test.ts
import { describe, it, expect } from "vitest";
import { validatePassword } from "@/lib/validate-password";

describe("validatePassword", () => {
  it("rechaza menos de 8 caracteres", () => {
    expect(validatePassword("corta1", "corta1")).toMatch(/8 caracteres/);
  });
  it("rechaza si no coinciden", () => {
    expect(validatePassword("contraseña1", "contraseña2")).toMatch(/coinciden/);
  });
  it("acepta una contraseña válida y coincidente", () => {
    expect(validatePassword("Guille1234", "Guille1234")).toBeNull();
  });
  it("rechaza vacía", () => {
    expect(validatePassword("", "")).toMatch(/8 caracteres/);
  });
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npm test -- validate-password`
Expected: FAIL — módulo no encontrado.

- [ ] **Step 3: Implementar `lib/validate-password.ts`**

```ts
export function validatePassword(nueva: string, confirmar: string): string | null {
  if (nueva.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (nueva !== confirmar) return "Las contraseñas no coinciden.";
  return null;
}
```

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `npm test -- validate-password`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/validate-password.ts tests/lib/validate-password.test.ts
git commit -m "feat: validación de contraseña (pura, testeada)"
```

---

## Task 2: next-themes — provider y dejar de forzar oscuro

**Files:**
- Create: `components/theme-provider.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces: `<ThemeProvider>` (client) que envuelve la app; el tema lo gestiona next-themes con `defaultTheme="dark"`, `attribute="class"`.

- [ ] **Step 1: Instalar next-themes**

```bash
npm install next-themes
```

- [ ] **Step 2: Crear `components/theme-provider.tsx`**

```tsx
"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

- [ ] **Step 3: Modificar `app/layout.tsx`**

Quitar la clase `dark` forzada del `<html>` y añadir `suppressHydrationWarning`; envolver el `children` (y el `<Toaster />`) con `ThemeProvider`. El `<html>` mantiene `lang="es"` y las variables de fuentes. Resultado:

```tsx
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });

export const metadata: Metadata = { title: "ContentOS", description: "OS de tu marca personal" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${grotesk.variable}`}>
      <body className="font-[var(--font-inter)] antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

> Nota: `enableSystem={false}` para que el toggle controle claro/oscuro explícitamente y "dark" siga siendo el arranque por defecto.

- [ ] **Step 4: Verificar build/arranque**

Run: `npx tsc --noEmit` (clean) y `npm run dev`, abrir `http://localhost:3000/login`.
Expected: la app sigue cargando en **oscuro** por defecto, sin parpadeo ni errores de hidratación. Ctrl-C.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx components/theme-provider.tsx package.json package-lock.json
git commit -m "feat(tema): integrar next-themes (oscuro por defecto, sin forzar)"
```

---

## Task 3: Toggle de tema

**Files:**
- Create: `components/theme-toggle.tsx`

**Interfaces:**
- Consumes: `useTheme` de next-themes.
- Produces: `<ThemeToggle />` — botón que alterna entre "light" y "dark".

- [ ] **Step 1: Crear `components/theme-toggle.tsx`**

```tsx
"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null; // evita desajuste de hidratación

  const isDark = theme === "dark";
  return (
    <Button variant="outline" size="sm" onClick={() => setTheme(isDark ? "light" : "dark")}>
      {isDark ? "☀️ Tema claro" : "🌙 Tema oscuro"}
    </Button>
  );
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add components/theme-toggle.tsx
git commit -m "feat(tema): botón de alternar claro/oscuro"
```

---

## Task 4: SidebarNav reutilizable + sidebar desktop

**Files:**
- Create: `components/sidebar-nav.tsx`
- Modify: `components/app-sidebar.tsx`

**Interfaces:**
- Produces:
  - `NAV_ITEMS: { href: string; label: string }[]` exportado desde `components/sidebar-nav.tsx`.
  - `<SidebarNav onNavigate?: () => void />` — los enlaces; si se pasa `onNavigate`, se llama al hacer clic (para cerrar el cajón en móvil).
  - `<AppSidebar />` sigue siendo la columna fija (solo visible en `md+`).

- [ ] **Step 1: Crear `components/sidebar-nav.tsx`**

```tsx
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
```

- [ ] **Step 2: Reescribir `components/app-sidebar.tsx`** para usar `SidebarNav` y ocultarse en móvil

```tsx
import { SidebarNav } from "@/components/sidebar-nav";

export function AppSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-card/40 p-4 md:block">
      <div className="mb-6 font-[var(--font-grotesk)] text-lg font-bold">ContentOS</div>
      <SidebarNav />
    </aside>
  );
}
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit` (clean). `npm run dev`, en escritorio se ve el sidebar con 5 enlaces (incluido Ajustes) y el enlace activo se resalta. Ctrl-C.

- [ ] **Step 4: Commit**

```bash
git add components/sidebar-nav.tsx components/app-sidebar.tsx
git commit -m "feat(nav): SidebarNav reutilizable + Ajustes; sidebar oculto en móvil"
```

---

## Task 5: Cajón móvil (Sheet) + botón ☰ en la cabecera

**Files:**
- Create: `components/ui/sheet.tsx` (generado), `components/mobile-sidebar.tsx`
- Modify: `components/app-header.tsx`

**Interfaces:**
- Consumes: `SidebarNav` (Task 4), shadcn `Sheet`.
- Produces: `<MobileSidebar />` — botón ☰ (solo `md:hidden`) que abre un `Sheet` lateral con `SidebarNav`; al navegar, el Sheet se cierra. Se renderiza dentro de `AppHeader`.

- [ ] **Step 1: Añadir el componente sheet de shadcn**

```bash
npx shadcn@latest add sheet
```

- [ ] **Step 2: Crear `components/mobile-sidebar.tsx`**

```tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetTrigger, SheetTitle,
} from "@/components/ui/sheet";
import { SidebarNav } from "@/components/sidebar-nav";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden" aria-label="Abrir menú">
          ☰
        </Button>
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
```

- [ ] **Step 3: Modificar `components/app-header.tsx`** para incluir el botón ☰ a la izquierda del título

```tsx
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
        <Button variant="ghost" size="sm" type="submit">Salir</Button>
      </form>
    </header>
  );
}
```

- [ ] **Step 4: Verificar en móvil**

Run: `npm run dev`. En el navegador, modo responsive (~375px): el sidebar fijo desaparece, aparece ☰; al pulsarlo se abre el cajón con los 5 enlaces; al pulsar un enlace navega y el cajón se cierra. En escritorio el ☰ no se ve. Ctrl-C.

- [ ] **Step 5: Commit**

```bash
git add components/ui/sheet.tsx components/mobile-sidebar.tsx components/app-header.tsx
git commit -m "feat(nav): cajón lateral en móvil (Sheet) + botón ☰ en cabecera"
```

---

## Task 6: Apartado Ajustes (página + cambio de contraseña)

**Files:**
- Create: `app/(app)/ajustes/page.tsx`, `components/ajustes/change-password-form.tsx`

**Interfaces:**
- Consumes: `createClient` de `lib/supabase/server` (server), `validatePassword` (Task 1), `ThemeToggle` (Task 3), cliente de navegador `lib/supabase/client`.
- Produces: ruta `/ajustes` con: Card de cuenta (email, alta, id), `<ChangePasswordForm />`, botón "Cerrar sesión" (POST a `/auth/signout`), `<ThemeToggle />`.

- [ ] **Step 1: Crear `components/ajustes/change-password-form.tsx`**

```tsx
"use client";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { validatePassword } from "@/lib/validate-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const error = validatePassword(nueva, confirmar);
    if (error) { toast.error(error); return; }
    setSaving(true);
    const supabase = createClient();
    const { error: sbError } = await supabase.auth.updateUser({ password: nueva });
    setSaving(false);
    if (sbError) { toast.error(sbError.message); return; }
    toast.success("Contraseña actualizada");
    setNueva("");
    setConfirmar("");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="nueva">Nueva contraseña</Label>
        <Input id="nueva" type="password" value={nueva} onChange={(e) => setNueva(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmar">Confirmar contraseña</Label>
        <Input id="confirmar" type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
      </div>
      <Button type="submit" disabled={saving}>{saving ? "Guardando…" : "Cambiar contraseña"}</Button>
    </form>
  );
}
```

- [ ] **Step 2: Crear `app/(app)/ajustes/page.tsx`**

```tsx
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/ajustes/change-password-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AjustesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const alta = user?.created_at ? new Date(user.created_at).toLocaleDateString("es-ES") : "—";

  return (
    <>
      <AppHeader title="Ajustes" subtitle="Tu cuenta y preferencias" />
      <div className="space-y-6 p-4 md:p-6">
        <Card>
          <CardHeader><CardTitle>Tu cuenta</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Email:</span> {user?.email ?? "—"}</p>
            <p><span className="text-muted-foreground">Alta:</span> {alta}</p>
            <p className="break-all"><span className="text-muted-foreground">ID:</span> {user?.id ?? "—"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Cambiar contraseña</CardTitle></CardHeader>
          <CardContent><ChangePasswordForm /></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Preferencias</CardTitle></CardHeader>
          <CardContent><ThemeToggle /></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Sesión</CardTitle></CardHeader>
          <CardContent>
            <form action="/auth/signout" method="post">
              <Button variant="outline" type="submit">Cerrar sesión</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Verificar end-to-end**

Run: `npx tsc --noEmit` (clean), `npm test` (34/34 + el de validate-password). `npm run dev`, login con owner (`guilleandumarti@gmail.com` / `Guille1234`), ir a `/ajustes`: se ve email/alta/id; cambiar la contraseña a una válida muestra "Contraseña actualizada" (luego volver a dejarla en `Guille1234`); el toggle alterna claro/oscuro y persiste al recargar; "Cerrar sesión" lleva a `/login`. Ctrl-C.

- [ ] **Step 4: Commit**

```bash
git add "app/(app)/ajustes/page.tsx" components/ajustes/change-password-form.tsx
git commit -m "feat(ajustes): cuenta, cambio de contraseña, tema y cerrar sesión"
```

---

## Task 7: Integrar el cajón en el layout y responsive de páginas

**Files:**
- Modify: `app/(app)/layout.tsx`, `app/(app)/page.tsx` (dashboard-client si aplica), `app/(app)/ideas/ideas-client.tsx`, `app/(app)/calendario/calendario-client.tsx`, `app/(app)/metricas/metricas-client.tsx`

**Interfaces:**
- Consumes: `AppSidebar` (ya oculto en móvil), `AppHeader` (ya incluye el ☰).
- Produces: cuadrículas que apilan en móvil y tablas con scroll horizontal; el `MobileSidebar` ya vive en el header así que el layout no necesita cambios estructurales más allá de confirmar el flex.

> El `AppHeader` ya renderiza el `MobileSidebar`, y `AppSidebar` ya es `hidden md:block`. Por tanto el layout actual (`flex h-screen` + sidebar + columna de contenido) ya funciona: en móvil solo se ve la columna de contenido con su header. Esta tarea ajusta las **clases responsive del contenido**.

- [ ] **Step 1: KPIs del Dashboard apilan en móvil**

En `app/(app)/page.tsx` o `dashboard-client.tsx`, localizar la cuadrícula de KPI Cards y asegurar que usa:
`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4`
(y las cuadrículas de gráficas: `grid grid-cols-1 gap-4 lg:grid-cols-2`). Si ya estuvieran así, dejarlas.

- [ ] **Step 2: Tablas con scroll horizontal**

En `ideas-client.tsx`, `calendario-client.tsx` y `metricas-client.tsx`, envolver cada `<Table>` (o su contenedor) con un `div` de scroll:

```tsx
<div className="w-full overflow-x-auto">
  <Table>{/* ... */}</Table>
</div>
```

- [ ] **Step 3: Rejilla del calendario desplazable en móvil**

En `calendario-client.tsx`, al contenedor de la cuadrícula de 7 columnas añadir un wrapper `overflow-x-auto` y a la cuadrícula `min-w-[640px]` para que en móvil se pueda desplazar en horizontal sin deformarse:

```tsx
<div className="overflow-x-auto">
  <div className="grid min-w-[640px] grid-cols-7 gap-1">{/* días */}</div>
</div>
```

- [ ] **Step 4: Paddings de página a `p-4 md:p-6`**

En las páginas que usen `className="p-6"` (`ideas/page.tsx`, `calendario/page.tsx`, `metricas/page.tsx`, `page.tsx` del dashboard), cambiar a `p-4 md:p-6`. (Ajustes ya nace con `p-4 md:p-6`.)

- [ ] **Step 5: Verificar responsive**

Run: `npx tsc --noEmit` (clean). `npm run dev`, en modo responsive ~375px revisar Dashboard (KPIs en una columna), Ideas/Métricas (tablas hacen scroll, no rompen), Calendario (rejilla desplazable). En escritorio todo igual que antes. Ctrl-C.

- [ ] **Step 6: Commit**

```bash
git add "app/(app)"
git commit -m "feat(responsive): cuadrículas apilables, tablas con scroll y calendario desplazable en móvil"
```

---

## Task 8: Hook completo en la tabla de Ideas

**Files:**
- Modify: `app/(app)/ideas/ideas-client.tsx`

**Interfaces:**
- Consumes: la tabla de ideas existente.
- Produces: la celda del hook muestra el texto entero (con saltos de línea), sin truncar a una línea.

- [ ] **Step 1: Localizar la celda del hook**

En `ideas-client.tsx`, buscar la `<TableCell>` que renderiza `idea.hook`. Probablemente tenga clases de truncado (`truncate`, `max-w-[...]`, `line-clamp-1`, `whitespace-nowrap`).

- [ ] **Step 2: Mostrar el hook entero**

Sustituir esa celda por una que permita el texto completo con saltos de línea y un ancho acotado pero con alto flexible:

```tsx
<TableCell className="max-w-xs whitespace-pre-line align-top text-sm text-muted-foreground">
  {idea.hook}
</TableCell>
```

(Quitar cualquier `truncate` / `line-clamp` / `whitespace-nowrap` previo de esa celda. `max-w-xs` evita que una fila empuje la tabla a lo ancho; `whitespace-pre-line` respeta los saltos; `align-top` alinea arriba al crecer la fila.)

- [ ] **Step 3: Verificar**

Run: `npm run dev`, ir a `/ideas` con el owner. Las ideas con hook largo muestran **todo** el texto (varias líneas), no una línea cortada con puntos suspensivos. Ctrl-C.

- [ ] **Step 4: Commit**

```bash
git add "app/(app)/ideas/ideas-client.tsx"
git commit -m "feat(ideas): mostrar el hook completo en la tabla (sin truncar)"
```

---

## Self-Review (cobertura del spec)

- **Sidebar como cajón en móvil + ☰** → Tasks 4, 5. ✓
- **SidebarNav reutilizable (sin duplicar)** → Task 4. ✓
- **Cuadrículas apilan en móvil** → Task 7 (Step 1). ✓
- **Tablas con scroll horizontal** → Task 7 (Step 2). ✓
- **Calendario desplazable** → Task 7 (Step 3). ✓
- **Paddings p-4 md:p-6** → Task 7 (Step 4). ✓
- **Hook completo en Ideas** → Task 8. ✓
- **Ruta /ajustes + enlace en nav** → Tasks 4 (enlace), 6 (página). ✓
- **Info de cuenta (email/alta/id, solo lectura)** → Task 6. ✓
- **Cambiar contraseña (validación 8 + coincidencia, updateUser)** → Tasks 1, 6. ✓
- **Cerrar sesión dentro del apartado** → Task 6. ✓
- **Toggle de tema claro/oscuro (next-themes, persiste), sin forzar dark** → Tasks 2, 3, 6. ✓
- **Pruebas:** unitaria de validación (Task 1) + verificación visual/e2e en cada tarea de UI. ✓
- **No tocar el middleware de auth** → respetado (ninguna tarea lo modifica). ✓

Sin placeholders; las firmas (`validatePassword`, `NAV_ITEMS`, `SidebarNav`, `ThemeToggle`, `ChangePasswordForm`) son consistentes entre tareas.
