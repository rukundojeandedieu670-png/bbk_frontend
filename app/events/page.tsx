import { getEvents } from "@/lib/api";
import { ResourceList } from "@/components/resource-pages";
export const dynamic = "force-dynamic";
export default async function EventsPage() { const result = await getEvents(); return <ResourceList kind="events" items={result.data ?? []} error={result.error} />; }
