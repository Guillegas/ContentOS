"use server";
import { revalidatePath } from "next/cache";
import { createIdea, updateIdea, deleteIdea } from "@/lib/data/ideas";
import type { IdeaInsert } from "@/lib/data/types";

export async function addIdeaAction(input: IdeaInsert) {
  await createIdea(input);
  revalidatePath("/ideas");
}

export async function updateIdeaAction(id: string, patch: Partial<IdeaInsert>) {
  await updateIdea(id, patch);
  revalidatePath("/ideas");
}

export async function deleteIdeaAction(id: string) {
  await deleteIdea(id);
  revalidatePath("/ideas");
}
