"use client";

import Image from "next/image";
import Link from "next/link";
import { SocialLinks } from "@/components/social-links";
import type { SiteSettings } from "@/types";

export function SiteFooter({ settings }: { settings?: SiteSettings | null }) {
  return <footer className="site-footer"><div className="container-wide footer-grid"><Link href="/" className="brand-lockup footer-brand"><Image className="brand-logo" src="/bbk-logo.png" alt="Bridging Borders Kigali" width={58} height={58} /><span className="brand-name">Bridging<br />Borders Kigali</span></Link><p>Sport, culture and entertainment<br />for peace-building in Rwanda.</p><div><a href="mailto:hello@bbkigali.org">hello@bbkigali.org</a><br /><span>Kigali · Huye · Rwanda</span><SocialLinks settings={settings} /></div></div></footer>;
}