# ContentOS — Diseño Fase 1: Migración a plataforma moderna

**Fecha:** 2026-06-29
**Estado:** Aprobado para escribir plan de implementación
**Alcance de este spec:** Fase 1. Las fases 2 y 3 se documentan como horizonte; tendrán su propio spec.

## Contexto

ContentOS hoy es un único `index.html` (HTML/CSS/JS puro, ~1200 líneas) conectado a Supabase
con 4 tablas (`posts`, `ideas`, `metricas`, `objetivos`) y acceso público vía anon key, sin login.
Todo el registro de datos es manual.

El objetivo a largo plazo es convertirlo en un "OS" de marca personal que **se actualice solo**,
recogiendo métricas e insights de Instagram y TikTok automáticamente, con análisis de patrones.
El usuario tiene ambas cuentas en modo **profesional** (Business/Creator), lo que habilita las APIs oficiales.

La construcción es **por fases** para tener algo usable pronto sin depender de la aprobación de las APIs:

- **Fase 1 (este spec):** migrar a framework moderno, autenticación, y los datos actuales funcionando.
- **Fase 2 (horizonte):** OAuth + ingesta automática de Instagram/TikTok vía cron.
- **Fase 3 (horizonte):** motor de análisis automático e insights en lenguaje natural.

## Decisiones de arquitectura

- **Framework:** Next.js (App Router) + React + TypeScript.
- **Hosting:** Vercel (despliegue automático desde git; cron y funciones nativos para fases 2-3).
- **Base de datos / Auth:** Supabase (Postgres + Supabase Auth). Se conserva el proyecto actual.
- **UI:** shadcn/ui + Tailwind CSS (estilo dark SaaS, coherente con el diseño actual). Recharts para gráficas (reemplaza Chart.js).
- **Modularidad:** estructura preparada para las fases siguientes sin reescrituras.

## Objetivos de la Fase 1

1. La app deja de ser un archivo único y pasa a ser un proyecto Next.js mantenible y desplegado en Vercel.
2. **Autenticación**: solo el dueño accede. Se elimina el acceso público con anon key; se endurecen las políticas RLS.
3. **Paridad funcional** con la app actual: las 4 secciones existentes funcionan igual o mejor.
4. **Migración de datos**: los datos actuales en Supabase se conservan y siguen accesibles.
5. La arquitectura queda **lista para automatizar** (interfaces y tablas previstas), pero la Fase 1 sigue con registro manual.

## Fuera de alcance (Fase 1)

- OAuth e ingesta de Instagram/TikTok (Fase 2).
- Motor de análisis automático y resúmenes con IA (Fase 3).
- Soporte multi-usuario / equipos. Es una herramienta personal de un solo dueño.

## Secciones de la app (paridad con la actual)

1. **Dashboard** — KPIs de seguidores (TikTok + Instagram con delta mensual), posts publicados vs objetivo,
   ideas pendientes, gráficas de distribución por pilar y estado del pipeline, próximos posts.
2. **Calendario Editorial** — vista mensual navegable, posts por día con color por pilar, CRUD completo.
3. **Banco de Ideas** — tabla filtrable por pilar, con hook, prioridad y marcador usada/no usada.
4. **Métricas y Objetivos** — registro por post, gráficas y cards de objetivos mensuales.

Pilares de contenido y colores se conservan: **Tech** (cian), **Emprendimiento** (violeta), **Lifestyle** (rosa).

## Modelo de datos

Se conservan las tablas actuales (`posts`, `ideas`, `metricas`, `objetivos`) con sus campos.

Cambios en Fase 1:

- **RLS endurecido**: las políticas "todo permitido para anon" se sustituyen por políticas que
  exigen usuario autenticado (`auth.uid()`). Se añade columna `owner_id` (uuid) a cada tabla,
  con default al usuario autenticado, y las políticas filtran por `owner_id = auth.uid()`.
- Migración: asignar `owner_id` a las filas existentes al usuario dueño.

Tablas previstas para fases siguientes (se documentan ahora, **no** se crean en Fase 1 salvo que convenga dejarlas listas):

- `cuentas_sociales` — cuentas conectadas y tokens OAuth (Fase 2).
- `posts_externos` — posts reales traídos de IG/TikTok, enlazados con `posts` (Fase 2).
- `metricas` evoluciona a *snapshots* en el tiempo por post (Fase 2).
- `insights` — resultados del análisis automático (Fase 3).

## Estructura del proyecto (propuesta)

```
app/
  (auth)/login/            # pantalla de login (Supabase Auth)
  dashboard/               # vista principal
  calendario/
  ideas/
  metricas/
  layout.tsx, page.tsx
components/                # UI (shadcn/ui)
lib/
  supabase/                # cliente server + browser, tipos generados
  data/                    # funciones de acceso a datos por entidad
  integrations/            # (Fase 2) conectores instagram/ y tiktok/ tras interfaz común
  analysis/                # (Fase 3) motor de patrones
app/api/cron/              # (Fase 2-3) tareas programadas
```

## Autenticación y seguridad

- **Supabase Auth** con email (magic link o email+password). Un único dueño.
- Middleware de Next.js protege todas las rutas salvo `/login`.
- RLS por `owner_id = auth.uid()` en todas las tablas.
- Se elimina la exposición de la anon key como mecanismo de acceso; las claves sensibles
  (service role, futuros tokens OAuth) viven en variables de entorno de Vercel, nunca en el cliente.

## Migración de datos

1. Los datos actuales ya viven en Supabase; no se borran.
2. Se añade `owner_id` y se rellena con el id del usuario dueño tras crear su cuenta.
3. Verificación: las 4 secciones muestran los mismos datos que la app actual.

## Estrategia de pruebas

- Pruebas de las funciones de acceso a datos (`lib/data`) contra una instancia Supabase de test/local.
- Pruebas de componentes clave (calendario, formularios CRUD).
- Verificación manual de paridad: cada sección de la app nueva vs. la actual.
- Verificación de seguridad: sin sesión, las rutas redirigen a login; las consultas respetan RLS.

## Manejo de errores

- Estados de carga y error visibles en cada sección (no fallos silenciosos).
- Errores de Supabase se capturan y muestran mensaje claro; nunca se exponen claves.

## Horizonte (resumen de fases 2 y 3)

- **Fase 2 — Ingesta automática:** botón "Conectar Instagram/TikTok" (OAuth), tokens en BD,
  Vercel Cron cada X horas que trae posts y métricas reales vía API oficial y guarda snapshots.
  Conectores aislados tras interfaz común (`fetchPosts`, `fetchMetrics`). Nota: requiere apps de
  desarrollador en Meta y TikTok y aprobación de permisos (puede tardar).
- **Fase 3 — Análisis automático:** proceso (cron, tras ingesta) que calcula patrones
  (mejor pilar/formato/horario, top/peores posts, tendencia de seguidores) y genera un resumen
  periódico en lenguaje natural guardado en `insights`. El dashboard solo lee insights ya calculados.
