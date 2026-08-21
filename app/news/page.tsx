import { getNewsPosts } from "@/lib/api";
import { ResourceList } from "@/components/resource-pages";
export const dynamic = "force-dynamic";
export default async function NewsPage() { const result = await getNewsPosts(); return <ResourceList kind="news" items={result.data ?? []} error={result.error} />; }
