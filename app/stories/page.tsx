import { getStories } from "@/lib/api";
import { ResourceList } from "@/components/resource-pages";
export const dynamic = "force-dynamic";
export default async function StoriesPage() { const result = await getStories(); return <ResourceList kind="stories" items={result.data ?? []} error={result.error} />; }
