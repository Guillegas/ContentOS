export function validatePassword(nueva: string, confirmar: string): string | null {
  if (nueva.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (nueva !== confirmar) return "Las contraseñas no coinciden.";
  return null;
}
