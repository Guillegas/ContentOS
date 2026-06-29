"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PILARES, PRIORIDADES } from "@/lib/constants";
import type { Idea, IdeaInsert } from "@/lib/data/types";
import { addIdeaAction, updateIdeaAction } from "@/app/(app)/ideas/actions";

export function IdeaForm({ idea, onDone }: { idea?: Idea; onDone: () => void }) {
  const [titulo, setTitulo] = useState(idea?.titulo ?? "");
  const [pilar, setPilar] = useState<string>(idea?.pilar ?? "Tech");
  const [hook, setHook] = useState(idea?.hook ?? "");
  const [prioridad, setPrioridad] = useState<string>(idea?.prioridad ?? "Media");
  const [fecha, setFecha] = useState(
    idea?.fecha ?? new Date().toISOString().slice(0, 10)
  );
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      titulo,
      pilar,
      hook: hook || null,
      prioridad,
      fecha,
      usada: idea?.usada ?? false,
    } as IdeaInsert;
    try {
      if (idea) {
        await updateIdeaAction(idea.id, payload);
      } else {
        await addIdeaAction(payload);
      }
      toast.success(idea ? "Idea actualizada" : "Idea guardada");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="titulo">Título</Label>
        <Input
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Pilar</Label>
        <Select value={pilar} onValueChange={(v) => { if (v != null) setPilar(v); }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PILARES.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="hook">Hook</Label>
        <Textarea
          id="hook"
          value={hook}
          onChange={(e) => setHook(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Prioridad</Label>
        <Select value={prioridad} onValueChange={(v) => { if (v != null) setPrioridad(v); }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORIDADES.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="fecha">Fecha</Label>
        <Input
          id="fecha"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "Guardando…" : "Guardar"}
      </Button>
    </form>
  );
}
