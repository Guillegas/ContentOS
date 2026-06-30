import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock for listPosts: from().select().order()
const order = vi.fn();
const select = vi.fn(() => ({ order }));

// Shared mock for single() - used by both insert and update chains
const single = vi.fn();

// Mock for createPost: from().insert().select().single()
const insertSelect = vi.fn(() => ({ single }));
const insert = vi.fn(() => ({ select: insertSelect }));

// Mock for updatePost: from().update(patch).eq("id", id).select().single()
const updateSelect = vi.fn(() => ({ single }));
const updateEq = vi.fn(() => ({ select: updateSelect }));
const update = vi.fn((patch) => ({ eq: updateEq }));

// Mock for deletePost: from().delete().eq("id", id)
const deleteEq = vi.fn();
const del = vi.fn(() => ({ eq: deleteEq }));

// Main from() function returns object with all methods
const from = vi.fn(() => ({ select, insert, update, delete: del }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from })),
}));

import { listPosts, createPost, updatePost, deletePost } from "@/lib/data/posts";

beforeEach(() => vi.clearAllMocks());

describe("posts data layer", () => {
  it("listPosts devuelve los posts ordenados por fecha", async () => {
    order.mockResolvedValue({ data: [{ id: "1", titulo: "x" }], error: null });
    const result = await listPosts();
    expect(from).toHaveBeenCalledWith("posts");
    expect(order).toHaveBeenCalledWith("fecha", { ascending: true });
    expect(result).toEqual([{ id: "1", titulo: "x" }]);
  });

  it("createPost inserta y devuelve la fila creada", async () => {
    single.mockResolvedValue({ data: { id: "2", titulo: "nuevo" }, error: null });
    const result = await createPost({
      fecha: "2026-07-01", plataforma: "TikTok", pilar: "Tech",
      formato: "Reel", titulo: "nuevo", estado: "Idea", enlace: null, owner_id: "",
    } as never);
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ titulo: "nuevo" }));
    expect(result).toEqual({ id: "2", titulo: "nuevo" });
  });

  it("createPost lanza si Supabase devuelve error", async () => {
    single.mockResolvedValue({ data: null, error: { message: "boom" } });
    await expect(createPost({} as never)).rejects.toThrow("boom");
  });

  it("updatePost actualiza y devuelve la fila actualizada", async () => {
    single.mockResolvedValue({ data: { id: "1", titulo: "updated" }, error: null });
    const result = await updatePost("1", { titulo: "updated" });
    expect(from).toHaveBeenCalledWith("posts");
    expect(update).toHaveBeenCalledWith({ titulo: "updated" });
    expect(updateEq).toHaveBeenCalledWith("id", "1");
    expect(result).toEqual({ id: "1", titulo: "updated" });
  });

  it("updatePost lanza si Supabase devuelve error", async () => {
    single.mockResolvedValue({ data: null, error: { message: "update error" } });
    await expect(updatePost("1", { titulo: "updated" })).rejects.toThrow("update error");
  });

  it("deletePost elimina el post", async () => {
    deleteEq.mockResolvedValue({ error: null });
    await deletePost("1");
    expect(from).toHaveBeenCalledWith("posts");
    expect(del).toHaveBeenCalled();
    expect(deleteEq).toHaveBeenCalledWith("id", "1");
  });

  it("deletePost lanza si Supabase devuelve error", async () => {
    deleteEq.mockResolvedValue({ error: { message: "delete error" } });
    await expect(deletePost("1")).rejects.toThrow("delete error");
  });
});
