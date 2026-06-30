# ContentOS

La base central de tu marca personal en redes sociales: calendario editorial, banco de ideas y métricas de rendimiento — en un solo lugar, protegido por autenticación y listo para escalar.

## Pilares de contenido

| Pilar | Color |
|---|---|
| **Tech** (tech + IA) | Cian |
| **Emprendimiento** | Violeta |
| **Lifestyle** | Rosa |

## Secciones

1. **Dashboard** — KPIs de seguidores (TikTok + Instagram con delta mensual), posts publicados vs objetivo, ideas pendientes, gráficas de distribución por pilar y estado del pipeline, lista de próximos posts.
2. **Calendario** — Vista mensual navegable, posts por día con color por pilar, clic en un día para crear, tabla del mes y CRUD completo.
3. **Ideas** — Tabla filtrable por pilar, con hook, prioridad y marcador de usada/no usada. Contador de ideas no usadas en el sidebar.
4. **Métricas y Objetivos** — Registro manual por post (reproducciones, likes, comentarios, guardados, seguidores, puntuación 1-5, notas), gráficas Recharts y cards de objetivos mensuales.

---

## Stack

- **Framework:** Next.js 16 (App Router) + React + TypeScript
- **Base de datos y Auth:** Supabase (Postgres + Row Level Security, cada fila protegida por `owner_id`)
- **UI:** Tailwind CSS + shadcn/ui (tema oscuro)
- **Gráficas:** Recharts
- **Deploy:** Vercel

---

## Desarrollo local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

Copia el ejemplo y rellena tus valores de Supabase (Project Settings → API):

```bash
cp .env.example .env.local
```

Las claves que necesitas en `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

> No pongas los valores reales en el repo. `.env.local` está en `.gitignore`.

### 3. Arrancar en local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La app redirige a `/login` si no hay sesión activa.

---

## Tests

```bash
npm test
```

La suite usa Vitest y cubre la capa de datos (`lib/data`) y las constantes compartidas (`lib/constants`). Deben pasar 34/34.

---

## Migraciones de base de datos

Las migraciones viven en `supabase/migrations/`. Para aplicarlas a tu proyecto de Supabase:

```bash
supabase db push
```

Requiere tener el CLI de Supabase instalado (`npm install -g supabase`) y el proyecto vinculado (`supabase link`).

---

## Estructura de carpetas

```
app/                   # Rutas Next.js (App Router)
  (app)/               # Layout autenticado
  auth/signout/        # Acción de logout
  login/               # Página pública de login
components/            # Componentes React reutilizables
  charts/              # Gráficas Recharts
  ideas/               # Componentes de la sección Ideas
  metricas/            # Componentes de Métricas y Objetivos
  posts/               # Componentes de Calendario
  ui/                  # Primitivos shadcn/ui
lib/
  data/                # Capa de acceso a datos (Supabase queries)
  supabase/            # Clientes Supabase (browser + server)
  constants.ts         # Pilares, plataformas, formatos y estados compartidos
supabase/
  migrations/          # Migraciones SQL (aplicadas con supabase db push)
```

---

## Roadmap

- **Fase 2 — Ingesta automática:** conexión con la API de Instagram/TikTok para importar métricas de rendimiento sin entrada manual.
- **Fase 3 — Análisis automático:** sugerencias de contenido, detección de tendencias y puntuación de ideas basada en historial de rendimiento.
