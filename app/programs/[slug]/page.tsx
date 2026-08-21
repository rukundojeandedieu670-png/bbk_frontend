import { notFound } from "next/navigation";
import { ResourceDetail } from "@/components/resource-pages";
import { getProgram } from "@/lib/api";
export default async function ProgramDetail({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const result = await getProgram(slug); if (!result.data) notFound(); return <ResourceDetail kind="programs" item={result.data} />; }
