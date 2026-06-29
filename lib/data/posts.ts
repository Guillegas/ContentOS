import { createClient } from "@/lib/supabase/server";
import type { Post, PostInsert } from "@/lib/data/types";

export async function listPosts(): Promise<Post[]> {
  const sb = await createClient();
  const { data, error } = await sb.from("posts").select("*").order("fecha", { ascending: true });
  if (error) throw new Error(error.message);
  return data as Post[];
}

export async function createPost(input: PostInsert): Promise<Post> {
  const sb = await createClient();
  const { data, error } = await sb.from("posts").insert(input).select().single();
  if (error) throw new Error(error.message);
  return data as Post;
}

export async function updatePost(id: string, patch: Partial<PostInsert>): Promise<Post> {
  const sb = await createClient();
  const { data, error } = await sb.from("posts").update(patch).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data as Post;
}

export async function deletePost(id: string): Promise<void> {
  const sb = await createClient();
  const { error } = await sb.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
