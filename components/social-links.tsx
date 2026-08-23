"use client";

import { useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { FaTiktok, FaXTwitter } from "react-icons/fa6";
import { getSiteSettings } from "@/lib/api";
import type { SiteSettings } from "@/types";

type SocialLinksProps = { settings?: SiteSettings | null };

export function SocialLinks({ settings: providedSettings }: SocialLinksProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(providedSettings ?? null);

  useEffect(() => {
    if (providedSettings !== undefined) return;
    getSiteSettings().then((result) => {
      if (result.data) setSettings(result.data);
    });
  }, [providedSettings]);

  const links = settings ? [
    { label: "Facebook", href: settings.social_facebook_url, icon: FaFacebook },
    { label: "X", href: settings.social_twitter_url, icon: FaXTwitter },
    { label: "WhatsApp", href: settings.social_whatsapp_number ? `https://wa.me/${settings.social_whatsapp_number.replace(/\D/g, "")}` : null, icon: FaWhatsapp },
    { label: "Instagram", href: settings.social_instagram_url, icon: FaInstagram },
    { label: "YouTube", href: settings.social_youtube_url, icon: FaYoutube },
    { label: "LinkedIn", href: settings.social_linkedin_url, icon: FaLinkedin },
    { label: "TikTok", href: settings.social_tiktok_url, icon: FaTiktok },
  ].filter((link): link is typeof link & { href: string } => Boolean(link.href?.trim())) : [];

  if (!links.length) return null;

  return <nav className="social-links" aria-label="Social links">{links.map(({ label, href, icon: Icon }) => <a className="social-link" href={href} target="_blank" rel="noopener noreferrer" aria-label={label} key={label}><Icon className="social-link-icon" aria-hidden="true" /></a>)}</nav>;
}