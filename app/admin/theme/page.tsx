"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAdminProfile, getSiteSettings, updateAdminSiteSettings } from "@/lib/api";
import { applyTheme, defaultTheme } from "@/components/theme-provider";
import type { SiteSettings, StaffUser, ThemeSettings } from "@/types";

const presets = [
  { id: "athletic", name: "Athletic", detail: "Barlow Condensed + Inter" },
  { id: "bold", name: "Bold", detail: "Bebas Neue + Work Sans" },
  { id: "classic", name: "Classic", detail: "Sora + Manrope" },
] as const;

const hexPattern = /^#[0-9A-Fa-f]{6}$/;
const defaultImpact: Pick<SiteSettings, "impact_people_impacted" | "impact_youth_trained" | "impact_satisfaction_rate"> = {
  impact_people_impacted: "1k+",
  impact_youth_trained: "30+",
  impact_satisfaction_rate: "98%",
};

export default function AdminThemePage() {
  const router = useRouter();
  const [user, setUser] = useState<StaffUser | null>(null);
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  const [impact, setImpact] = useState(defaultImpact);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getAdminProfile(), getSiteSettings()]).then(([profileResult, settingsResult]) => {
      if (!profileResult.data || !profileResult.data.permissions.includes("manage-system-settings")) {
        router.replace("/admin");
        return;
      }
      setUser(profileResult.data);
      const settings = settingsResult.data;
      if (settings) {
        setTheme((current) => ({
          theme_primary_color: settings.theme_primary_color ?? current.theme_primary_color,
          theme_accent_color: settings.theme_accent_color ?? current.theme_accent_color,
          theme_secondary_accent_color: settings.theme_secondary_accent_color ?? current.theme_secondary_accent_color,
          font_pairing: settings.font_pairing ?? current.font_pairing,
        }));
        setImpact({
          impact_people_impacted: settings.impact_people_impacted ?? defaultImpact.impact_people_impacted,
          impact_youth_trained: settings.impact_youth_trained ?? defaultImpact.impact_youth_trained,
          impact_satisfaction_rate: settings.impact_satisfaction_rate ?? defaultImpact.impact_satisfaction_rate,
        });
      }
    });
  }, [router]);

  const valid = hexPattern.test(theme.theme_primary_color) && hexPattern.test(theme.theme_accent_color) && hexPattern.test(theme.theme_secondary_accent_color) && presets.some((preset) => preset.id === theme.font_pairing);
  const previewStyle = {
    "--preview-primary": theme.theme_primary_color,
    "--preview-accent": theme.theme_accent_color,
    "--preview-secondary": theme.theme_secondary_accent_color,
  } as React.CSSProperties;

  function updateField(field: keyof ThemeSettings, value: string): void {
    setTheme((current) => ({ ...current, [field]: value }));
    setMessage("");
  }

  async function save(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!valid) return;
    setSaving(true);
    setMessage("");
    const result = await updateAdminSiteSettings({ ...theme, ...impact });
    if (result.error) setMessage(result.error);
    else {
      applyTheme(theme);
      setMessage("Theme saved across the site.");
    }
    setSaving(false);
  }

  function reset(): void {
    if (window.confirm("Reset the theme fields to BBK's original defaults? Click Save Theme to apply them.")) {
      setTheme(defaultTheme);
      setImpact(defaultImpact);
      setMessage("Defaults restored locally. Save to apply them.");
    }
  }

  if (!user) return <main className="admin-shell"><p className="admin-loading">Loading theme settings...</p></main>;

  return <main className="admin-shell"><div className="admin-dashboard"><header className="admin-topbar"><Link className="brand-lockup" href="/admin"><span className="brand-mark">BBK</span><span className="brand-name">Bridging<br />Borders Kigali</span></Link><Link className="admin-back" href="/admin">Back to workspace</Link></header><section className="admin-welcome theme-heading"><p className="eyebrow">System settings</p><h1 className="display">Shape the<br /><em>BBK atmosphere.</em></h1><p>Set the palette and type pairing once, then preview the change before it reaches the public site.</p></section><div className="theme-layout"><form className="theme-controls" onSubmit={save}><div className="theme-panel-heading"><div><p className="eyebrow">Brand palette</p><h2>Color roles</h2></div><span>HEX / 6 digits</span></div>{([ ["theme_primary_color", "Primary", "Deep structure and hero surfaces"], ["theme_accent_color", "Accent", "Calls to action and highlights"], ["theme_secondary_accent_color", "Secondary accent", "Gold details and supporting surfaces"] ] as const).map(([field, label, description]) => <label className="color-control" key={field}><span><strong>{label}</strong><small>{description}</small></span><span className="color-input-wrap"><input type="color" value={hexPattern.test(theme[field]) ? theme[field] : "#000000"} onChange={(event) => updateField(field, event.target.value.toUpperCase())} aria-label={`${label} color`} /><input className={!hexPattern.test(theme[field]) ? "invalid" : ""} value={theme[field]} onChange={(event) => updateField(field, event.target.value)} aria-label={`${label} hex value`} /><i style={{ backgroundColor: hexPattern.test(theme[field]) ? theme[field] : "transparent" }} /></span></label>)}<div className="theme-panel-heading font-heading"><div><p className="eyebrow">Type system</p><h2>Font pairing</h2></div></div><fieldset className="font-presets"><legend className="sr-only">Choose a font pairing</legend>{presets.map((preset) => <label className={theme.font_pairing === preset.id ? "font-option selected" : "font-option"} key={preset.id}><input type="radio" name="font_pairing" value={preset.id} checked={theme.font_pairing === preset.id} onChange={(event) => updateField("font_pairing", event.target.value)} /><span><strong>{preset.name}</strong><small>{preset.detail}</small></span></label>)}</fieldset><div className="theme-actions"><button type="submit" disabled={!valid || saving}>{saving ? "Saving..." : "Save Theme"}</button><button type="button" onClick={reset}>Reset to Default</button></div>{message && <p className="crud-message" role="status">{message}</p>}</form><section className="theme-preview" style={previewStyle} aria-label="Live theme preview"><div className="preview-label"><span>Live preview</span><span>Unsaved changes</span></div><div className="preview-hero"><p>Bridging Borders Kigali</p><h2>Many stories.<br /><em>One shared field.</em></h2><button type="button">Join the movement <span aria-hidden="true">↗</span></button></div><div className="preview-cards"><article><span>01 / SPORT</span><h3>Move together</h3><p>Shared energy creates room for trust.</p></article><article><span>02 / CULTURE</span><h3>Make room</h3><p>Every voice belongs in the story.</p></article></div></section></div></div></main>;
}
