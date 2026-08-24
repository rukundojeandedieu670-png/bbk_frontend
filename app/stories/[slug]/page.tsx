import { notFound } from "next/navigation";
import { ResourceDetail } from "@/components/resource-pages";
import { getStory } from "@/lib/api";
export const dynamic = "force-dynamic";
export default async function StoryDetail({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const result = await getStory(slug); if (!result.data) notFound(); return <ResourceDetail kind="stories" item={result.data} />; }
