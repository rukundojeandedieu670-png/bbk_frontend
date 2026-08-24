import Link from "next/link";
import Image from "next/image";
import { resolveMediaUrl } from "@/lib/api";
import type { Event, Hub, MediaAsset, NewsPost, Partner, Program, Story } from "@/types";
import { SiteFooter } from "@/components/site-footer";

type Resource = Hub | Program | Story | Event | Partner | NewsPost;
type ResourceKind = "hubs" | "programs" | "stories" | "events" | "partners" | "news";

const labels: Record<ResourceKind, string> = { hubs: "Find your court", programs: "Our work", stories: "From the Bridge", events: "On the calendar", partners: "With gratitude", news: "Latest news" };
const titles: Record<ResourceKind, string> = { hubs: "Hubs", programs: "Programs", stories: "Stories", events: "Events", partners: "Partners", news: "News" };
const resourcePath: Record<ResourceKind, string> = { hubs: "hubs", programs: "programs", stories: "stories", events: "events", partners: "partners", news: "news" };

export function ResourceList({ kind, items, error }: { kind: ResourceKind; items: Resource[]; error?: string | null }) {
  return <><main className="min-h-screen bg-[var(--surface-sand)] pb-24 pt-36"><div className="container-wide"><Link href="/" className="text-sm font-bold text-[var(--brand)]">← Back home</Link><p className="eyebrow mt-14">{labels[kind]}</p><h1 className="display mt-3 text-5xl font-bold md:text-7xl">{titles[kind]}</h1>{error && <div className="mt-12 border-l-4 border-[var(--accent)] bg-white p-6 text-[var(--muted)]">{error}</div>}{!error && items.length === 0 && <div className="mt-12 bg-white p-8 text-[var(--muted)]">Nothing here yet. Check back soon.</div>}<div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{items.map((item) => <ResourceCard key={item.id} kind={kind} item={item} />)}</div></div></main><SiteFooter /></>;
}

function ResourceCard({ kind, item }: { kind: ResourceKind; item: Resource }) {
  const title = "title" in item ? item.title : item.name;
  const description = "summary" in item ? item.summary : "description" in item ? item.description : "body" in item ? item.body : undefined;
  const slug = "slug" in item ? item.slug : String(item.id);
  const date = "startsAt" in item ? item.startsAt : "publishedAt" in item ? item.publishedAt : undefined;
  const image = "media" in item ? item.media?.find((asset) => asset.type === "image" && asset.url) : undefined;
  return <Link href={`/${resourcePath[kind]}/${slug}`} className="group bg-white p-7 transition hover:-translate-y-1 hover:shadow-xl">{image?.url && <Image className="resource-card-image" src={resolveMediaUrl(image.url, image.id) ?? image.url} alt={image.altText ?? String(title)} width={800} height={500} unoptimized />}<p className="eyebrow mt-6">{date ? new Date(date).toLocaleDateString("en-GB", { dateStyle: "medium" }) : labels[kind]}</p><h2 className="display mt-12 text-2xl font-bold group-hover:text-[var(--brand)]">{title}</h2>{description && <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--muted)]">{description}</p>}<span className="mt-8 inline-block text-sm font-bold text-[var(--brand)]">View details ↗</span></Link>;
}

export function ResourceDetail({ kind, item }: { kind: ResourceKind; item: Resource }) {
  const title = "title" in item ? item.title : item.name;
  const body = "body" in item ? item.body : "description" in item ? item.description : "summary" in item ? item.summary : undefined;
  const mediaOwner = ("media" in item ? item : null) as (Hub | Program | Story | Event | Partner | NewsPost | null);
  const coverImage = "coverImage" in item ? item.coverImage : null;
  return <><main className="min-h-screen bg-[var(--surface-sand)] pb-24 pt-36"><div className="container-wide max-w-5xl"><Link href={`/${resourcePath[kind]}`} className="text-sm font-bold text-[var(--brand)]">← All {titles[kind]}</Link>{coverImage && <CoverMediaHero title={title} url={coverImage} />}<p className="eyebrow mt-16">{labels[kind]}</p><h1 className="display mt-4 text-5xl font-bold leading-tight md:text-7xl">{title}</h1><p className="mt-12 max-w-2xl whitespace-pre-line text-lg leading-8 text-[var(--muted)]">{body ?? "More details about this BBK resource will be available soon."}</p>{mediaOwner?.media && <MediaGallery media={mediaOwner.media} />}</div></main><SiteFooter /></>;
}

function CoverMediaHero({ title, url }: { title: string; url: string }) {
  return <div className="media-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(9,37,56,.8), rgba(9,37,56,.1)), url(${url})` }} role="img" aria-label={title} />;
}

function MediaGallery({ media }: { media: MediaAsset[] }) {
  if (!media.length) return null;
  return <section className="media-gallery" aria-label="Resource media"><h2 className="display text-3xl font-bold">Images</h2><div className="media-grid">{media.map((asset) => { const url = resolveMediaUrl(asset.url, asset.id); return url ? asset.type === "video" ? <video className="media-item" controls preload="metadata" key={asset.id} src={url}>{asset.altText}</video> : <Image className="media-image" key={asset.id} src={url} alt={asset.altText ?? "BBK resource image"} width={1200} height={800} unoptimized /> : null; })}</div></section>;
}
