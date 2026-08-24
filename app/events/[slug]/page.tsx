import { notFound } from "next/navigation";
import { ResourceDetail } from "@/components/resource-pages";
import { getEvent } from "@/lib/api";
export const dynamic = "force-dynamic";
export default async function EventDetail({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const result = await getEvent(slug); if (!result.data) notFound(); return <ResourceDetail kind="events" item={result.data} />; }
