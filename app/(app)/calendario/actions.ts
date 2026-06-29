"use server";
import { revalidatePath } from "next/cache";
import { createPost, updatePost, deletePost } from "@/lib/data/posts";
import type { PostInsert } from "@/lib/data/types";

export async function addPostAction(input: PostInsert) {
  await createPost(input);
  revalidatePath("/calendario");
  revalidatePath("/");
}

export async function updatePostAction(id: string, patch: Partial<PostInsert>) {
  await updatePost(id, patch);
  revalidatePath("/calendario");
  revalidatePath("/");
}

export async function deletePostAction(id: string) {
  await deletePost(id);
  revalidatePath("/calendario");
  revalidatePath("/");
}
