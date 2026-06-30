"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarPorPilar } from "@/components/charts/bar-por-pilar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ESTADOS, PILARES, PILAR_COLOR } from "@/lib/constants";
import type { Post, Idea, Objetivo } from "@/lib/data/types";

interface Props {
  posts: Post[];
  ideas: Idea[];
  objetivos: Objetivo[];
}

export function DashboardClient({ posts, ideas, objetivos }: Props) {
  // --- Mes actual usando partes locales (no toISOString) ---
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const mes = `${yyyy}-${mm}`;

  const obj: Partial<Objetivo> = objetivos.find((o) => o.mes === mes) ?? {};

  // --- KPIs ---
  const tiktokFin = obj.tiktok_fin ?? 0;
  const tiktokInicio = obj.tiktok_inicio ?? 0;
  const tiktokDelta = tiktokFin - tiktokInicio;

  const igFin = obj.ig_fin ?? 0;
  const igInicio = obj.ig_inicio ?? 0;
  const igDelta = igFin - igInicio;

  const postsPublicados = posts.filter((p) => p.estado === "Publicado").length;
  const postsObjetivo = obj.posts_objetivo ?? 0;

  const ideasPendientes = ideas.filter((i) => !i.usada).length;

  // --- Distribución por pilar ---
  const pilarData = PILARES.map((pilar) => ({
    pilar,
    valor: posts.filter((p) => p.pilar === pilar).length,
    color: PILAR_COLOR[pilar],
  }));

  // --- Pipeline por estado ---
  const pipelineData = ESTADOS.map((estado) => ({
    estado,
    posts: posts.filter((p) => p.estado === estado).length,
  }));

  // --- Próximos posts (fecha >= hoy LOCAL, primeros 5) ---
  const dd = String(now.getDate()).padStart(2, "0");
  const hoy = `${yyyy}-${mm}-${dd}`;

  const proximosPosts = posts
    .filter((p) => p.fecha >= hoy)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              TikTok Seguidores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tiktokFin.toLocaleString()}</div>
            <p className={`text-xs mt-1 ${tiktokDelta >= 0 ? "text-green-500" : "text-red-500"}`}>
              {tiktokDelta >= 0 ? "+" : ""}
              {tiktokDelta.toLocaleString()} este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Instagram Seguidores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{igFin.toLocaleString()}</div>
            <p className={`text-xs mt-1 ${igDelta >= 0 ? "text-green-500" : "text-red-500"}`}>
              {igDelta >= 0 ? "+" : ""}
              {igDelta.toLocaleString()} este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Posts Publicados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{postsPublicados}</div>
            <p className="text-xs mt-1 text-muted-foreground">
              objetivo: {postsObjetivo}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ideas Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ideasPendientes}</div>
            <p className="text-xs mt-1 text-muted-foreground">sin usar</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Posts por Pilar</CardTitle>
          </CardHeader>
          <CardContent>
            <BarPorPilar data={pilarData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pipeline de Contenido</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={pipelineData}>
                <XAxis dataKey="estado" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} allowDecimals={false} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                <Bar dataKey="posts" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Próximos posts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Próximos Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {proximosPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay posts programados próximamente.</p>
          ) : (
            <ul className="space-y-2">
              {proximosPosts.map((post) => (
                <li key={post.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      style={{ backgroundColor: PILAR_COLOR[post.pilar], color: "#000" }}
                      className="text-xs"
                    >
                      {post.pilar}
                    </Badge>
                    <span className="text-sm">{post.titulo}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{post.fecha}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
