"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { PILARES, PILAR_COLOR } from "@/lib/constants";
import type { Idea } from "@/lib/data/types";
import { IdeaForm } from "@/components/ideas/idea-form";
import { deleteIdeaAction, updateIdeaAction } from "./actions";
import { toast } from "sonner";

type PilarFilter = "Todas" | (typeof PILARES)[number];

export function IdeasClient({ ideas }: { ideas: Idea[] }) {
  const [filtro, setFiltro] = useState<PilarFilter>("Todas");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | undefined>(undefined);

  const filtered =
    filtro === "Todas" ? ideas : ideas.filter((i) => i.pilar === filtro);

  const noUsadas = ideas.filter((i) => !i.usada).length;

  function openCreate() {
    setEditingIdea(undefined);
    setDialogOpen(true);
  }

  function openEdit(idea: Idea) {
    setEditingIdea(idea);
    setDialogOpen(true);
  }

  async function handleDelete(idea: Idea) {
    if (!confirm(`¿Eliminar "${idea.titulo}"?`)) return;
    try {
      await deleteIdeaAction(idea.id);
      toast.success("Idea eliminada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    }
  }

  async function handleToggleUsada(idea: Idea) {
    try {
      await updateIdeaAction(idea.id, { usada: !idea.usada });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar");
    }
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {noUsadas} idea{noUsadas !== 1 ? "s" : ""} sin usar
        </p>
        <Button onClick={openCreate}>Nueva idea</Button>
      </div>

      {/* Pilar filter */}
      <div className="flex gap-2 flex-wrap">
        {(["Todas", ...PILARES] as PilarFilter[]).map((p) => (
          <Button
            key={p}
            variant={filtro === p ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltro(p)}
          >
            {p}
          </Button>
        ))}
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Pilar</TableHead>
            <TableHead>Hook</TableHead>
            <TableHead>Prioridad</TableHead>
            <TableHead>Usada</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No hay ideas{filtro !== "Todas" ? ` en ${filtro}` : ""}. ¡Crea la primera!
              </TableCell>
            </TableRow>
          )}
          {filtered.map((idea) => (
            <TableRow key={idea.id}>
              <TableCell className="font-medium">{idea.titulo}</TableCell>
              <TableCell>
                <Badge
                  style={{
                    backgroundColor: PILAR_COLOR[idea.pilar],
                    color: "#000",
                  }}
                >
                  {idea.pilar}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-muted-foreground">
                {idea.hook ?? "—"}
              </TableCell>
              <TableCell>{idea.prioridad}</TableCell>
              <TableCell>
                <Checkbox
                  checked={idea.usada}
                  onCheckedChange={() => handleToggleUsada(idea)}
                />
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(idea)}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(idea)}
                >
                  Eliminar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIdea ? "Editar idea" : "Nueva idea"}
            </DialogTitle>
          </DialogHeader>
          <IdeaForm
            idea={editingIdea}
            onDone={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
