export const PILARES = ["Tech", "Emprendimiento", "Lifestyle"] as const;
export const PLATAFORMAS = ["TikTok", "Instagram", "Ambas"] as const;
export const FORMATOS = ["Reel", "Carrusel", "Story", "Foto"] as const;
export const ESTADOS = ["Idea", "Grabado", "Editado", "Publicado"] as const;
export const PRIORIDADES = ["Alta", "Media", "Baja"] as const;

export type Pilar = (typeof PILARES)[number];
export type Plataforma = (typeof PLATAFORMAS)[number];
export type Formato = (typeof FORMATOS)[number];
export type Estado = (typeof ESTADOS)[number];
export type Prioridad = (typeof PRIORIDADES)[number];

export const PILAR_COLOR: Record<Pilar, string> = {
  Tech: "#22d3ee",            // cian
  Emprendimiento: "#a78bfa",  // violeta
  Lifestyle: "#f472b6",       // rosa
};
