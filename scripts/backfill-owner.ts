// Asigna owner_id a las filas existentes (anteriores a la migración 0001) que
// quedaron con owner_id NULL y por tanto invisibles bajo la RLS por dueño.
// Usa la service role key (omite RLS). Ejecutar una sola vez:
//
//   SUPABASE_SERVICE_ROLE_KEY=... OWNER_ID=... npx tsx scripts/backfill-owner.ts
//
// OWNER_ID es el uuid del usuario dueño (Supabase -> Authentication -> Users).
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OWNER_ID = process.env.OWNER_ID!;

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

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
