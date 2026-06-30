import { listPosts } from "@/lib/data/posts";
import { AppHeader } from "@/components/app-header";
import { CalendarioClient } from "./calendario-client";

export default async function CalendarioPage() {
  const posts = await listPosts();
  return (
    <>
      <AppHeader title="Calendario Editorial" subtitle="Planifica y organiza tus publicaciones" />
      <div className="p-4 md:p-6">
        <CalendarioClient posts={posts} />
      </div>
    </>
  );
}
