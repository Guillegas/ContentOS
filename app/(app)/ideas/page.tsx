import { listIdeas } from "@/lib/data/ideas";
import { AppHeader } from "@/components/app-header";
import { IdeasClient } from "./ideas-client";

export default async function IdeasPage() {
  const ideas = await listIdeas();
  return (
    <>
      <AppHeader title="Banco de Ideas" subtitle="Captura y prioriza tus ideas" />
      <div className="p-4 md:p-6">
        <IdeasClient ideas={ideas} />
      </div>
    </>
  );
}
