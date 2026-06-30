import type { Pilar, Plataforma, Formato, Estado, Prioridad } from "@/lib/constants";

export interface Post {
  id: string;
  fecha: string;          // YYYY-MM-DD
  plataforma: Plataforma;
  pilar: Pilar;
  formato: Formato;
  titulo: string;
  estado: Estado;
  enlace: string | null;
  created_at: string;
}
export type PostInsert = Omit<Post, "id" | "created_at">;

export interface Idea {
  id: string;
  fecha: string;
  pilar: Pilar;
  titulo: string;
  hook: string | null;
  prioridad: Prioridad;
  usada: boolean;
  created_at: string;
}
export type IdeaInsert = Omit<Idea, "id" | "created_at">;

export interface Metrica {
  id: string;
  fecha: string;
  titulo: string;
  plataforma: Plataforma;
  pilar: Pilar;
  reproducciones: number;
  likes: number;
  comentarios: number;
  guardados: number;
  seguidores_ganados: number;
  puntuacion: number;     // 1..5
  notas: string | null;
  created_at: string;
}
export type MetricaInsert = Omit<Metrica, "id" | "created_at">;

export interface Objetivo {
  id: string;
  mes: string;            // YYYY-MM
  tiktok_inicio: number;
  tiktok_fin: number;
  ig_inicio: number;
  ig_fin: number;
  posts_objetivo: number;
  posts_publicados: number;
  mejor_post: string | null;
  aprendizajes: string | null;
  created_at: string;
}
export type ObjetivoInsert = Omit<Objetivo, "id" | "created_at">;
