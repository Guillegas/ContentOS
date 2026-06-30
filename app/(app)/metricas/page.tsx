import { listMetricas } from "@/lib/data/metricas";
import { listObjetivos } from "@/lib/data/objetivos";
import { AppHeader } from "@/components/app-header";
import { MetricasClient } from "./metricas-client";

export default async function MetricasPage() {
  const [metricas, objetivos] = await Promise.all([listMetricas(), listObjetivos()]);
  return (
    <>
      <AppHeader title="Métricas y Objetivos" subtitle="Mide tu rendimiento" />
      <div className="p-4 md:p-6">
        <MetricasClient metricas={metricas} objetivos={objetivos} />
      </div>
    </>
  );
}
