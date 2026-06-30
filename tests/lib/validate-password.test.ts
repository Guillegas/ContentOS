import { describe, it, expect } from "vitest";
import { validatePassword } from "@/lib/validate-password";

describe("validatePassword", () => {
  it("rechaza menos de 8 caracteres", () => {
    expect(validatePassword("corta1", "corta1")).toMatch(/8 caracteres/);
  });
  it("rechaza si no coinciden", () => {
    expect(validatePassword("contraseña1", "contraseña2")).toMatch(/coinciden/);
  });
  it("acepta una contraseña válida y coincidente", () => {
    expect(validatePassword("Guille1234", "Guille1234")).toBeNull();
  });
  it("rechaza vacía", () => {
    expect(validatePassword("", "")).toMatch(/8 caracteres/);
  });
});
