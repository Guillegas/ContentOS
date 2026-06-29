"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PILARES, PLATAFORMAS, FORMATOS, ESTADOS } from "@/lib/constants";
import type { Post, PostInsert } from "@/lib/data/types";
import { addPostAction, updatePostAction } from "@/app/(app)/calendario/actions";

interface PostFormProps {
  post?: Post;
  defaultDate?: string; // YYYY-MM-DD
  onDone: () => void;
}

export function PostForm({ post, defaultDate, onDone }: PostFormProps) {
  const today = new Date().toISOString().slice(0, 10);

  const [titulo, setTitulo] = useState(post?.titulo ?? "");
  const [fecha, setFecha] = useState(post?.fecha ?? defaultDate ?? today);
  const [plataforma, setPlataforma] = useState<string>(post?.plataforma ?? PLATAFORMAS[0]);
  const [pilar, setPilar] = useState<string>(post?.pilar ?? PILARES[0]);
  const [formato, setFormato] = useState<string>(post?.formato ?? FORMATOS[0]);
  const [estado, setEstado] = useState<string>(post?.estado ?? ESTADOS[0]);
  const [enlace, setEnlace] = useState(post?.enlace ?? "");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload: PostInsert = {
      titulo,
      fecha,
      plataforma: plataforma as PostInsert["plataforma"],
      pilar: pilar as PostInsert["pilar"],
      formato: formato as PostInsert["formato"],
      estado: estado as PostInsert["estado"],
      enlace: enlace || null,
    };
    try {
      if (post) {
        await updatePostAction(post.id, payload);
        toast.success("Post actualizado");
      } else {
        await addPostAction(payload);
        toast.success("Post creado");
      }
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
          disabled={saving}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fecha">Fecha</Label>
        <Input
          id="fecha"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
          disabled={saving}
        />
      </div>

      <div className="space-y-2">
        <Label>Plataforma</Label>
        <Select
          value={plataforma}
          onValueChange={(v) => { if (v != null) setPlataforma(v); }}
          disabled={saving}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PLATAFORMAS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Pilar</Label>
        <Select
          value={pilar}
          onValueChange={(v) => { if (v != null) setPilar(v); }}
          disabled={saving}
        >
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
        <Label>Formato</Label>
        <Select
          value={formato}
          onValueChange={(v) => { if (v != null) setFormato(v); }}
          disabled={saving}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FORMATOS.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Estado</Label>
        <Select
          value={estado}
          onValueChange={(v) => { if (v != null) setEstado(v); }}
          disabled={saving}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ESTADOS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="enlace">Enlace (opcional)</Label>
        <Input
          id="enlace"
          type="url"
          value={enlace}
          onChange={(e) => setEnlace(e.target.value)}
          placeholder="https://..."
          disabled={saving}
        />
      </div>

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "Guardando…" : "Guardar"}
      </Button>
    </form>
  );
}
