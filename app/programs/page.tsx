import { getPrograms } from "@/lib/api";
import { ResourceList } from "@/components/resource-pages";
export const dynamic = "force-dynamic";
export default async function ProgramsPage() { const result = await getPrograms(); return <ResourceList kind="programs" items={result.data ?? []} error={result.error} />; }
