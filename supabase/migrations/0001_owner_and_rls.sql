-- supabase/migrations/0001_owner_and_rls.sql
-- Añade owner_id y endurece RLS: cada fila pertenece a un usuario autenticado.

alter table posts     add column if not exists owner_id uuid references auth.users(id) default auth.uid();
alter table ideas     add column if not exists owner_id uuid references auth.users(id) default auth.uid();
alter table metricas  add column if not exists owner_id uuid references auth.users(id) default auth.uid();
alter table objetivos add column if not exists owner_id uuid references auth.users(id) default auth.uid();

-- Asegurar RLS activado (idempotente; en producción ya estaba activo).
alter table posts     enable row level security;
alter table ideas     enable row level security;
alter table metricas  enable row level security;
alter table objetivos enable row level security;

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
