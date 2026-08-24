import { notFound } from "next/navigation";
import { ResourceDetail } from "@/components/resource-pages";
import { getPartner } from "@/lib/api";
export const dynamic = "force-dynamic";
export default async function PartnerDetail({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const result = await getPartner(slug); if (!result.data) notFound(); return <ResourceDetail kind="partners" item={result.data} />; }
