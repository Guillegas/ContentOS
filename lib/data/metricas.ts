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
