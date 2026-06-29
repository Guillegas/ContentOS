"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PILARES, PILAR_COLOR } from "@/lib/constants";
import type { Metrica, Objetivo } from "@/lib/data/types";
import { MetricaForm } from "@/components/metricas/metrica-form";
import { ObjetivoForm } from "@/components/metricas/objetivo-form";
import { BarPorPilar } from "@/components/charts/bar-por-pilar";
import { deleteMetricaAction, deleteObjetivoAction } from "./actions";

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export function MetricasClient({
  metricas,
  objetivos,
}: {
  metricas: Metrica[];
  objetivos: Objetivo[];
}) {
  // Métrica CRUD state
  const [metricaDialogOpen, setMetricaDialogOpen] = useState(false);
  const [editingMetrica, setEditingMetrica] = useState<Metrica | undefined>(undefined);
  const [pendingMetricaIds, setPendingMetricaIds] = useState<Set<string>>(new Set());

  // Objetivo CRUD state
  const [objetivoDialogOpen, setObjetivoDialogOpen] = useState(false);
  const [editingObjetivo, setEditingObjetivo] = useState<Objetivo | undefined>(undefined);
  const [pendingObjetivoIds, setPendingObjetivoIds] = useState<Set<string>>(new Set());

  // ---- Aggregations ----

  // 1. Reproducciones por pilar → BarPorPilar
  const reporPilarMap: Record<string, number> = {};
  for (const m of metricas) {
    reporPilarMap[m.pilar] = (reporPilarMap[m.pilar] ?? 0) + m.reproducciones;
  }
  const barPilarData = PILARES.map((pilar) => ({
    pilar,
    valor: reporPilarMap[pilar] ?? 0,
    color: PILAR_COLOR[pilar],
  }));

  // 2. Reproducciones en el tiempo (LineChart por fecha)
  const repOverTime = [...metricas]
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .map((m) => ({
      fecha: m.fecha.slice(5), // MM-DD
      reproducciones: m.reproducciones,
      titulo: m.titulo,
    }));

  // 3. Distribución likes / comentarios / guardados (BarChart by titulo)
  const distribucionData = [...metricas]
    .sort((a, b) => b.likes + b.comentarios + b.guardados - (a.likes + a.comentarios + a.guardados))
    .slice(0, 10)
    .map((m) => ({
      titulo: m.titulo.slice(0, 20),
      likes: m.likes,
      comentarios: m.comentarios,
      guardados: m.guardados,
    }));

  // ---- Handlers ----

  function openCreateMetrica() {
    setEditingMetrica(undefined);
    setMetricaDialogOpen(true);
  }

  function openEditMetrica(m: Metrica) {
    setEditingMetrica(m);
    setMetricaDialogOpen(true);
  }

  async function handleDeleteMetrica(m: Metrica) {
    if (!confirm(`¿Eliminar métrica "${m.titulo}"?`)) return;
    setPendingMetricaIds((prev) => new Set(prev).add(m.id));
    try {
      await deleteMetricaAction(m.id);
      toast.success("Métrica eliminada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setPendingMetricaIds((prev) => {
        const n = new Set(prev);
        n.delete(m.id);
        return n;
      });
    }
  }

  function openCreateObjetivo() {
    setEditingObjetivo(undefined);
    setObjetivoDialogOpen(true);
  }

  function openEditObjetivo(o: Objetivo) {
    setEditingObjetivo(o);
    setObjetivoDialogOpen(true);
  }

  async function handleDeleteObjetivo(o: Objetivo) {
    if (!confirm(`¿Eliminar objetivo del mes ${o.mes}?`)) return;
    setPendingObjetivoIds((prev) => new Set(prev).add(o.id));
    try {
      await deleteObjetivoAction(o.id);
      toast.success("Objetivo eliminado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setPendingObjetivoIds((prev) => {
        const n = new Set(prev);
        n.delete(o.id);
        return n;
      });
    }
  }

  return (
    <div className="space-y-8">
      {/* ---- Gráficas ---- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Reproducciones por pilar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Reproducciones por pilar</CardTitle>
          </CardHeader>
          <CardContent>
            <BarPorPilar data={barPilarData} />
          </CardContent>
        </Card>

        {/* 2. Reproducciones en el tiempo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Evolución de reproducciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={repOverTime}>
                <XAxis dataKey="fecha" stroke="#888" fontSize={11} />
                <YAxis stroke="#888" fontSize={11} tickFormatter={fmt} />
                <Tooltip formatter={(v) => fmt(Number(v))} />
                <Line
                  type="monotone"
                  dataKey="reproducciones"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 3. Distribución likes / comentarios / guardados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Distribución engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={distribucionData} layout="vertical">
                <XAxis type="number" stroke="#888" fontSize={11} />
                <YAxis type="category" dataKey="titulo" stroke="#888" fontSize={10} width={80} />
                <Tooltip />
                <Bar dataKey="likes" stackId="a" fill="#f472b6" radius={0} />
                <Bar dataKey="comentarios" stackId="a" fill="#a78bfa" radius={0} />
                <Bar dataKey="guardados" stackId="a" fill="#22d3ee" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ---- Tabla de Métricas ---- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Registro de métricas</h2>
          <Button onClick={openCreateMetrica}>Nueva métrica</Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Plataforma</TableHead>
              <TableHead>Pilar</TableHead>
              <TableHead className="text-right">Reprod.</TableHead>
              <TableHead className="text-right">Likes</TableHead>
              <TableHead className="text-right">Coment.</TableHead>
              <TableHead className="text-right">Guard.</TableHead>
              <TableHead className="text-right">Seguids.</TableHead>
              <TableHead className="text-center">Punt.</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metricas.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                  No hay métricas. ¡Registra la primera!
                </TableCell>
              </TableRow>
            )}
            {metricas.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {m.fecha}
                </TableCell>
                <TableCell className="font-medium max-w-[160px] truncate">
                  {m.titulo}
                </TableCell>
                <TableCell>{m.plataforma}</TableCell>
                <TableCell>
                  <Badge
                    style={{ backgroundColor: PILAR_COLOR[m.pilar], color: "#000" }}
                  >
                    {m.pilar}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{fmt(m.reproducciones)}</TableCell>
                <TableCell className="text-right">{fmt(m.likes)}</TableCell>
                <TableCell className="text-right">{m.comentarios}</TableCell>
                <TableCell className="text-right">{m.guardados}</TableCell>
                <TableCell className="text-right">{m.seguidores_ganados}</TableCell>
                <TableCell className="text-center">{"★".repeat(m.puntuacion)}</TableCell>
                <TableCell className="text-right space-x-2 whitespace-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditMetrica(m)}
                    disabled={pendingMetricaIds.has(m.id)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteMetrica(m)}
                    disabled={pendingMetricaIds.has(m.id)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ---- Cards de Objetivos ---- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Objetivos mensuales</h2>
          <Button onClick={openCreateObjetivo}>Nuevo objetivo</Button>
        </div>

        {objetivos.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No hay objetivos. ¡Crea el primero!
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {objetivos.map((o) => {
            const tiktokDiff = o.tiktok_fin - o.tiktok_inicio;
            const igDiff = o.ig_fin - o.ig_inicio;
            const postsPct =
              o.posts_objetivo > 0
                ? Math.round((o.posts_publicados / o.posts_objetivo) * 100)
                : 0;
            return (
              <Card key={o.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{o.mes}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditObjetivo(o)}
                        disabled={pendingObjetivoIds.has(o.id)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteObjetivo(o)}
                        disabled={pendingObjetivoIds.has(o.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">TikTok:</span>{" "}
                    {o.tiktok_inicio} → {o.tiktok_fin}{" "}
                    <span className={tiktokDiff >= 0 ? "text-emerald-500" : "text-rose-500"}>
                      ({tiktokDiff >= 0 ? "+" : ""}
                      {tiktokDiff})
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Instagram:</span>{" "}
                    {o.ig_inicio} → {o.ig_fin}{" "}
                    <span className={igDiff >= 0 ? "text-emerald-500" : "text-rose-500"}>
                      ({igDiff >= 0 ? "+" : ""}
                      {igDiff})
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Posts:</span>{" "}
                    {o.posts_publicados}/{o.posts_objetivo} ({postsPct}%)
                  </p>
                  {o.mejor_post && (
                    <p className="truncate">
                      <span className="text-muted-foreground">Mejor post:</span>{" "}
                      {o.mejor_post}
                    </p>
                  )}
                  {o.aprendizajes && (
                    <p className="text-muted-foreground line-clamp-2 italic">
                      {o.aprendizajes}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Métrica Dialog */}
      <Dialog open={metricaDialogOpen} onOpenChange={setMetricaDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMetrica ? "Editar métrica" : "Nueva métrica"}
            </DialogTitle>
          </DialogHeader>
          <MetricaForm
            metrica={editingMetrica}
            onDone={() => setMetricaDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Objetivo Dialog */}
      <Dialog open={objetivoDialogOpen} onOpenChange={setObjetivoDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingObjetivo ? "Editar objetivo" : "Nuevo objetivo"}
            </DialogTitle>
          </DialogHeader>
          <ObjetivoForm
            objetivo={editingObjetivo}
            onDone={() => setObjetivoDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
