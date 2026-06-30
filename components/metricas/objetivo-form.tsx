"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Objetivo, ObjetivoInsert } from "@/lib/data/types";
import { addObjetivoAction, updateObjetivoAction } from "@/app/(app)/metricas/actions";

function localMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function ObjetivoForm({
  objetivo,
  onDone,
}: {
  objetivo?: Objetivo;
  onDone: () => void;
}) {
  const [mes, setMes] = useState(objetivo?.mes ?? localMonth());
  const [tiktokInicio, setTiktokInicio] = useState(String(objetivo?.tiktok_inicio ?? ""));
  const [tiktokFin, setTiktokFin] = useState(String(objetivo?.tiktok_fin ?? ""));
  const [igInicio, setIgInicio] = useState(String(objetivo?.ig_inicio ?? ""));
  const [igFin, setIgFin] = useState(String(objetivo?.ig_fin ?? ""));
  const [postsObjetivo, setPostsObjetivo] = useState(String(objetivo?.posts_objetivo ?? ""));
  const [postsPublicados, setPostsPublicados] = useState(String(objetivo?.posts_publicados ?? ""));
  const [mejorPost, setMejorPost] = useState(objetivo?.mejor_post ?? "");
  const [aprendizajes, setAprendizajes] = useState(objetivo?.aprendizajes ?? "");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload: ObjetivoInsert = {
      mes,
      tiktok_inicio: Number(tiktokInicio) || 0,
      tiktok_fin: Number(tiktokFin) || 0,
      ig_inicio: Number(igInicio) || 0,
      ig_fin: Number(igFin) || 0,
      posts_objetivo: Number(postsObjetivo) || 0,
      posts_publicados: Number(postsPublicados) || 0,
      mejor_post: mejorPost.trim() || null,
      aprendizajes: aprendizajes.trim() || null,
    };
    try {
      if (objetivo) {
        await updateObjetivoAction(objetivo.id, payload);
      } else {
        await addObjetivoAction(payload);
      }
      toast.success(objetivo ? "Objetivo actualizado" : "Objetivo guardado");
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
        <Label htmlFor="mes">Mes</Label>
        <Input
          id="mes"
          type="month"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tiktok_inicio">TikTok seguidores inicio</Label>
          <Input
            id="tiktok_inicio"
            type="number"
            min={0}
            value={tiktokInicio}
            onChange={(e) => setTiktokInicio(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tiktok_fin">TikTok seguidores fin</Label>
          <Input
            id="tiktok_fin"
            type="number"
            min={0}
            value={tiktokFin}
            onChange={(e) => setTiktokFin(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ig_inicio">Instagram seguidores inicio</Label>
          <Input
            id="ig_inicio"
            type="number"
            min={0}
            value={igInicio}
            onChange={(e) => setIgInicio(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ig_fin">Instagram seguidores fin</Label>
          <Input
            id="ig_fin"
            type="number"
            min={0}
            value={igFin}
            onChange={(e) => setIgFin(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="posts_objetivo">Posts objetivo</Label>
          <Input
            id="posts_objetivo"
            type="number"
            min={0}
            value={postsObjetivo}
            onChange={(e) => setPostsObjetivo(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="posts_publicados">Posts publicados</Label>
          <Input
            id="posts_publicados"
            type="number"
            min={0}
            value={postsPublicados}
            onChange={(e) => setPostsPublicados(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mejor_post">Mejor post</Label>
        <Input
          id="mejor_post"
          value={mejorPost}
          onChange={(e) => setMejorPost(e.target.value)}
          placeholder="Título o enlace del mejor post..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="aprendizajes">Aprendizajes</Label>
        <Textarea
          id="aprendizajes"
          value={aprendizajes}
          onChange={(e) => setAprendizajes(e.target.value)}
          placeholder="¿Qué aprendiste este mes?"
        />
      </div>

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "Guardando…" : "Guardar"}
      </Button>
    </form>
  );
}
