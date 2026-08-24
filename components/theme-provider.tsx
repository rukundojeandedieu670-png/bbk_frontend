"use client";

import { useEffect } from "react";
import { getSiteSettings } from "@/lib/api";
import type { SiteSettings } from "@/types";

export const defaultTheme = {
  theme_primary_color: "#12324A",
  theme_accent_color: "#C95F43",
  theme_secondary_accent_color: "#E8AE42",
  font_pairing: "classic" as const,
};

export function applyTheme(settings: Partial<SiteSettings>): void {
  const root = document.documentElement;
  const primary = settings.theme_primary_color ?? defaultTheme.theme_primary_color;
  const accent = settings.theme_accent_color ?? defaultTheme.theme_accent_color;
  const secondary = settings.theme_secondary_accent_color ?? defaultTheme.theme_secondary_accent_color;
  const pairing = settings.font_pairing ?? defaultTheme.font_pairing;
  const fonts = pairing === "athletic"
    ? { heading: "var(--font-barlow)", body: "var(--font-inter-loaded)" }
    : pairing === "bold"
      ? { heading: "var(--font-bebas)", body: "var(--font-work-sans)" }
      : { heading: "var(--font-space-loaded)", body: "var(--font-manrope)" };

  root.style.setProperty("--navy", primary);
  root.style.setProperty("--navy-deep", primary);
  root.style.setProperty("--terracotta", accent);
  root.style.setProperty("--terracotta-dark", accent);
  root.style.setProperty("--gold", secondary);
  root.style.setProperty("--font-space", fonts.heading);
  root.style.setProperty("--font-inter", fonts.body);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    getSiteSettings().then((result) => {
      if (result.data) applyTheme(result.data);
    });
  }, []);

  return children;
}