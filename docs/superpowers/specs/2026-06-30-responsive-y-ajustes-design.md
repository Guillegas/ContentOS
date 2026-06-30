# ContentOS — Diseño: Responsive móvil + apartado Ajustes

**Fecha:** 2026-06-30
**Estado:** Aprobado para escribir plan de implementación
**Contexto:** Mejora sobre la Fase 1 ya desplegada (Next.js 16 + Supabase + Netlify).

## Problema

1. La app no es usable en móvil: el sidebar es una columna fija de `w-56` siempre visible
   (`app/(app)/layout.tsx`, `components/app-sidebar.tsx`), las cuadrículas de KPIs/cards no
   colapsan, y las tablas se desbordan en pantallas estrechas.
2. No hay forma de ver la info de la cuenta ni cambiar la contraseña desde la web (hay que ir a Supabase).
   El logout solo está en la cabecera.

## Objetivos

- La app es usable y se ve bien en móvil (≈360px) y en escritorio.
- Existe un apartado `/ajustes` con: info de cuenta (solo lectura), cambio de contraseña, cerrar sesión,
  y un toggle de tema claro/oscuro.

## Fuera de alcance

- Multi-usuario, avatares/foto de perfil, edición de email.
- Preferencias avanzadas (objetivos por defecto, etc.). Solo el toggle de tema.

## Bloque A — Responsive

- **Sidebar como cajón en móvil:** en `<md` el sidebar se oculta y se abre con un botón **☰** en la
  cabecera, usando el componente **`Sheet` de shadcn/ui**. En `md+` se mantiene la columna fija actual.
  - El contenido de navegación (los 4 enlaces + "Ajustes") se extrae a un componente reutilizable
    (`SidebarNav`) usado tanto por la columna fija (desktop) como por el `Sheet` (móvil), para no duplicar.
  - Al navegar en móvil, el `Sheet` se cierra.
- **Cabecera (`AppHeader`):** añade el disparador ☰ visible solo en móvil (`md:hidden`). Mantiene título,
  subtítulo y el botón "Salir".
- **Cuadrículas:** KPIs y cards pasan a `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` (y equivalentes) para
  apilar en móvil.
- **Tablas:** envueltas en un contenedor con `overflow-x-auto` para permitir scroll horizontal sin romper
  el layout. Aplica a Ideas, Calendario (tabla del mes) y Métricas.
- **Calendario:** la rejilla de 7 columnas se mantiene pero con `min-width` + `overflow-x-auto` en su
  contenedor para que en móvil se pueda desplazar; celdas y texto reducen tamaño en breakpoints pequeños.
- **Paddings:** los `p-6` de las páginas pasan a `p-4 md:p-6`.
- **Gráficas y diálogos:** ya son responsive (Recharts `ResponsiveContainer`, shadcn `Dialog`); solo se
  revisan contenedores para que ocupen el ancho disponible.

## Bloque B — Apartado Ajustes

- **Ruta `app/(app)/ajustes/page.tsx`** (Server Component) + enlace "Ajustes" en `SidebarNav`.
- **Tu cuenta (solo lectura):** Card que muestra email, fecha de alta (`created_at`) y ID de usuario,
  obtenidos en el servidor con `supabase.auth.getUser()`.
- **Cambiar contraseña:** componente cliente (`change-password-form.tsx`) con campos "nueva contraseña" y
  "confirmar". Valida: mínimo 8 caracteres y que ambas coincidan; si no, muestra error y no envía. Llama a
  `supabase.auth.updateUser({ password })` con el cliente de navegador (sesión activa). Feedback con toast;
  limpia los campos al éxito. La lógica de validación se extrae a una función pura testeable
  (`validatePassword(nueva, confirmar): string | null`).
- **Cerrar sesión:** botón dentro del apartado que hace POST a `/auth/signout` (reutiliza la ruta existente).
- **Tema claro/oscuro:** se integra **`next-themes`**. Se añade un `ThemeProvider` (client) en el árbol;
  `app/layout.tsx` deja de forzar `className="dark"` y pasa a `suppressHydrationWarning` con el provider
  gestionando la clase (`attribute="class"`, `defaultTheme="dark"`). En Ajustes, un toggle claro/oscuro que
  persiste (next-themes usa localStorage). El resto de la UI ya usa tokens de Tailwind que responden a la
  clase `.dark`, así que el modo claro funciona sin más cambios de estilo.

## Componentes y archivos

- Modificar: `app/(app)/layout.tsx`, `components/app-sidebar.tsx`, `components/app-header.tsx`,
  `app/layout.tsx` (theme provider, quitar dark forzado), y las páginas/clientes para las clases responsive
  (dashboard, ideas, calendario, métricas).
- Crear: `components/sidebar-nav.tsx`, `components/theme-provider.tsx`, `components/theme-toggle.tsx`,
  `app/(app)/ajustes/page.tsx`, `components/ajustes/change-password-form.tsx`,
  `lib/validate-password.ts` (+ su test).
- Dependencias nuevas: `next-themes`, y el componente `sheet` de shadcn (`npx shadcn add sheet`).

## Manejo de errores

- Cambio de contraseña: errores de validación en línea; errores de Supabase vía toast. No exponer secretos.
- El resto de cambios son de presentación; sin nuevos caminos de error.

## Pruebas

- **Unitaria:** `validatePassword` (coincidencia, longitud mínima, casos límite).
- **Visual/manual:** revisar Dashboard, Calendario, Ideas, Métricas y Ajustes en móvil (~360–414px) y
  desktop; abrir/cerrar el cajón ☰; alternar tema claro/oscuro y comprobar que persiste tras recargar.
- **End-to-end:** cambiar la contraseña desde /ajustes y volver a iniciar sesión con la nueva.
- La suite existente (34 tests) debe seguir verde.
