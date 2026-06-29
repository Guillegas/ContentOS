# ContentOS Fase 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar ContentOS de un único `index.html` (HTML/CSS/JS) a una app Next.js + Supabase con autenticación, manteniendo paridad funcional y dejando la arquitectura lista para automatizar (fases 2-3).

**Architecture:** Next.js (App Router) + React + TypeScript en Vercel. Supabase como Postgres + Auth. Acceso a datos en `lib/data` (módulo por entidad), UI con shadcn/ui + Tailwind, gráficas con Recharts. Rutas protegidas por middleware de Supabase Auth y RLS por `owner_id = auth.uid()`.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, `@supabase/ssr`, `@supabase/supabase-js`, Recharts, Vitest + React Testing Library. Node 24 / npm.

## Global Constraints

- **Idioma de la UI:** español. Todo texto de cara al usuario en español.
- **Pilares de contenido (valores exactos):** `Tech` (cian), `Emprendimiento` (violeta), `Lifestyle` (rosa).
- **Plataformas (valores exactos):** `TikTok`, `Instagram`, `Ambas`.
- **Formatos (valores exactos):** `Reel`, `Carrusel`, `Story`, `Foto`.
- **Estados de post (valores exactos):** `Idea`, `Grabado`, `Editado`, `Publicado`.
- **Prioridades de idea (valores exactos):** `Alta`, `Media`, `Baja`.
- **Tema:** oscuro por defecto, estética SaaS minimalista (coherente con la app actual).
- **Secretos:** ninguna clave en el cliente salvo `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. La service role key solo en entorno servidor / scripts, nunca en git.
- **Proyecto Supabase existente:** ref `tkngsutdazytpnwpfysh`. No crear uno nuevo.
- **Un solo dueño:** herramienta personal monousuario. Sin multi-tenant ni roles.

---

## File Structure

```
package.json, tsconfig.json, next.config.ts, tailwind.config.ts, components.json
.env.local                      # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
.env.example                    # mismas claves sin valores
middleware.ts                   # refresco de sesión + protección de rutas
app/
  layout.tsx                    # html/body, fuentes, tema oscuro, Toaster
  globals.css                   # Tailwind + tokens de color de pilares
  login/page.tsx                # login con Supabase Auth (email + password)
  (app)/layout.tsx              # shell autenticado: sidebar + header
  (app)/page.tsx                # Dashboard
  (app)/calendario/page.tsx
  (app)/ideas/page.tsx
  (app)/metricas/page.tsx
components/
  ui/                           # shadcn/ui generado
  app-sidebar.tsx, app-header.tsx
  posts/post-form.tsx, post-dialog.tsx
  ideas/idea-form.tsx
  metricas/metrica-form.tsx, objetivo-form.tsx
  charts/                       # wrappers Recharts
lib/
  constants.ts                  # PILARES, PLATAFORMAS, FORMATOS, ESTADOS, PRIORIDADES, colores
  supabase/server.ts            # createClient() server (cookies)
  supabase/client.ts            # createClient() browser
  supabase/types.ts             # tipos generados de la BD
  data/posts.ts, ideas.ts, metricas.ts, objetivos.ts
  data/types.ts                 # tipos de dominio (Post, Idea, Metrica, Objetivo)
supabase/
  migrations/0001_owner_and_rls.sql
scripts/
  backfill-owner.ts             # asigna owner_id a filas existentes
