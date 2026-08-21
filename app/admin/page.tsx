"use client";

import { useEffect, useState } from "react";
import { clearAdminToken, getAdminProfile, logoutAdmin } from "@/lib/api";
import type { StaffUser } from "@/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminCrudPanel } from "@/components/admin-crud-panel";

const capabilities = [
  ["manage-programs", "Programs", "Create and edit program content"],
  ["manage-events", "Events", "Create and edit public events"],
  ["manage-stories", "Stories", "Manage drafts and testimonials"],
  ["manage-news", "News", "Manage news posts"],
  ["manage-media", "Media library", "Upload images and videos"],
  ["manage-inbox", "Inbox", "Review public submissions"],
  ["review-content", "Review queue", "Request or review publication"],
  ["publish-content", "Publish", "Move reviewed content live"],
  ["manage-users", "Users", "Manage staff accounts"],
  ["manage-system-settings", "Settings", "Manage system integrations"],
  ["view-audit-log", "Audit log", "View change history"],
] as const;

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<StaffUser | null>(null);

  useEffect(() => {
    getAdminProfile().then((result) => {
      if (result.data) setUser(result.data);
      else { clearAdminToken(); router.replace("/admin/login"); }
    });
  }, [router]);

  async function logout() { await logoutAdmin(); router.replace("/admin/login"); }
  if (!user) return <main className="admin-shell"><p className="admin-loading">Loading staff profile…</p></main>;

  return <main className="admin-shell"><div className="admin-dashboard"><header className="admin-topbar"><Link className="brand-lockup" href="/"><span className="brand-mark">BBK</span><span className="brand-name">Bridging<br />Borders Kigali</span></Link><div className="admin-account"><span>{user.name}<strong>{user.roles.join(" · ")}</strong></span><button type="button" onClick={logout}>Sign out</button></div></header><section className="admin-welcome"><p className="eyebrow">Staff workspace</p><h1 className="display">Your permissions,<br /><em>made clear.</em></h1><p>Signed in as <strong>{user.email}</strong>. This workspace shows the actions available to your role.</p></section><section className="capability-grid" aria-label="Your role capabilities">{capabilities.map(([permission, title, description]) => { const allowed = user.permissions.includes(permission); return <article className={allowed ? "capability allowed" : "capability restricted"} key={permission}><span className="capability-state">{allowed ? "Available" : "Restricted"}</span><h2>{title}</h2><p>{description}</p><code>{permission}</code></article>; })}</section><AdminCrudPanel permissions={user.permissions} /></div></main>;
}