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
