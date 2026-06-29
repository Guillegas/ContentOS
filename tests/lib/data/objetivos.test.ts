import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock for listObjetivos: from().select().order()
const order = vi.fn();
const select = vi.fn(() => ({ order }));

// Shared mock for single() - used by both insert and update chains
const single = vi.fn();

// Mock for createObjetivo: from().insert().select().single()
const insertSelect = vi.fn(() => ({ single }));
const insert = vi.fn(() => ({ select: insertSelect }));

// Mock for updateObjetivo: from().update(patch).eq("id", id).select().single()
const updateSelect = vi.fn(() => ({ single }));
const updateEq = vi.fn(() => ({ select: updateSelect }));
const update = vi.fn(() => ({ eq: updateEq }));

// Mock for deleteObjetivo: from().delete().eq("id", id)
const deleteEq = vi.fn();
const del = vi.fn(() => ({ eq: deleteEq }));

// Main from() function returns object with all methods
const from = vi.fn(() => ({ select, insert, update, delete: del }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from })),
}));

import { listObjetivos, createObjetivo, updateObjetivo, deleteObjetivo } from "@/lib/data/objetivos";

beforeEach(() => vi.clearAllMocks());

describe("objetivos data layer", () => {
  it("listObjetivos ordena por mes desc", async () => {
    order.mockResolvedValue({ data: [{ id: "1" }], error: null });
    const result = await listObjetivos();
    expect(from).toHaveBeenCalledWith("objetivos");
    expect(order).toHaveBeenCalledWith("mes", { ascending: false });
    expect(result).toEqual([{ id: "1" }]);
  });

  it("listObjetivos lanza si Supabase devuelve error", async () => {
    order.mockResolvedValue({ data: null, error: { message: "list error" } });
    await expect(listObjetivos()).rejects.toThrow("list error");
  });

  it("createObjetivo inserta y devuelve la fila creada", async () => {
    single.mockResolvedValue({ data: { id: "2", mes: "2026-07" }, error: null });
    const result = await createObjetivo({
      mes: "2026-07",
      tiktok_inicio: 1000,
      tiktok_fin: 1100,
      ig_inicio: 500,
      ig_fin: 550,
      posts_objetivo: 10,
      posts_publicados: 8,
      mejor_post: "post-123",
      aprendizajes: null,
    } as never);
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ mes: "2026-07" }));
    expect(result).toEqual({ id: "2", mes: "2026-07" });
  });

  it("createObjetivo lanza si Supabase devuelve error", async () => {
    single.mockResolvedValue({ data: null, error: { message: "create error" } });
    await expect(createObjetivo({} as never)).rejects.toThrow("create error");
  });

  it("updateObjetivo actualiza y devuelve la fila actualizada", async () => {
    single.mockResolvedValue({ data: { id: "1", posts_publicados: 9 }, error: null });
    const result = await updateObjetivo("1", { posts_publicados: 9 });
    expect(from).toHaveBeenCalledWith("objetivos");
    expect(update).toHaveBeenCalledWith({ posts_publicados: 9 });
    expect(updateEq).toHaveBeenCalledWith("id", "1");
    expect(result).toEqual({ id: "1", posts_publicados: 9 });
  });

  it("updateObjetivo lanza si Supabase devuelve error", async () => {
    single.mockResolvedValue({ data: null, error: { message: "update error" } });
    await expect(updateObjetivo("1", { posts_publicados: 9 })).rejects.toThrow("update error");
  });

  it("deleteObjetivo elimina el objetivo", async () => {
    deleteEq.mockResolvedValue({ error: null });
    await deleteObjetivo("1");
    expect(from).toHaveBeenCalledWith("objetivos");
    expect(del).toHaveBeenCalled();
    expect(deleteEq).toHaveBeenCalledWith("id", "1");
  });

  it("deleteObjetivo lanza si Supabase devuelve error", async () => {
    deleteEq.mockResolvedValue({ error: { message: "delete error" } });
    await expect(deleteObjetivo("1")).rejects.toThrow("delete error");
  });
});
