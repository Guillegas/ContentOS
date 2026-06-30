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