tests/
  lib/data/*.test.ts
  lib/constants.test.ts
vitest.config.ts, vitest.setup.ts
```

---

## Task 1: Scaffold del proyecto Next.js

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.gitignore` (modificar)
- Modify: `.gitignore`

**Interfaces:**
- Produces: proyecto Next.js arrancable con `npm run dev`.

> Nota: el repo ya tiene `index.html`, `README.md`, `supabase-setup.sql`. No los borres todavía: la app nueva convive con ellos hasta verificar paridad (Task 12). Scaffold en la raíz del repo.

- [ ] **Step 1: Crear la app Next.js en un directorio temporal y moverla a la raíz**

```bash
npx create-next-app@latest contentos-next --ts --app --tailwind --eslint --src-dir=false --import-alias "@/*" --no-turbopack --use-npm
# Mover el contenido generado a la raíz del repo conservando index.html/README/supabase-setup.sql/.git
rsync -a --exclude='.git' contentos-next/ ./
rm -rf contentos-next
```

- [ ] **Step 2: Añadir entradas a `.gitignore`**

Asegura que `.gitignore` contiene (algunas ya existen):

```
node_modules/
.next/
.env
.env.local
.DS_Store
coverage/
```

- [ ] **Step 3: Arrancar el dev server y verificar**

Run: `npm run dev`
Expected: arranca en `http://localhost:3000` y sirve la página por defecto de Next.js sin errores en consola. Detener con Ctrl-C.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js (App Router + TS + Tailwind)"
```

---

## Task 2: Tooling de tests (Vitest)

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`, `tests/lib/constants.test.ts`, `lib/constants.ts`
- Modify: `package.json` (script `test`)

**Interfaces:**
- Produces: `lib/constants.ts` exportando `PILARES`, `PLATAFORMAS`, `FORMATOS`, `ESTADOS`, `PRIORIDADES`, `PILAR_COLOR`. Comando `npm test`.

- [ ] **Step 1: Instalar dependencias de test**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

- [ ] **Step 2: Crear `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
```

- [ ] **Step 3: Crear `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom";
```

- [ ] **Step 4: Añadir script de test a `package.json`**

En `"scripts"` añade: `"test": "vitest run"`.

- [ ] **Step 5: Escribir el test que falla para las constantes**

```ts
// tests/lib/constants.test.ts
import { describe, it, expect } from "vitest";
import { PILARES, PLATAFORMAS, FORMATOS, ESTADOS, PRIORIDADES, PILAR_COLOR } from "@/lib/constants";

describe("constants", () => {
  it("define los pilares exactos", () => {
    expect(PILARES).toEqual(["Tech", "Emprendimiento", "Lifestyle"]);
  });
  it("define plataformas, formatos, estados y prioridades", () => {
    expect(PLATAFORMAS).toEqual(["TikTok", "Instagram", "Ambas"]);
    expect(FORMATOS).toEqual(["Reel", "Carrusel", "Story", "Foto"]);
    expect(ESTADOS).toEqual(["Idea", "Grabado", "Editado", "Publicado"]);
    expect(PRIORIDADES).toEqual(["Alta", "Media", "Baja"]);
  });
  it("asigna un color por pilar", () => {
    expect(PILAR_COLOR.Tech).toMatch(/^#|^hsl|^rgb/);
    expect(Object.keys(PILAR_COLOR)).toEqual(["Tech", "Emprendimiento", "Lifestyle"]);
  });
});
```

- [ ] **Step 6: Ejecutar el test y verificar que falla**

Run: `npm test`
Expected: FAIL — `Cannot find module '@/lib/constants'`.

- [ ] **Step 7: Implementar `lib/constants.ts`**

```ts
export const PILARES = ["Tech", "Emprendimiento", "Lifestyle"] as const;
export const PLATAFORMAS = ["TikTok", "Instagram", "Ambas"] as const;
export const FORMATOS = ["Reel", "Carrusel", "Story", "Foto"] as const;
export const ESTADOS = ["Idea", "Grabado", "Editado", "Publicado"] as const;
export const PRIORIDADES = ["Alta", "Media", "Baja"] as const;

export type Pilar = (typeof PILARES)[number];
export type Plataforma = (typeof PLATAFORMAS)[number];
export type Formato = (typeof FORMATOS)[number];
export type Estado = (typeof ESTADOS)[number];
export type Prioridad = (typeof PRIORIDADES)[number];

export const PILAR_COLOR: Record<Pilar, string> = {
  Tech: "#22d3ee",            // cian
  Emprendimiento: "#a78bfa",  // violeta
  Lifestyle: "#f472b6",       // rosa
};
```

- [ ] **Step 8: Ejecutar el test y verificar que pasa**

Run: `npm test`
Expected: PASS (3 tests).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "test: vitest + constantes de dominio"
```

---

## Task 3: Clientes Supabase y variables de entorno

**Files:**
- Create: `lib/supabase/server.ts`, `lib/supabase/client.ts`, `.env.local`, `.env.example`
- Modify: ninguno

**Interfaces:**
- Produces:
  - `createClient()` (server) en `lib/supabase/server.ts` → `Promise<SupabaseClient>` usando cookies.
  - `createClient()` (browser) en `lib/supabase/client.ts` → `SupabaseClient`.

- [ ] **Step 1: Instalar dependencias de Supabase**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Crear `.env.local` con las credenciales reales**

```
NEXT_PUBLIC_SUPABASE_URL=https://tkngsutdazytpnwpfysh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrbmdzdXRkYXp5dHBud3BmeXNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MDI5NDcsImV4cCI6MjA5Nzk3ODk0N30.KL2pXRkXe5xYVcavLv_MauPXTDxvfbZzEu2H-d5Sqh4
SUPABASE_SERVICE_ROLE_KEY=  # rellenar desde Supabase → Project Settings → API (NO commitear)
```

- [ ] **Step 3: Crear `.env.example` (sin valores)**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- [ ] **Step 4: Crear cliente de servidor `lib/supabase/server.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Llamado desde un Server Component; el middleware refresca la sesión.
          }
        },
      },
    },
  );
}
```

- [ ] **Step 5: Crear cliente de navegador `lib/supabase/client.ts`**

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 6: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sin errores de tipos.

- [ ] **Step 7: Commit**

```bash
git add lib/supabase .env.example
git commit -m "feat: clientes Supabase server/browser + env example"
```

---

## Task 4: Migración de BD — `owner_id` y RLS endurecido

**Files:**
- Create: `supabase/migrations/0001_owner_and_rls.sql`
- Modify: ninguno

**Interfaces:**
- Produces: columna `owner_id uuid` en `posts`, `ideas`, `metricas`, `objetivos`; políticas RLS que exigen `owner_id = auth.uid()`.

> Esta migración se aplica desde el SQL Editor de Supabase (o `supabase db push` si el CLI está enlazado). No se ejecuta en CI.

- [ ] **Step 1: Escribir la migración SQL**

```sql
-- supabase/migrations/0001_owner_and_rls.sql
-- Añade owner_id y endurece RLS: cada fila pertenece a un usuario autenticado.

alter table posts     add column if not exists owner_id uuid references auth.users(id) default auth.uid();
alter table ideas     add column if not exists owner_id uuid references auth.users(id) default auth.uid();
alter table metricas  add column if not exists owner_id uuid references auth.users(id) default auth.uid();
alter table objetivos add column if not exists owner_id uuid references auth.users(id) default auth.uid();

-- Eliminar las políticas públicas previas y crear políticas por dueño.
do $$
declare t text;
begin
  foreach t in array array['posts','ideas','metricas','objetivos'] loop
    execute format('drop policy if exists "public_all_%1$s" on %1$s;', t);
    execute format('drop policy if exists "owner_all_%1$s" on %1$s;', t);
    execute format(
      'create policy "owner_all_%1$s" on %1$s
         for all
         to authenticated
         using (owner_id = auth.uid())
         with check (owner_id = auth.uid());', t);
  end loop;
end $$;
```

- [ ] **Step 2: Aplicar la migración en Supabase**

Manual: abrir Supabase → SQL Editor → New query → pegar el contenido de `0001_owner_and_rls.sql` → Run.
Expected: "Success. No rows returned".

- [ ] **Step 3: Verificar que RLS bloquea acceso anónimo**

Manual: en SQL Editor, ejecutar `select * from posts;` como rol `anon` (botón de rol o vía la API con la anon key sin sesión).
Expected: 0 filas (RLS ya no permite acceso anónimo).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0001_owner_and_rls.sql
git commit -m "feat(db): owner_id + RLS por dueño"
```

---

## Task 5: Tipos de dominio y de BD

**Files:**
- Create: `lib/data/types.ts`, `lib/supabase/types.ts`
- Modify: ninguno

**Interfaces:**
- Produces: tipos `Post`, `Idea`, `Metrica`, `Objetivo` y sus variantes `*Insert` en `lib/data/types.ts`.

- [ ] **Step 1: Definir los tipos de dominio `lib/data/types.ts`**

```ts
import type { Pilar, Plataforma, Formato, Estado, Prioridad } from "@/lib/constants";

export interface Post {
  id: string;
  fecha: string;          // YYYY-MM-DD
  plataforma: Plataforma;
  pilar: Pilar;
  formato: Formato;
  titulo: string;
  estado: Estado;
  enlace: string | null;
  created_at: string;
}
export type PostInsert = Omit<Post, "id" | "created_at">;

export interface Idea {
  id: string;
  fecha: string;
  pilar: Pilar;
  titulo: string;
  hook: string | null;
  prioridad: Prioridad;
  usada: boolean;
  created_at: string;
}
export type IdeaInsert = Omit<Idea, "id" | "created_at">;

export interface Metrica {
  id: string;
  fecha: string;
  titulo: string;
  plataforma: Plataforma;
  pilar: Pilar;
  reproducciones: number;
  likes: number;
  comentarios: number;
  guardados: number;
  seguidores_ganados: number;
  puntuacion: number;     // 1..5
  notas: string | null;
  created_at: string;
}
export type MetricaInsert = Omit<Metrica, "id" | "created_at">;

export interface Objetivo {
  id: string;
  mes: string;            // YYYY-MM
  tiktok_inicio: number;
  tiktok_fin: number;
  ig_inicio: number;
  ig_fin: number;
  posts_objetivo: number;
  posts_publicados: number;
  mejor_post: string | null;
  aprendizajes: string | null;
  created_at: string;
}
export type ObjetivoInsert = Omit<Objetivo, "id" | "created_at">;
```

- [ ] **Step 2: Crear `lib/supabase/types.ts` (placeholder de tipos generados)**

```ts
// Tipos de la base de datos. Regenerar con:
//   npx supabase gen types typescript --project-id tkngsutdazytpnwpfysh > lib/supabase/types.ts
// Hasta entonces se usan los tipos de dominio en lib/data/types.ts.
export type Database = unknown;
```

- [ ] **Step 3: Verificar compilación**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add lib/data/types.ts lib/supabase/types.ts
git commit -m "feat: tipos de dominio y placeholder de tipos de BD"
```

---

## Task 6: Capa de datos `lib/data/posts.ts` (con tests)

**Files:**
- Create: `lib/data/posts.ts`, `tests/lib/data/posts.test.ts`
- Modify: ninguno

**Interfaces:**
- Consumes: `createClient()` de `lib/supabase/server.ts`, tipos de `lib/data/types.ts`.
- Produces:
  - `listPosts(): Promise<Post[]>`
  - `createPost(input: PostInsert): Promise<Post>`
  - `updatePost(id: string, patch: Partial<PostInsert>): Promise<Post>`
  - `deletePost(id: string): Promise<void>`

> Patrón a replicar en Tasks 7-8 para ideas, metricas, objetivos. El cliente Supabase se mockea en los tests; no se toca la BD real.

- [ ] **Step 1: Escribir el test que falla**

```ts
// tests/lib/data/posts.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const order = vi.fn();
const select = vi.fn(() => ({ order }));
const single = vi.fn();
const insertSelect = vi.fn(() => ({ single }));
const insert = vi.fn(() => ({ select: insertSelect }));
const from = vi.fn(() => ({ select, insert }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from })),
}));

import { listPosts, createPost } from "@/lib/data/posts";

beforeEach(() => vi.clearAllMocks());

describe("posts data layer", () => {
  it("listPosts devuelve los posts ordenados por fecha", async () => {
    order.mockResolvedValue({ data: [{ id: "1", titulo: "x" }], error: null });
    const result = await listPosts();
    expect(from).toHaveBeenCalledWith("posts");
    expect(order).toHaveBeenCalledWith("fecha", { ascending: true });
    expect(result).toEqual([{ id: "1", titulo: "x" }]);
  });

  it("createPost inserta y devuelve la fila creada", async () => {
    single.mockResolvedValue({ data: { id: "2", titulo: "nuevo" }, error: null });
    const result = await createPost({
      fecha: "2026-07-01", plataforma: "TikTok", pilar: "Tech",
      formato: "Reel", titulo: "nuevo", estado: "Idea", enlace: null, owner_id: "",
    } as never);
    expect(insert).toHaveBeenCalled();
    expect(result).toEqual({ id: "2", titulo: "nuevo" });
  });

  it("createPost lanza si Supabase devuelve error", async () => {
    single.mockResolvedValue({ data: null, error: { message: "boom" } });
    await expect(createPost({} as never)).rejects.toThrow("boom");
  });
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npm test -- posts`
Expected: FAIL — `Cannot find module '@/lib/data/posts'`.

- [ ] **Step 3: Implementar `lib/data/posts.ts`**

```ts
import { createClient } from "@/lib/supabase/server";
import type { Post, PostInsert } from "@/lib/data/types";

export async function listPosts(): Promise<Post[]> {
  const sb = await createClient();
  const { data, error } = await sb.from("posts").select("*").order("fecha", { ascending: true });
  if (error) throw new Error(error.message);
  return data as Post[];
}

export async function createPost(input: PostInsert): Promise<Post> {
  const sb = await createClient();
  const { data, error } = await sb.from("posts").insert(input).select().single();
  if (error) throw new Error(error.message);
  return data as Post;
}

export async function updatePost(id: string, patch: Partial<PostInsert>): Promise<Post> {
  const sb = await createClient();
  const { data, error } = await sb.from("posts").update(patch).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data as Post;
}

export async function deletePost(id: string): Promise<void> {
  const sb = await createClient();
  const { error } = await sb.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
```

> Nota: `PostInsert` incluye `owner_id`, pero al insertar conviene omitirlo y dejar que el default `auth.uid()` lo rellene. Ajusta `PostInsert` para hacer `owner_id` opcional si lo prefieres; el test pasa `owner_id: ""` solo como relleno y no lo verifica.

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `npm test -- posts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/data/posts.ts tests/lib/data/posts.test.ts
git commit -m "feat(data): capa de datos de posts + tests"
```

---

## Task 7: Capa de datos `ideas`, `metricas`, `objetivos` (con tests)

**Files:**
- Create: `lib/data/ideas.ts`, `lib/data/metricas.ts`, `lib/data/objetivos.ts`, `tests/lib/data/ideas.test.ts`
- Modify: ninguno

**Interfaces:**
- Produces (mismo patrón que Task 6):
  - ideas: `listIdeas()`, `createIdea()`, `updateIdea()`, `deleteIdea()` (orden: `created_at` desc)
  - metricas: `listMetricas()`, `createMetrica()`, `updateMetrica()`, `deleteMetrica()` (orden: `fecha` asc)
  - objetivos: `listObjetivos()`, `createObjetivo()`, `updateObjetivo()`, `deleteObjetivo()` (orden: `mes` desc)

- [ ] **Step 1: Escribir el test que falla para ideas**

```ts
// tests/lib/data/ideas.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const order = vi.fn();
const select = vi.fn(() => ({ order }));
const from = vi.fn(() => ({ select }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from })),
}));

import { listIdeas } from "@/lib/data/ideas";

beforeEach(() => vi.clearAllMocks());

describe("ideas data layer", () => {
  it("listIdeas ordena por created_at desc", async () => {
    order.mockResolvedValue({ data: [{ id: "1" }], error: null });
    const result = await listIdeas();
    expect(from).toHaveBeenCalledWith("ideas");
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(result).toEqual([{ id: "1" }]);
  });
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npm test -- ideas`
Expected: FAIL — módulo no encontrado.

- [ ] **Step 3: Implementar `lib/data/ideas.ts`**

```ts
import { createClient } from "@/lib/supabase/server";
import type { Idea, IdeaInsert } from "@/lib/data/types";

export async function listIdeas(): Promise<Idea[]> {
  const sb = await createClient();
  const { data, error } = await sb.from("ideas").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Idea[];
}
export async function createIdea(input: IdeaInsert): Promise<Idea> {
  const sb = await createClient();
  const { data, error } = await sb.from("ideas").insert(input).select().single();
  if (error) throw new Error(error.message);
  return data as Idea;
}
export async function updateIdea(id: string, patch: Partial<IdeaInsert>): Promise<Idea> {
  const sb = await createClient();
  const { data, error } = await sb.from("ideas").update(patch).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data as Idea;
}
export async function deleteIdea(id: string): Promise<void> {
  const sb = await createClient();
  const { error } = await sb.from("ideas").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
```

- [ ] **Step 4: Implementar `lib/data/metricas.ts`**

```ts
import { createClient } from "@/lib/supabase/server";
import type { Metrica, MetricaInsert } from "@/lib/data/types";

export async function listMetricas(): Promise<Metrica[]> {
  const sb = await createClient();
  const { data, error } = await sb.from("metricas").select("*").order("fecha", { ascending: true });
  if (error) throw new Error(error.message);
  return data as Metrica[];
}
export async function createMetrica(input: MetricaInsert): Promise<Metrica> {
  const sb = await createClient();
  const { data, error } = await sb.from("metricas").insert(input).select().single();
  if (error) throw new Error(error.message);
  return data as Metrica;
}
export async function updateMetrica(id: string, patch: Partial<MetricaInsert>): Promise<Metrica> {
  const sb = await createClient();
  const { data, error } = await sb.from("metricas").update(patch).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data as Metrica;
}
export async function deleteMetrica(id: string): Promise<void> {
  const sb = await createClient();
  const { error } = await sb.from("metricas").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
```

- [ ] **Step 5: Implementar `lib/data/objetivos.ts`**

```ts
import { createClient } from "@/lib/supabase/server";
import type { Objetivo, ObjetivoInsert } from "@/lib/data/types";

export async function listObjetivos(): Promise<Objetivo[]> {
  const sb = await createClient();
  const { data, error } = await sb.from("objetivos").select("*").order("mes", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Objetivo[];
}
export async function createObjetivo(input: ObjetivoInsert): Promise<Objetivo> {
  const sb = await createClient();
  const { data, error } = await sb.from("objetivos").insert(input).select().single();
  if (error) throw new Error(error.message);
  return data as Objetivo;
}
export async function updateObjetivo(id: string, patch: Partial<ObjetivoInsert>): Promise<Objetivo> {
  const sb = await createClient();
  const { data, error } = await sb.from("objetivos").update(patch).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data as Objetivo;
}
export async function deleteObjetivo(id: string): Promise<void> {
  const sb = await createClient();
  const { error } = await sb.from("objetivos").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
```

- [ ] **Step 6: Ejecutar y verificar que pasa**

Run: `npm test`
Expected: PASS (todos los tests, incluido `ideas`).

- [ ] **Step 7: Commit**

```bash
git add lib/data tests/lib/data/ideas.test.ts
git commit -m "feat(data): capas de ideas, metricas y objetivos"
```

---

## Task 8: shadcn/ui + tema oscuro y fuentes

**Files:**
- Create: `components.json`, `components/ui/*` (generado), `lib/utils.ts` (generado)
- Modify: `app/globals.css`, `app/layout.tsx`, `tailwind.config.ts`

**Interfaces:**
- Produces: componentes base de shadcn instalados (`button`, `card`, `dialog`, `input`, `select`, `table`, `badge`, `sonner`, `label`, `textarea`), tema oscuro por defecto, fuentes Space Grotesk + Inter.

- [ ] **Step 1: Inicializar shadcn/ui**

```bash
npx shadcn@latest init -d
```

(Elige base color slate; el flag `-d` aplica defaults.)

- [ ] **Step 2: Añadir componentes base**

```bash
npx shadcn@latest add button card dialog input select table badge sonner label textarea
```

- [ ] **Step 3: Forzar tema oscuro por defecto en `app/layout.tsx`**

Asegura que `<html lang="es" className="dark">` y que las fuentes Space Grotesk (display) e Inter (body) se cargan vía `next/font/google`. Añade `<Toaster />` de sonner al final del `<body>`.

```tsx
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });

export const metadata: Metadata = { title: "ContentOS", description: "OS de tu marca personal" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`dark ${inter.variable} ${grotesk.variable}`}>
      <body className="font-[var(--font-inter)] antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verificar que arranca**

Run: `npm run dev`
Expected: la página carga en oscuro sin errores. Ctrl-C.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(ui): shadcn/ui + tema oscuro + fuentes"
```

---

## Task 9: Autenticación — login + middleware de protección

**Files:**
- Create: `app/login/page.tsx`, `middleware.ts`, `lib/supabase/middleware.ts`, `app/auth/signout/route.ts`
- Modify: ninguno

**Interfaces:**
- Consumes: clientes Supabase de Task 3.
- Produces: rutas protegidas (todo salvo `/login` redirige a `/login` sin sesión); login con email + password; ruta de logout.

- [ ] **Step 1: Crear el usuario dueño en Supabase (manual)**

Manual: Supabase → Authentication → Users → Add user → email del dueño (`guilleandumarti@gmail.com`) + contraseña. Anota la contraseña.
Expected: usuario creado, con un `id` (uuid) visible.

- [ ] **Step 2: Crear helper de middleware `lib/supabase/middleware.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !request.nextUrl.pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return response;
}
```

- [ ] **Step 3: Crear `middleware.ts` en la raíz**

```ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

- [ ] **Step 4: Crear la página de login `app/login/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle>ContentOS</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
```

- [ ] **Step 5: Crear la ruta de logout `app/auth/signout/route.ts`**

```ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url), { status: 302 });
}
```

- [ ] **Step 6: Verificar protección de rutas**

Run: `npm run dev`, abrir `http://localhost:3000/` sin sesión.
Expected: redirige a `/login`. Tras introducir email+password del usuario creado, redirige a `/` (que aún puede ser la página por defecto). Ctrl-C.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(auth): login email/password + middleware de protección"
```

---

## Task 10: Shell autenticado — layout, sidebar y header

**Files:**
- Create: `app/(app)/layout.tsx`, `components/app-sidebar.tsx`, `components/app-header.tsx`
- Modify: mover la home a `app/(app)/page.tsx` (placeholder dashboard)

**Interfaces:**
- Consumes: ruta de logout `/auth/signout`.
- Produces: layout con sidebar de navegación (Dashboard, Calendario, Ideas, Métricas) y header con título por sección y botón de salir. Las páginas de Task 11-14 viven bajo `app/(app)/`.

- [ ] **Step 1: Crear el sidebar `components/app-sidebar.tsx`**

```tsx
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
```

- [ ] **Step 2: Crear el header `components/app-header.tsx`**

```tsx
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
```

- [ ] **Step 3: Crear el layout autenticado `app/(app)/layout.tsx`**

```tsx
import { AppSidebar } from "@/components/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
```

- [ ] **Step 4: Mover la home a `app/(app)/page.tsx` (placeholder)**

Borra `app/page.tsx` y crea `app/(app)/page.tsx`:

```tsx
import { AppHeader } from "@/components/app-header";

export default function DashboardPage() {
  return (
    <>
      <AppHeader title="Dashboard" subtitle="Resumen general de tu actividad" />
      <div className="p-6">Próximamente.</div>
    </>
  );
}
```

- [ ] **Step 5: Verificar**

Run: `npm run dev`, iniciar sesión.
Expected: se ve el sidebar con 4 enlaces, el header con "Dashboard" y el botón "Salir" funciona (vuelve a `/login`). Ctrl-C.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(ui): shell autenticado con sidebar y header"
```

---

## Task 11: Banco de Ideas (sección completa con CRUD)

**Files:**
- Create: `app/(app)/ideas/page.tsx`, `components/ideas/idea-form.tsx`, `app/(app)/ideas/actions.ts`
- Modify: ninguno

**Interfaces:**
- Consumes: `listIdeas`, `createIdea`, `updateIdea`, `deleteIdea` de `lib/data/ideas.ts`.
- Produces: tabla de ideas filtrable por pilar; crear/editar vía diálogo; marcar usada/no usada; eliminar.

> Empezamos por Ideas porque es la sección más simple (tabla + form) y valida el patrón Server Component + Server Actions que reutilizan las demás.

- [ ] **Step 1: Crear las Server Actions `app/(app)/ideas/actions.ts`**

```ts
"use server";
import { revalidatePath } from "next/cache";
import { createIdea, updateIdea, deleteIdea } from "@/lib/data/ideas";
import type { IdeaInsert } from "@/lib/data/types";

export async function addIdeaAction(input: IdeaInsert) {
  await createIdea(input);
  revalidatePath("/ideas");
}
export async function updateIdeaAction(id: string, patch: Partial<IdeaInsert>) {
  await updateIdea(id, patch);
  revalidatePath("/ideas");
}
export async function deleteIdeaAction(id: string) {
  await deleteIdea(id);
  revalidatePath("/ideas");
}
```

- [ ] **Step 2: Crear el formulario `components/ideas/idea-form.tsx`**

Formulario cliente con campos: `titulo` (Input), `pilar` (Select con `PILARES`), `hook` (Textarea), `prioridad` (Select con `PRIORIDADES`), `fecha` (Input date, default hoy). Al enviar llama a `addIdeaAction` o `updateIdeaAction`. Usa `toast` de sonner para feedback y cierra el diálogo. Marca `usada` como `false` por defecto en creación.

```tsx
"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PILARES, PRIORIDADES } from "@/lib/constants";
import type { Idea, IdeaInsert } from "@/lib/data/types";
import { addIdeaAction, updateIdeaAction } from "@/app/(app)/ideas/actions";

export function IdeaForm({ idea, onDone }: { idea?: Idea; onDone: () => void }) {
  const [titulo, setTitulo] = useState(idea?.titulo ?? "");
  const [pilar, setPilar] = useState(idea?.pilar ?? "Tech");
  const [hook, setHook] = useState(idea?.hook ?? "");
  const [prioridad, setPrioridad] = useState(idea?.prioridad ?? "Media");
  const [fecha, setFecha] = useState(idea?.fecha ?? new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { titulo, pilar, hook, prioridad, fecha, usada: idea?.usada ?? false } as IdeaInsert;
    try {
      if (idea) await updateIdeaAction(idea.id, payload);
      else await addIdeaAction(payload);
      toast.success(idea ? "Idea actualizada" : "Idea guardada");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="titulo">Título</Label>
        <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Pilar</Label>
        <Select value={pilar} onValueChange={(v) => setPilar(v as typeof pilar)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{PILARES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="hook">Hook</Label>
        <Textarea id="hook" value={hook} onChange={(e) => setHook(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Prioridad</Label>
        <Select value={prioridad} onValueChange={(v) => setPrioridad(v as typeof prioridad)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{PRIORIDADES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="fecha">Fecha</Label>
        <Input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </div>
      <Button type="submit" disabled={saving} className="w-full">{saving ? "Guardando…" : "Guardar"}</Button>
    </form>
  );
}
```

- [ ] **Step 3: Crear la página `app/(app)/ideas/page.tsx`**

Server Component que llama a `listIdeas()` y renderiza un cliente con: filtro por pilar (botones `all` + PILARES), tabla (título, pilar como Badge con `PILAR_COLOR`, hook, prioridad, usada con checkbox que llama `updateIdeaAction(id,{usada})`, botones editar/eliminar), y un Dialog con `IdeaForm` para crear/editar. El contador de no usadas se muestra arriba.

```tsx
import { listIdeas } from "@/lib/data/ideas";
import { AppHeader } from "@/components/app-header";
import { IdeasClient } from "./ideas-client";

export default async function IdeasPage() {
  const ideas = await listIdeas();
  return (
    <>
      <AppHeader title="Banco de Ideas" subtitle="Captura y prioriza tus ideas" />
      <div className="p-6"><IdeasClient ideas={ideas} /></div>
    </>
  );
}
```

- [ ] **Step 4: Crear `app/(app)/ideas/ideas-client.tsx`**

Componente cliente con el estado de filtro, el Dialog (usa `Dialog`, `DialogContent`, `DialogTrigger` de shadcn), la `Table` y las acciones. Importa `IdeaForm`, `deleteIdeaAction`, `updateIdeaAction`, `PILARES`, `PILAR_COLOR`. Filtra `ideas` por pilar seleccionado; el botón "Nueva idea" abre el diálogo en modo creación; cada fila tiene editar (abre diálogo con `idea`) y eliminar (llama `deleteIdeaAction`). El checkbox "usada" llama `updateIdeaAction(id, { usada: !idea.usada })`.

- [ ] **Step 5: Verificar CRUD de ideas**

Run: `npm run dev`, iniciar sesión, ir a `/ideas`.
Expected: se listan las ideas existentes (las migradas en Task 15 aún no tienen owner; si la lista sale vacía, es esperado hasta el backfill). Crear una idea nueva la añade a la tabla; editar y eliminar funcionan; el filtro por pilar filtra; marcar usada cambia el estado. Ctrl-C.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: sección Banco de Ideas con CRUD"
```

---

## Task 12: Calendario Editorial (sección completa con CRUD)

**Files:**
- Create: `app/(app)/calendario/page.tsx`, `app/(app)/calendario/calendario-client.tsx`, `app/(app)/calendario/actions.ts`, `components/posts/post-form.tsx`
- Modify: ninguno

**Interfaces:**
- Consumes: `listPosts`, `createPost`, `updatePost`, `deletePost` de `lib/data/posts.ts`.
- Produces: vista mensual navegable; posts por día con color de pilar; clic en día abre diálogo de creación con esa fecha; tabla del mes; CRUD completo.

- [ ] **Step 1: Crear las Server Actions `app/(app)/calendario/actions.ts`**

```ts
"use server";
import { revalidatePath } from "next/cache";
import { createPost, updatePost, deletePost } from "@/lib/data/posts";
import type { PostInsert } from "@/lib/data/types";

export async function addPostAction(input: PostInsert) {
  await createPost(input);
  revalidatePath("/calendario");
  revalidatePath("/");
}
export async function updatePostAction(id: string, patch: Partial<PostInsert>) {
  await updatePost(id, patch);
  revalidatePath("/calendario");
  revalidatePath("/");
}
export async function deletePostAction(id: string) {
  await deletePost(id);
  revalidatePath("/calendario");
  revalidatePath("/");
}
```

- [ ] **Step 2: Crear `components/posts/post-form.tsx`**

Formulario cliente con: `titulo` (Input), `fecha` (date), `plataforma` (Select `PLATAFORMAS`), `pilar` (Select `PILARES`), `formato` (Select `FORMATOS`), `estado` (Select `ESTADOS`), `enlace` (Input url opcional). Mismo patrón que `IdeaForm`: llama `addPostAction`/`updatePostAction`, usa toast, acepta props `post?` y `defaultDate?` y `onDone`.

- [ ] **Step 3: Crear la página `app/(app)/calendario/page.tsx`**

```tsx
import { listPosts } from "@/lib/data/posts";
import { AppHeader } from "@/components/app-header";
import { CalendarioClient } from "./calendario-client";

export default async function CalendarioPage() {
  const posts = await listPosts();
  return (
    <>
      <AppHeader title="Calendario Editorial" subtitle="Planifica y organiza tus publicaciones" />
      <div className="p-6"><CalendarioClient posts={posts} /></div>
    </>
  );
}
```

- [ ] **Step 4: Crear `app/(app)/calendario/calendario-client.tsx`**

Componente cliente que:
- Mantiene `refDate` (primer día del mes mostrado), con botones ‹ y › para navegar mes.
- Renderiza una cuadrícula de 7 columnas (Lun-Dom) con los días del mes; cada día muestra los posts de esa fecha como chips con `PILAR_COLOR[post.pilar]` de fondo y el título truncado.
- Clic en un día abre el `Dialog` con `PostForm` y `defaultDate` = esa fecha.
- Clic en un chip abre el `Dialog` con `PostForm` y `post` para editar (con botón eliminar que llama `deletePostAction`).
- Debajo, una `Table` con los posts del mes mostrado (fecha, título, plataforma, pilar Badge, formato, estado Badge).

Lógica de días del mes (incluir en el componente):

```ts
function diasDelMes(ref: Date): Date[] {
  const year = ref.getFullYear(), month = ref.getMonth();
  const primero = new Date(year, month, 1);
  const offset = (primero.getDay() + 6) % 7; // lunes=0
  const dias: Date[] = [];
  for (let i = 0; i < offset; i++) dias.push(new Date(year, month, i - offset + 1));
  const ultimo = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= ultimo; d++) dias.push(new Date(year, month, d));
  return dias;
}
function ymd(d: Date): string { return d.toISOString().slice(0, 10); }
```

Filtra los posts del mes con `post.fecha.startsWith(`${year}-${String(month+1).padStart(2,"0")}`)`.

- [ ] **Step 5: Verificar CRUD de calendario**

Run: `npm run dev`, ir a `/calendario`.
Expected: se ve la cuadrícula del mes actual; navegar entre meses funciona; clic en un día crea un post en esa fecha; el post aparece como chip con el color de su pilar y en la tabla del mes; editar y eliminar funcionan. Ctrl-C.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: sección Calendario Editorial con CRUD"
```

---

## Task 13: Métricas y Objetivos (sección completa con CRUD + gráficas)

**Files:**
- Create: `app/(app)/metricas/page.tsx`, `app/(app)/metricas/metricas-client.tsx`, `app/(app)/metricas/actions.ts`, `components/metricas/metrica-form.tsx`, `components/metricas/objetivo-form.tsx`, `components/charts/bar-por-pilar.tsx`
- Modify: ninguno

**Interfaces:**
- Consumes: `listMetricas`/`createMetrica`/`updateMetrica`/`deleteMetrica` y `listObjetivos`/`createObjetivo`/`updateObjetivo`/`deleteObjetivo`.
- Produces: registro de métricas por post; 3 gráficas (reproducciones por pilar, distribución de likes/comentarios/guardados, evolución temporal); cards de objetivos mensuales con CRUD.

- [ ] **Step 1: Instalar Recharts**

```bash
npm install recharts
```

- [ ] **Step 2: Crear las Server Actions `app/(app)/metricas/actions.ts`**

```ts
"use server";
import { revalidatePath } from "next/cache";
import { createMetrica, updateMetrica, deleteMetrica } from "@/lib/data/metricas";
import { createObjetivo, updateObjetivo, deleteObjetivo } from "@/lib/data/objetivos";
import type { MetricaInsert, ObjetivoInsert } from "@/lib/data/types";

export async function addMetricaAction(input: MetricaInsert) { await createMetrica(input); revalidatePath("/metricas"); revalidatePath("/"); }
export async function updateMetricaAction(id: string, patch: Partial<MetricaInsert>) { await updateMetrica(id, patch); revalidatePath("/metricas"); }
export async function deleteMetricaAction(id: string) { await deleteMetrica(id); revalidatePath("/metricas"); }
export async function addObjetivoAction(input: ObjetivoInsert) { await createObjetivo(input); revalidatePath("/metricas"); revalidatePath("/"); }
export async function updateObjetivoAction(id: string, patch: Partial<ObjetivoInsert>) { await updateObjetivo(id, patch); revalidatePath("/metricas"); }
export async function deleteObjetivoAction(id: string) { await deleteObjetivo(id); revalidatePath("/metricas"); }
```

- [ ] **Step 3: Crear `components/metricas/metrica-form.tsx`**

Formulario con: `titulo`, `fecha`, `plataforma` (Select), `pilar` (Select), y campos numéricos `reproducciones`, `likes`, `comentarios`, `guardados`, `seguidores_ganados`, `puntuacion` (1..5), `notas` (Textarea). Mismo patrón de envío que los anteriores (`addMetricaAction`/`updateMetricaAction`, toast, `onDone`).

- [ ] **Step 4: Crear `components/metricas/objetivo-form.tsx`**

Formulario con: `mes` (Input month → guardar como `YYYY-MM`), `tiktok_inicio`, `tiktok_fin`, `ig_inicio`, `ig_fin`, `posts_objetivo`, `posts_publicados`, `mejor_post`, `aprendizajes` (Textarea). Usa `addObjetivoAction`/`updateObjetivoAction`.

- [ ] **Step 5: Crear el wrapper de gráfica `components/charts/bar-por-pilar.tsx`**

```tsx
"use client";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function BarPorPilar({ data }: { data: { pilar: string; valor: number; color: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <XAxis dataKey="pilar" stroke="#888" fontSize={12} />
        <YAxis stroke="#888" fontSize={12} />
        <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} />
        <Bar dataKey="valor" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 6: Crear la página `app/(app)/metricas/page.tsx`**

```tsx
import { listMetricas } from "@/lib/data/metricas";
import { listObjetivos } from "@/lib/data/objetivos";
import { AppHeader } from "@/components/app-header";
import { MetricasClient } from "./metricas-client";

export default async function MetricasPage() {
  const [metricas, objetivos] = await Promise.all([listMetricas(), listObjetivos()]);
  return (
    <>
      <AppHeader title="Métricas y Objetivos" subtitle="Mide tu rendimiento" />
      <div className="p-6"><MetricasClient metricas={metricas} objetivos={objetivos} /></div>
    </>
  );
}
```

- [ ] **Step 7: Crear `app/(app)/metricas/metricas-client.tsx`**

Componente cliente que:
- Agrega reproducciones por pilar para `BarPorPilar` (sumar `reproducciones` por `pilar`, color `PILAR_COLOR`).
- Muestra una `Table` de métricas (fecha, título, plataforma, pilar, reproducciones, likes, comentarios, guardados, seguidores_ganados, puntuación) con editar/eliminar y un Dialog con `MetricaForm`.
- Muestra las `Card` de objetivos por mes (de `objetivos`) con editar/eliminar y un Dialog con `ObjetivoForm`.
- Renderiza las 3 gráficas (la de barras por pilar, una de reproducciones en el tiempo por fecha, y una de distribución likes/comentarios/guardados). Para las otras dos reutiliza componentes Recharts `LineChart`/`BarChart` inline.

- [ ] **Step 8: Verificar**

Run: `npm run dev`, ir a `/metricas`.
Expected: tabla de métricas y cards de objetivos con CRUD funcional; las 3 gráficas se renderizan con los datos. Ctrl-C.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: sección Métricas y Objetivos con gráficas y CRUD"
```

---

## Task 14: Dashboard (KPIs y gráficas de resumen)

**Files:**
- Modify: `app/(app)/page.tsx`
- Create: `app/(app)/dashboard-client.tsx`

**Interfaces:**
- Consumes: `listPosts`, `listIdeas`, `listObjetivos`.
- Produces: KPIs (seguidores TikTok + Instagram con delta mensual desde el objetivo del mes, posts publicados vs objetivo, ideas pendientes), gráfica de distribución de posts por pilar, gráfica de estado del pipeline, lista de próximos posts.

- [ ] **Step 1: Reescribir `app/(app)/page.tsx`**

```tsx
import { listPosts } from "@/lib/data/posts";
import { listIdeas } from "@/lib/data/ideas";
import { listObjetivos } from "@/lib/data/objetivos";
import { AppHeader } from "@/components/app-header";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const [posts, ideas, objetivos] = await Promise.all([listPosts(), listIdeas(), listObjetivos()]);
  return (
    <>
      <AppHeader title="Dashboard" subtitle="Resumen general de tu actividad" />
      <div className="p-6"><DashboardClient posts={posts} ideas={ideas} objetivos={objetivos} /></div>
    </>
  );
}
```

- [ ] **Step 2: Crear `app/(app)/dashboard-client.tsx`**

Componente cliente que calcula y muestra:
- **KPIs en Cards:** seguidores TikTok (del objetivo del mes actual `tiktok_fin`, delta = `tiktok_fin - tiktok_inicio`), igual para Instagram (`ig_fin`/`ig_inicio`); posts publicados (`posts.filter(p => p.estado === "Publicado").length`) vs `posts_objetivo` del mes; ideas pendientes (`ideas.filter(i => !i.usada).length`).
- **Gráfica de distribución por pilar:** contar posts por `pilar`, usar `BarPorPilar` con `PILAR_COLOR`.
- **Gráfica de pipeline:** contar posts por `estado` (`Idea`/`Grabado`/`Editado`/`Publicado`).
- **Próximos posts:** posts con `fecha >= hoy` ordenados por fecha, primeros 5, en una lista con su pilar (Badge) y fecha.

Mes actual: `const mes = new Date().toISOString().slice(0,7);` y `const obj = objetivos.find(o => o.mes === mes);` (con valores 0 por defecto si no existe).

- [ ] **Step 3: Verificar**

Run: `npm run dev`, ir a `/`.
Expected: el dashboard muestra los KPIs, ambas gráficas y la lista de próximos posts sin errores. Ctrl-C.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: Dashboard con KPIs y gráficas de resumen"
```

---

## Task 15: Backfill de `owner_id` en datos existentes

**Files:**
- Create: `scripts/backfill-owner.ts`
- Modify: ninguno

**Interfaces:**
- Produces: todas las filas existentes en las 4 tablas quedan asignadas al usuario dueño (`owner_id`).

> Las filas previas a la migración tienen `owner_id = NULL` y por tanto son invisibles bajo la nueva RLS. Este script las asigna al dueño usando la **service role key** (omite RLS). Se ejecuta una sola vez.

- [ ] **Step 1: Obtener el `id` del usuario dueño**

Manual: Supabase → Authentication → Users → copiar el `id` (uuid) del usuario creado en Task 9.

- [ ] **Step 2: Crear `scripts/backfill-owner.ts`**

```ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OWNER_ID = process.env.OWNER_ID!; // uuid del usuario dueño

const sb = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  for (const table of ["posts", "ideas", "metricas", "objetivos"]) {
    const { error, count } = await sb
      .from(table)
      .update({ owner_id: OWNER_ID }, { count: "exact" })
      .is("owner_id", null);
    if (error) throw error;
    console.log(`${table}: ${count ?? 0} filas asignadas`);
  }
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 3: Ejecutar el backfill**

```bash
SUPABASE_SERVICE_ROLE_KEY=... OWNER_ID=... npx tsx scripts/backfill-owner.ts
```

(Rellena la service role key desde Supabase → Settings → API y el `OWNER_ID` del paso 1. Instala tsx si hace falta: `npm install -D tsx`.)
Expected: imprime el número de filas asignadas por tabla.

- [ ] **Step 4: Verificar paridad de datos en la app**

Run: `npm run dev`, iniciar sesión.
Expected: las 4 secciones muestran ahora los datos que existían en la app antigua (`index.html`). Comparar abriendo `index.html` en otra pestaña. Ctrl-C.

- [ ] **Step 5: Commit**

```bash
git add scripts/backfill-owner.ts
git commit -m "chore: script de backfill de owner_id"
```

---

## Task 16: Despliegue en Vercel y limpieza de la app antigua

**Files:**
- Modify: `README.md`
- Delete: `index.html`, `supabase-setup.sql` (sustituido por la migración)

**Interfaces:**
- Produces: app desplegada en Vercel con variables de entorno configuradas; repo limpio de la versión single-file.

- [ ] **Step 1: Verificar build de producción local**

Run: `npm run build`
Expected: build sin errores de tipos ni de lint.

- [ ] **Step 2: Ejecutar la suite completa de tests**

Run: `npm test`
Expected: PASS (todos los tests verdes).

- [ ] **Step 3: Desplegar en Vercel**

Manual: importar el repo en Vercel (o `npx vercel`). En el proyecto de Vercel, configurar las variables de entorno: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
Expected: deploy correcto; la URL de producción redirige a `/login` y permite iniciar sesión.

- [ ] **Step 4: Eliminar la app antigua y actualizar el README**

```bash
git rm index.html supabase-setup.sql
```

Actualiza `README.md`: describe el nuevo stack (Next.js + Supabase + Vercel), cómo correr en local (`npm install`, `.env.local`, `npm run dev`), cómo correr tests (`npm test`), y la estructura de carpetas. Conserva la descripción de pilares y secciones.

- [ ] **Step 5: Verificación final de paridad**

Confirma en la URL de producción: login funciona, las 4 secciones muestran datos reales, CRUD funciona en cada una, gráficas se renderizan, logout funciona. Sin sesión, todas las rutas redirigen a `/login`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: despliegue en Vercel + retirar app single-file"
```

---

## Self-Review (cobertura del spec)

- **Framework Next.js + Vercel + Supabase** → Tasks 1, 3, 16. ✓
- **Autenticación, fin del acceso público, RLS endurecido** → Tasks 4, 9. ✓
- **`owner_id` por fila + políticas por dueño** → Tasks 4, 15. ✓
- **Paridad funcional de las 4 secciones** → Tasks 11 (Ideas), 12 (Calendario), 13 (Métricas/Objetivos), 14 (Dashboard). ✓
- **Migración de datos existentes** → Task 15 (backfill) + verificación de paridad. ✓
- **shadcn/ui + Tailwind + tema oscuro + Recharts** → Tasks 8, 13. ✓
- **Estructura modular lista para fases 2-3** (`lib/data`, `lib/integrations` previsto, `app/api/cron` previsto) → estructura de archivos + Task 6-7. ✓
- **Pruebas** (data layer, constantes) → Tasks 2, 6, 7; verificaciones manuales de UI por sección. ✓
- **Manejo de errores** (estados de error, toasts, sin exponer claves) → formularios en Tasks 11-13, capa de datos lanza errores claros. ✓
- **Fuera de alcance** (OAuth/ingesta/análisis/multi-usuario) → no hay tareas que los implementen. ✓

Tablas previstas de fases 2-3 (`cuentas_sociales`, `posts_externos`, `insights`) no se crean en Fase 1, conforme al spec.
```
