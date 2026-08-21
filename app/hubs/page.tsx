import { getHubs } from "@/lib/api";
import { ResourceList } from "@/components/resource-pages";
export const dynamic = "force-dynamic";
export default async function HubsPage() { const result = await getHubs(); return <ResourceList kind="hubs" items={result.data ?? []} error={result.error} />; }
