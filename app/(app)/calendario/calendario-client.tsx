"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { PILAR_COLOR } from "@/lib/constants";
import type { Post } from "@/lib/data/types";
import { PostForm } from "@/components/posts/post-form";
import { deletePostAction } from "./actions";
import { toast } from "sonner";

// Local date helpers — avoid toISOString() to prevent UTC timezone shift
function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function diasDelMes(ref: Date): Date[] {
  const year = ref.getFullYear(), month = ref.getMonth();
  const primero = new Date(year, month, 1);
  const offset = (primero.getDay() + 6) % 7; // lunes=0
  const dias: Date[] = [];
  for (let i = 0; i < offset; i++) dias.push(new Date(year, month, i - offset + 1));
  const ultimo = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= ultimo; d++) dias.push(new Date(year, month, d));
  return dias;
}

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

type DialogState =
  | { kind: "closed" }
  | { kind: "create"; date: string }
  | { kind: "edit"; post: Post };

export function CalendarioClient({ posts }: { posts: Post[] }) {
  const now = new Date();
  const [refDate, setRefDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [dialog, setDialog] = useState<DialogState>({ kind: "closed" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const year = refDate.getFullYear();
  const month = refDate.getMonth();

  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const postsMes = posts.filter((p) => p.fecha.startsWith(monthPrefix));

  const dias = diasDelMes(refDate);

  function prevMes() {
    setRefDate(new Date(year, month - 1, 1));
  }
  function nextMes() {
    setRefDate(new Date(year, month + 1, 1));
  }

  function openCreate(date: string) {
    setDialog({ kind: "create", date });
  }

  function openEdit(post: Post) {
    setDialog({ kind: "edit", post });
  }

  function closeDialog() {
    setDialog({ kind: "closed" });
  }

  async function handleDelete(post: Post) {
    if (!confirm(`¿Eliminar "${post.titulo}"?`)) return;
    setDeletingId(post.id);
    try {
      await deletePostAction(post.id);
      toast.success("Post eliminado");
      closeDialog();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  }

  // Build a map date -> posts for fast lookup
  const postsByDate = new Map<string, Post[]>();
  for (const post of posts) {
    const key = post.fecha;
    if (!postsByDate.has(key)) postsByDate.set(key, []);
    postsByDate.get(key)!.push(post);
  }

  const isCurrentMonth = (d: Date) =>
    d.getFullYear() === year && d.getMonth() === month;

  return (
    <div className="space-y-6">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={prevMes}>
          ‹ Anterior
        </Button>
        <h2 className="text-lg font-semibold">
          {MESES[month]} {year}
        </h2>
        <Button variant="outline" size="sm" onClick={nextMes}>
          Siguiente ›
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="border rounded-lg overflow-x-auto">
        {/* Day headers */}
        <div className="grid min-w-[560px] grid-cols-7 bg-muted">
          {DIAS_SEMANA.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-medium py-2 text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid min-w-[560px] grid-cols-7 divide-x divide-y border-t">
          {dias.map((dia, idx) => {
            const key = ymd(dia);
            const dayPosts = postsByDate.get(key) ?? [];
            const inMonth = isCurrentMonth(dia);

            return (
              <div
                key={idx}
                className={`min-h-[80px] p-1 ${inMonth ? "cursor-pointer hover:bg-accent/50" : "bg-muted/30"}`}
                onClick={() => {
                  if (inMonth) openCreate(key);
                }}
              >
                <span
                  className={`text-xs font-medium ${inMonth ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {dia.getDate()}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayPosts.map((post) => (
                    <button
                      key={post.id}
                      className="w-full text-left text-xs truncate rounded px-1 py-0.5 font-medium leading-tight"
                      style={{
                        backgroundColor: PILAR_COLOR[post.pilar],
                        color: "#000",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(post);
                      }}
                      title={post.titulo}
                    >
                      {post.titulo}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Month table */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
          Posts de {MESES[month]} {year} ({postsMes.length})
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Plataforma</TableHead>
              <TableHead>Pilar</TableHead>
              <TableHead>Formato</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {postsMes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  No hay posts en {MESES[month]}. ¡Haz clic en un día para crear uno!
                </TableCell>
              </TableRow>
            )}
            {postsMes.map((post) => (
              <TableRow
                key={post.id}
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => openEdit(post)}
              >
                <TableCell>{post.fecha}</TableCell>
                <TableCell className="font-medium">{post.titulo}</TableCell>
                <TableCell>{post.plataforma}</TableCell>
                <TableCell>
                  <Badge
                    style={{
                      backgroundColor: PILAR_COLOR[post.pilar],
                      color: "#000",
                    }}
                  >
                    {post.pilar}
                  </Badge>
                </TableCell>
                <TableCell>{post.formato}</TableCell>
                <TableCell>
                  <Badge variant="outline">{post.estado}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog */}
      <Dialog open={dialog.kind !== "closed"} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog.kind === "edit" ? "Editar post" : "Nuevo post"}
            </DialogTitle>
          </DialogHeader>

          {dialog.kind === "create" && (
            <PostForm defaultDate={dialog.date} onDone={closeDialog} />
          )}

          {dialog.kind === "edit" && (
            <div className="space-y-4">
              <PostForm post={dialog.post} onDone={closeDialog} />
              <Button
                variant="destructive"
                className="w-full"
                disabled={deletingId === dialog.post.id}
                onClick={() => dialog.kind === "edit" && handleDelete(dialog.post)}
              >
                {deletingId === dialog.post.id ? "Eliminando…" : "Eliminar post"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
