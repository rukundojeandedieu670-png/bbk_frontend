import { notFound } from "next/navigation";
import { ResourceDetail } from "@/components/resource-pages";
import { getNewsPost } from "@/lib/api";
export default async function NewsDetail({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const result = await getNewsPost(slug); if (!result.data) notFound(); return <ResourceDetail kind="news" item={result.data} />; }
