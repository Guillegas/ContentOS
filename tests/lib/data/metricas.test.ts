import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock for listMetricas: from().select().order()
const order = vi.fn();
const select = vi.fn(() => ({ order }));

// Shared mock for single() - used by both insert and update chains
const single = vi.fn();

// Mock for createMetrica: from().insert().select().single()
const insertSelect = vi.fn(() => ({ single }));
const insert = vi.fn(() => ({ select: insertSelect }));

// Mock for updateMetrica: from().update(patch).eq("id", id).select().single()
const updateSelect = vi.fn(() => ({ single }));
const updateEq = vi.fn(() => ({ select: updateSelect }));
const update = vi.fn(() => ({ eq: updateEq }));

// Mock for deleteMetrica: from().delete().eq("id", id)
const deleteEq = vi.fn();
const del = vi.fn(() => ({ eq: deleteEq }));

// Main from() function returns object with all methods
const from = vi.fn(() => ({ select, insert, update, delete: del }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from })),
}));

import { listMetricas, createMetrica, updateMetrica, deleteMetrica } from "@/lib/data/metricas";

beforeEach(() => vi.clearAllMocks());

describe("metricas data layer", () => {
  it("listMetricas ordena por fecha asc", async () => {
    order.mockResolvedValue({ data: [{ id: "1" }], error: null });
    const result = await listMetricas();
    expect(from).toHaveBeenCalledWith("metricas");
    expect(order).toHaveBeenCalledWith("fecha", { ascending: true });
    expect(result).toEqual([{ id: "1" }]);
  });

  it("listMetricas lanza si Supabase devuelve error", async () => {
    order.mockResolvedValue({ data: null, error: { message: "list error" } });
    await expect(listMetricas()).rejects.toThrow("list error");
  });

  it("createMetrica inserta y devuelve la fila creada", async () => {
    single.mockResolvedValue({ data: { id: "2", titulo: "nueva metrica" }, error: null });
    const result = await createMetrica({
      fecha: "2026-07-01",
      titulo: "nueva metrica",
      plataforma: "TikTok",
      pilar: "Tech",
      reproducciones: 1000,
      likes: 100,
      comentarios: 10,
      guardados: 5,
      seguidores_ganados: 50,
      puntuacion: 4,
      notas: null,
    } as never);
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ titulo: "nueva metrica" }));
    expect(result).toEqual({ id: "2", titulo: "nueva metrica" });
  });

  it("createMetrica lanza si Supabase devuelve error", async () => {
    single.mockResolvedValue({ data: null, error: { message: "create error" } });
    await expect(createMetrica({} as never)).rejects.toThrow("create error");
  });

  it("updateMetrica actualiza y devuelve la fila actualizada", async () => {
    single.mockResolvedValue({ data: { id: "1", titulo: "metrica actualizada" }, error: null });
    const result = await updateMetrica("1", { titulo: "metrica actualizada" });
    expect(from).toHaveBeenCalledWith("metricas");
    expect(update).toHaveBeenCalledWith({ titulo: "metrica actualizada" });
    expect(updateEq).toHaveBeenCalledWith("id", "1");
    expect(result).toEqual({ id: "1", titulo: "metrica actualizada" });
  });

  it("updateMetrica lanza si Supabase devuelve error", async () => {
    single.mockResolvedValue({ data: null, error: { message: "update error" } });
    await expect(updateMetrica("1", { titulo: "updated" })).rejects.toThrow("update error");
  });

  it("deleteMetrica elimina la metrica", async () => {
    deleteEq.mockResolvedValue({ error: null });
    await deleteMetrica("1");
    expect(from).toHaveBeenCalledWith("metricas");
    expect(del).toHaveBeenCalled();
    expect(deleteEq).toHaveBeenCalledWith("id", "1");
  });

  it("deleteMetrica lanza si Supabase devuelve error", async () => {
    deleteEq.mockResolvedValue({ error: { message: "delete error" } });
    await expect(deleteMetrica("1")).rejects.toThrow("delete error");
  });
});
