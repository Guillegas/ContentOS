"use client";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { validatePassword } from "@/lib/validate-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const error = validatePassword(nueva, confirmar);
    if (error) {
      toast.error(error);
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error: sbError } = await supabase.auth.updateUser({ password: nueva });
    setSaving(false);
    if (sbError) {
      toast.error(sbError.message);
      return;
    }
    toast.success("Contraseña actualizada");
    setNueva("");
    setConfirmar("");
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nueva">Nueva contraseña</Label>
        <Input
          id="nueva"
          type="password"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmar">Confirmar contraseña</Label>
        <Input
          id="confirmar"
          type="password"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? "Guardando…" : "Cambiar contraseña"}
      </Button>
    </form>
  );
}
