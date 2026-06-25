# ContentOS

> La base central de tu marca personal en redes sociales. Calendario editorial, banco de ideas y métricas — en un solo sitio, accesible desde PC y móvil.

Web app de un solo archivo (`index.html`) con **HTML/CSS/JS puro**, conectada a **Supabase** como base de datos en la nube. Diseño dark, moderno y minimalista estilo dashboard SaaS.

## Pilares de contenido

| Pilar | Color |
|---|---|
| **Tech** (tech + IA) | Cian |
| **Emprendimiento** | Violeta |
| **Lifestyle** | Rosa |

## Secciones

1. **Dashboard** — KPIs de seguidores (TikTok + Instagram con delta mensual), posts publicados vs objetivo, ideas pendientes, gráficas de distribución por pilar y estado del pipeline, lista de próximos posts.
2. **Calendario Editorial** — Vista mensual navegable, posts por día con color por pilar, clic en un día para crear, tabla del mes y CRUD completo.
3. **Banco de Ideas** — Tabla filtrable por pilar, con hook, prioridad y marcador de usada/no usada. Contador de ideas no usadas en el sidebar.
4. **Métricas y Objetivos** — Registro manual por post (reproducciones, likes, comentarios, guardados, seguidores, puntuación 1-5, notas), 3 gráficas y cards de objetivos mensuales.

---

## Puesta en marcha (5 minutos)

### 1. Crear el proyecto en Supabase
1. Entra en [supabase.com](https://supabase.com) y crea una cuenta (gratis).
2. **New project** → ponle un nombre (p.ej. `contentos`), elige región cercana (Frankfurt para Europa) y una contraseña de base de datos.
3. Espera ~1 min a que se aprovisione.

### 2. Crear las tablas
1. En el menú lateral abre **SQL Editor → New query**.
2. Copia **todo** el contenido de [`supabase-setup.sql`](./supabase-setup.sql) y pégalo.
3. Pulsa **Run**. Debe decir *Success*. Esto crea las tablas `posts`, `ideas`, `metricas`, `objetivos` y deja el acceso público con la anon key.

### 3. Copiar las credenciales
1. Ve a **Project Settings → API**.
2. Copia:
   - **Project URL** → es tu `SUPABASE_URL` (algo como `https://xxxx.supabase.co`)
   - **anon public** key → es tu `SUPABASE_ANON_KEY`

### 4. Pegar las credenciales en la app
Abre `index.html` y busca al inicio del `<script>` estas dos líneas:

```js
const SUPABASE_URL      = "PEGA_AQUI_TU_SUPABASE_URL";
const SUPABASE_ANON_KEY = "PEGA_AQUI_TU_SUPABASE_ANON_KEY";
```

Sustituye los textos por tus valores reales y guarda.

### 5. Abrir la app
- **En tu PC:** doble clic en `index.html` (se abre en el navegador).
- Cuando esté conectada verás el indicador **● En la nube** arriba a la derecha.

---

## Acceder desde el móvil

Como los datos viven en Supabase (la nube), puedes abrir la misma app desde cualquier dispositivo y verás los mismos datos. Para tenerla a mano en el móvil, alójala gratis en cualquiera de estos:

- **GitHub Pages** — sube el repo y actívalo en *Settings → Pages*.
- **Vercel / Netlify** — arrastra la carpeta o conecta el repo. Deploy en segundos.

> ⚠️ La `anon key` queda visible en el código (es público por diseño en esta fase, sin login). Las políticas RLS de `supabase-setup.sql` permiten lectura/escritura pública. Cuando quieras proteger el acceso, añade Supabase Auth y endurece las políticas RLS.

Una vez desplegada, abre la URL en el móvil y **Añadir a pantalla de inicio** para usarla como una app. El sidebar se colapsa automáticamente en pantallas pequeñas (botón ☰).

---

## Detalles técnicos

- **Sin build, sin dependencias locales.** Todo el CSS y JS va embebido en `index.html`.
- **Supabase JS** desde CDN: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
- **Chart.js** desde CDN para las gráficas.
- **Fuentes:** Space Grotesk (display) + Inter (body) desde Google Fonts.
- **Tema:** oscuro por defecto con toggle a claro (se recuerda en `localStorage`).
- **Persistencia inmediata:** cada guardado escribe en Supabase y refresca la UI al instante, sin recargar la página.

## Estructura de tablas

| Tabla | Campos clave |
|---|---|
| `posts` | fecha, plataforma, pilar, formato, titulo, estado, enlace |
| `ideas` | fecha, pilar, titulo, hook, prioridad, usada |
| `metricas` | fecha, titulo, plataforma, pilar, reproducciones, likes, comentarios, guardados, seguidores_ganados, puntuacion, notas |
| `objetivos` | mes, tiktok_inicio/fin, ig_inicio/fin, posts_objetivo, posts_publicados, mejor_post, aprendizajes |
