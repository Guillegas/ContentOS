import { describe, it, expect } from "vitest";
import { PILARES, PLATAFORMAS, FORMATOS, ESTADOS, PRIORIDADES, PILAR_COLOR } from "@/lib/constants";

describe("constants", () => {
  it("define los pilares exactos", () => {
    expect(PILARES).toEqual(["Tech", "Emprendimiento", "Lifestyle"]);
  });
  it("define plataformas, formatos, estados y prioridades", () => {
    expect(PLATAFORMAS).toEqual(["TikTok", "Instagram", "Ambas"]);
    expect(FORMATOS).toEqual(["Reel", "Carrusel", "Story", "Foto"]);
    expect(ESTADOS).toEqual(["Idea", "Grabado", "Editado", "Publicado"]);
    expect(PRIORIDADES).toEqual(["Alta", "Media", "Baja"]);
  });
  it("asigna un color por pilar", () => {
    expect(PILAR_COLOR.Tech).toMatch(/^#|^hsl|^rgb/);
    expect(Object.keys(PILAR_COLOR)).toEqual(["Tech", "Emprendimiento", "Lifestyle"]);
  });
});
