"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { getAdminProfile, getSiteSettings, updateAdminSiteSettings } from "@/lib/api";
import type { StaffUser } from "@/types";

const defaults = {
  impact_people_impacted: "1k+",
  impact_youth_trained: "30+",
  impact_satisfaction_rate: "98%",
};

type ImpactFields = typeof defaults;

export default function AdminImpactPage() {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [fields, setFields] = useState<ImpactFields>(defaults);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getAdminProfile(), getSiteSettings()]).then(([profileResult, settingsResult]) => {
      if (!profileResult.data?.permissions.includes("manage-system-settings")) return;
      setUser(profileResult.data);
      const settings = settingsResult.data;
      if (settings) {
        setFields({
          impact_people_impacted: settings.impact_people_impacted ?? defaults.impact_people_impacted,
          impact_youth_trained: settings.impact_youth_trained ?? defaults.impact_youth_trained,
          impact_satisfaction_rate: settings.impact_satisfaction_rate ?? defaults.impact_satisfaction_rate,
        });
      }
    });
  }, []);

  function updateField(field: keyof ImpactFields, value: string): void {
    setFields((current) => ({ ...current, [field]: value }));
    setMessage("");
  }

  async function save(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSaving(true);
    const result = await updateAdminSiteSettings(fields);
    setMessage(result.error ?? "Impact metrics saved across the site.");
    setSaving(false);
  }

  if (!user) return <main className="admin-shell"><p className="admin-loading">Loading impact settings...</p></main>;

  return <main className="admin-shell"><div className="admin-dashboard"><header className="admin-topbar"><Link className="brand-lockup" href="/admin"><span className="brand-mark">BBK</span><span className="brand-name">Bridging<br />Borders Kigali</span></Link><Link className="admin-back" href="/admin">Back to workspace</Link></header><section className="admin-welcome"><p className="eyebrow">Homepage proof points</p><h1 className="display">Show the<br /><em>movement's reach.</em></h1><p>Edit the impact figures displayed on the public homepage.</p></section><form className="admin-form impact-form" onSubmit={save}><label>People impacted<input value={fields.impact_people_impacted} onChange={(event) => updateField("impact_people_impacted", event.target.value)} maxLength={50} /></label><label>Youth trained<input value={fields.impact_youth_trained} onChange={(event) => updateField("impact_youth_trained", event.target.value)} maxLength={50} /></label><label>Satisfaction rate<input value={fields.impact_satisfaction_rate} onChange={(event) => updateField("impact_satisfaction_rate", event.target.value)} maxLength={50} /></label><button type="submit" disabled={saving}>{saving ? "Saving..." : "Save impact metrics"}</button>{message && <p className="crud-message">{message}</p>}</form></div></main>;
}
