"use client";

import { useEffect, useState } from "react";
import { clearAdminToken, getAdminProfile, logoutAdmin } from "@/lib/api";
import type { StaffUser } from "@/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminCrudPanel } from "@/components/admin-crud-panel";

const capabilities = [
  ["manage-programs", "Programs", "Create and edit program content", "/admin?content=programs#content-desk"],
  ["manage-events", "Events", "Create and edit public events", "/admin?content=events#content-desk"],
  ["manage-stories", "Stories", "Manage drafts and testimonials", "/admin?content=stories#content-desk"],
  ["manage-news", "News", "Manage news posts", "/admin?content=news#content-desk"],
  ["manage-media", "Media library", "Upload images and videos", "/admin#content-desk"],
  ["manage-inbox", "Inbox", "Review public submissions", "/admin#content-desk"],
  ["review-content", "Review queue", "Request or review publication", "/admin#content-desk"],
  ["publish-content", "Publish", "Move reviewed content live", "/admin#content-desk"],
  ["manage-users", "Users", "Manage staff accounts", "/admin/users"],
  ["manage-system-settings", "Settings", "Manage system integrations", "/admin/theme"],
  ["view-audit-log", "Audit log", "View change history", "/admin/audit-log"],
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

  const canManageUsers = user.permissions.includes("manage-users");
  const canManageSettings = user.permissions.includes("manage-system-settings");
  const canViewAuditLog = user.permissions.includes("view-audit-log");
  const allowedCapabilities = capabilities.filter(([permission]) => user.permissions.includes(permission));
  return <main className="admin-shell"><div className="admin-dashboard"><header className="admin-topbar"><Link className="brand-lockup" href="/"><span className="brand-mark">BBK</span><span className="brand-name">Bridging<br />Borders Kigali</span></Link><div className="admin-account"><span>{user.name}<strong>{user.roles.join(" · ")}</strong></span>{canManageSettings && <Link className="admin-back" href="/admin/theme">Theme customizer</Link>}{canManageUsers && <Link className="admin-back" href="/admin/users">Staff accounts</Link>}{canViewAuditLog && <Link className="admin-back" href="/admin/audit-log">Audit log</Link>}<button type="button" onClick={logout}>Sign out</button></div></header><section className="admin-welcome"><p className="eyebrow">Staff workspace</p><h1 className="display">Your permissions,<br /><em>made clear.</em></h1><p>Signed in as <strong>{user.email}</strong>. This workspace shows the actions available to your role.</p></section><section className="capability-grid" aria-label="Your role capabilities">{allowedCapabilities.map(([permission, title, description, href]) => <Link className="capability-link" href={href} key={permission}><article className="capability allowed"><span className="capability-state">Available</span><h2>{title}</h2><p>{description}</p><code>{permission}</code></article></Link>)}</section><AdminCrudPanel permissions={user.permissions} /></div></main>;
}