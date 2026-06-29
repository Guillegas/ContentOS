import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock for listIdeas: from().select().order()
const order = vi.fn();
const select = vi.fn(() => ({ order }));

// Shared mock for single() - used by both insert and update chains
const single = vi.fn();

// Mock for createIdea: from().insert().select().single()
const insertSelect = vi.fn(() => ({ single }));
const insert = vi.fn(() => ({ select: insertSelect }));

// Mock for updateIdea: from().update(patch).eq("id", id).select().single()
const updateSelect = vi.fn(() => ({ single }));
const updateEq = vi.fn(() => ({ select: updateSelect }));
const update = vi.fn(() => ({ eq: updateEq }));

// Mock for deleteIdea: from().delete().eq("id", id)
const deleteEq = vi.fn();
const del = vi.fn(() => ({ eq: deleteEq }));

// Main from() function returns object with all methods
const from = vi.fn(() => ({ select, insert, update, delete: del }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from })),
}));

import { listIdeas, createIdea, updateIdea, deleteIdea } from "@/lib/data/ideas";

beforeEach(() => vi.clearAllMocks());

describe("ideas data layer", () => {
  it("listIdeas ordena por created_at desc", async () => {
    order.mockResolvedValue({ data: [{ id: "1" }], error: null });
    const result = await listIdeas();
    expect(from).toHaveBeenCalledWith("ideas");
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(result).toEqual([{ id: "1" }]);
  });

  it("listIdeas lanza si Supabase devuelve error", async () => {
    order.mockResolvedValue({ data: null, error: { message: "list error" } });
    await expect(listIdeas()).rejects.toThrow("list error");
  });

  it("createIdea inserta y devuelve la fila creada", async () => {
    single.mockResolvedValue({ data: { id: "2", titulo: "nueva idea" }, error: null });
    const result = await createIdea({
      fecha: "2026-07-01",
      pilar: "Tech",
      titulo: "nueva idea",
      hook: null,
      prioridad: "Alta",
      usada: false,
    } as never);
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ titulo: "nueva idea" }));
    expect(result).toEqual({ id: "2", titulo: "nueva idea" });
  });

  it("createIdea lanza si Supabase devuelve error", async () => {
    single.mockResolvedValue({ data: null, error: { message: "create error" } });
    await expect(createIdea({} as never)).rejects.toThrow("create error");
  });

  it("updateIdea actualiza y devuelve la fila actualizada", async () => {
    single.mockResolvedValue({ data: { id: "1", titulo: "idea actualizada" }, error: null });
    const result = await updateIdea("1", { titulo: "idea actualizada" });
    expect(from).toHaveBeenCalledWith("ideas");
    expect(update).toHaveBeenCalledWith({ titulo: "idea actualizada" });
    expect(updateEq).toHaveBeenCalledWith("id", "1");
    expect(result).toEqual({ id: "1", titulo: "idea actualizada" });
  });

  it("updateIdea lanza si Supabase devuelve error", async () => {
    single.mockResolvedValue({ data: null, error: { message: "update error" } });
    await expect(updateIdea("1", { titulo: "updated" })).rejects.toThrow("update error");
  });

  it("deleteIdea elimina la idea", async () => {
    deleteEq.mockResolvedValue({ error: null });
    await deleteIdea("1");
    expect(from).toHaveBeenCalledWith("ideas");
    expect(del).toHaveBeenCalled();
    expect(deleteEq).toHaveBeenCalledWith("id", "1");
  });

  it("deleteIdea lanza si Supabase devuelve error", async () => {
    deleteEq.mockResolvedValue({ error: { message: "delete error" } });
    await expect(deleteIdea("1")).rejects.toThrow("delete error");
  });
});
