"use server";
import { revalidatePath } from "next/cache";
import { createMetrica, updateMetrica, deleteMetrica } from "@/lib/data/metricas";
import { createObjetivo, updateObjetivo, deleteObjetivo } from "@/lib/data/objetivos";
import type { MetricaInsert, ObjetivoInsert } from "@/lib/data/types";

export async function addMetricaAction(input: MetricaInsert) {
  await createMetrica(input);
  revalidatePath("/metricas");
  revalidatePath("/");
}

export async function updateMetricaAction(id: string, patch: Partial<MetricaInsert>) {
  await updateMetrica(id, patch);
  revalidatePath("/metricas");
}

export async function deleteMetricaAction(id: string) {
  await deleteMetrica(id);
  revalidatePath("/metricas");
}

export async function addObjetivoAction(input: ObjetivoInsert) {
  await createObjetivo(input);
  revalidatePath("/metricas");
  revalidatePath("/");
}

export async function updateObjetivoAction(id: string, patch: Partial<ObjetivoInsert>) {
  await updateObjetivo(id, patch);
  revalidatePath("/metricas");
}

export async function deleteObjetivoAction(id: string) {
  await deleteObjetivo(id);
  revalidatePath("/metricas");
}
