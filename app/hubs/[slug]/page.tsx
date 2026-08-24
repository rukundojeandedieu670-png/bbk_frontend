import { notFound } from "next/navigation";
import { ResourceDetail } from "@/components/resource-pages";
import { getHub } from "@/lib/api";
export const dynamic = "force-dynamic";
export default async function HubDetail({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const result = await getHub(slug); if (!result.data) notFound(); return <ResourceDetail kind="hubs" item={result.data} />; }
