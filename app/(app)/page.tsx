import { listPosts } from "@/lib/data/posts";
import { listIdeas } from "@/lib/data/ideas";
import { listObjetivos } from "@/lib/data/objetivos";
import { AppHeader } from "@/components/app-header";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const [posts, ideas, objetivos] = await Promise.all([
    listPosts(),
    listIdeas(),
    listObjetivos(),
  ]);
  return (
    <>
      <AppHeader title="Dashboard" subtitle="Resumen general de tu actividad" />
      <div className="p-4 md:p-6">
        <DashboardClient posts={posts} ideas={ideas} objetivos={objetivos} />
      </div>
    </>
  );
}
