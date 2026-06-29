import { describe, it, expect, vi, beforeEach } from "vitest";

const order = vi.fn();
const select = vi.fn(() => ({ order }));
const single = vi.fn();
const insertSelect = vi.fn(() => ({ single }));
const insert = vi.fn(() => ({ select: insertSelect }));
const from = vi.fn(() => ({ select, insert }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from })),
}));

import { listPosts, createPost } from "@/lib/data/posts";

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
    expect(insert).toHaveBeenCalled();
    expect(result).toEqual({ id: "2", titulo: "nuevo" });
  });

  it("createPost lanza si Supabase devuelve error", async () => {
    single.mockResolvedValue({ data: null, error: { message: "boom" } });
    await expect(createPost({} as never)).rejects.toThrow("boom");
  });
});
