-- ============================================================
-- ContentOS · Esquema de base de datos para Supabase
-- ============================================================
-- Cómo usarlo:
-- 1. Entra en https://supabase.com y crea un proyecto nuevo.
-- 2. En el menú lateral ve a  SQL Editor  ->  New query.
-- 3. Pega TODO este archivo y pulsa  Run.
-- 4. Copia tu Project URL y anon key desde  Project Settings -> API
--    y pégalas en index.html (constantes SUPABASE_URL y SUPABASE_ANON_KEY).
-- ============================================================

-- Limpieza opcional (descomenta si quieres recrear desde cero)
-- drop table if exists metricas cascade;
-- drop table if exists objetivos cascade;
-- drop table if exists ideas cascade;
-- drop table if exists posts cascade;

-- ---------- POSTS (calendario editorial) ----------
create table if not exists posts (
  id          uuid primary key default gen_random_uuid(),
  fecha       date not null,
  plataforma  text not null default 'TikTok',   -- TikTok | Instagram | Ambas
  pilar       text not null default 'Tech',      -- Tech | Emprendimiento | Lifestyle
  formato     text not null default 'Reel',      -- Reel | Carrusel | Story | Foto
  titulo      text not null,
  estado      text not null default 'Idea',      -- Idea | Grabado | Editado | Publicado
  enlace      text,
  created_at  timestamptz not null default now()
);

-- ---------- IDEAS (banco de ideas) ----------
create table if not exists ideas (
  id          uuid primary key default gen_random_uuid(),
  fecha       date not null default current_date,
  pilar       text not null default 'Tech',
  titulo      text not null,
  hook        text,
  prioridad   text not null default 'Media',     -- Alta | Media | Baja
  usada       boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------- METRICAS (rendimiento por post) ----------
create table if not exists metricas (
  id                 uuid primary key default gen_random_uuid(),
  fecha              date not null default current_date,
  titulo             text not null,
  plataforma         text not null default 'TikTok',
  pilar              text not null default 'Tech',
  reproducciones     integer not null default 0,
  likes              integer not null default 0,
  comentarios        integer not null default 0,
  guardados          integer not null default 0,   -- guardados / shares
  seguidores_ganados integer not null default 0,
  puntuacion         integer not null default 3,    -- 1..5
  notas              text,
  created_at         timestamptz not null default now()
);

-- ---------- OBJETIVOS (objetivos mensuales) ----------
create table if not exists objetivos (
  id                uuid primary key default gen_random_uuid(),
  mes               text not null unique,           -- formato 'YYYY-MM'
  tiktok_inicio     integer not null default 0,
  tiktok_fin        integer not null default 0,
  ig_inicio         integer not null default 0,
  ig_fin            integer not null default 0,
  posts_objetivo    integer not null default 0,
  posts_publicados  integer not null default 0,
  mejor_post        text,
  aprendizajes      text,
  created_at        timestamptz not null default now()
);

-- ============================================================
-- Seguridad: acceso público con la anon key (sin login).
-- Activamos RLS y creamos políticas que permiten todo.
-- (Cuando añadas autenticación más adelante, endurece estas políticas.)
-- ============================================================
alter table posts     enable row level security;
alter table ideas     enable row level security;
alter table metricas  enable row level security;
alter table objetivos enable row level security;

-- Políticas "todo permitido" para anon + authenticated
do $$
declare t text;
begin
  foreach t in array array['posts','ideas','metricas','objetivos'] loop
    execute format('drop policy if exists "public_all_%1$s" on %1$s;', t);
    execute format(
      'create policy "public_all_%1$s" on %1$s
         for all
         to anon, authenticated
         using (true)
         with check (true);', t);
  end loop;
end $$;

-- Índices útiles
create index if not exists idx_posts_fecha    on posts(fecha);
create index if not exists idx_ideas_usada     on ideas(usada);
create index if not exists idx_metricas_fecha  on metricas(fecha);
