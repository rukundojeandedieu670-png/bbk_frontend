import { getPartners } from "@/lib/api";
import { ResourceList } from "@/components/resource-pages";
export const dynamic = "force-dynamic";
export default async function PartnersPage() { const result = await getPartners(); return <ResourceList kind="partners" items={result.data ?? []} error={result.error} />; }
