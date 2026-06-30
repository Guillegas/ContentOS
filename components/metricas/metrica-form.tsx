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
import { PILARES, PLATAFORMAS } from "@/lib/constants";
import type { Metrica, MetricaInsert } from "@/lib/data/types";
import { addMetricaAction, updateMetricaAction } from "@/app/(app)/metricas/actions";

function localToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function MetricaForm({
  metrica,
  onDone,
}: {
  metrica?: Metrica;
  onDone: () => void;
}) {
  const [titulo, setTitulo] = useState(metrica?.titulo ?? "");
  const [fecha, setFecha] = useState(metrica?.fecha ?? localToday());
  const [plataforma, setPlataforma] = useState<string>(metrica?.plataforma ?? "TikTok");
  const [pilar, setPilar] = useState<string>(metrica?.pilar ?? "Tech");
  const [reproducciones, setReproducciones] = useState(String(metrica?.reproducciones ?? ""));
  const [likes, setLikes] = useState(String(metrica?.likes ?? ""));
  const [comentarios, setComentarios] = useState(String(metrica?.comentarios ?? ""));
  const [guardados, setGuardados] = useState(String(metrica?.guardados ?? ""));
  const [seguidores_ganados, setSeguidoresGanados] = useState(String(metrica?.seguidores_ganados ?? ""));
  const [puntuacion, setPuntuacion] = useState(String(metrica?.puntuacion ?? "3"));
  const [notas, setNotas] = useState(metrica?.notas ?? "");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload: MetricaInsert = {
      titulo,
      fecha,
      plataforma: plataforma as MetricaInsert["plataforma"],
      pilar: pilar as MetricaInsert["pilar"],
      reproducciones: Number(reproducciones) || 0,
      likes: Number(likes) || 0,
      comentarios: Number(comentarios) || 0,
      guardados: Number(guardados) || 0,
      seguidores_ganados: Number(seguidores_ganados) || 0,
      puntuacion: Number(puntuacion) || 3,
      notas: notas.trim() || null,
    };
    try {
      if (metrica) {
        await updateMetricaAction(metrica.id, payload);
      } else {
        await addMetricaAction(payload);
      }
      toast.success(metrica ? "Métrica actualizada" : "Métrica guardada");
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fecha">Fecha</Label>
          <Input
            id="fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Puntuación (1-5)</Label>
          <Input
            type="number"
            min={1}
            max={5}
            value={puntuacion}
            onChange={(e) => setPuntuacion(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Plataforma</Label>
          <Select value={plataforma} onValueChange={(v) => { if (v != null) setPlataforma(v); }}>
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reproducciones">Reproducciones</Label>
          <Input
            id="reproducciones"
            type="number"
            min={0}
            value={reproducciones}
            onChange={(e) => setReproducciones(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="likes">Likes</Label>
          <Input
            id="likes"
            type="number"
            min={0}
            value={likes}
            onChange={(e) => setLikes(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="comentarios">Comentarios</Label>
          <Input
            id="comentarios"
            type="number"
            min={0}
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="guardados">Guardados</Label>
          <Input
            id="guardados"
            type="number"
            min={0}
            value={guardados}
            onChange={(e) => setGuardados(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seguidores_ganados">Seguidores</Label>
          <Input
            id="seguidores_ganados"
            type="number"
            value={seguidores_ganados}
            onChange={(e) => setSeguidoresGanados(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notas">Notas</Label>
        <Textarea
          id="notas"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Observaciones opcionales..."
        />
      </div>

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "Guardando…" : "Guardar"}
      </Button>
    </form>
  );
}
