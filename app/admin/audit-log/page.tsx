"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clearAdminToken, getAdminAuditLogs, getAdminProfile } from "@/lib/api";
import type { AuditLogEntry, StaffUser } from "@/types";
import { useRouter } from "next/navigation";

export default function AdminAuditLogPage() {
  const router = useRouter();
  const [user, setUser] = useState<StaffUser | null>(null);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [message, setMessage] = useState("Loading audit history...");

  useEffect(() => {
    Promise.all([getAdminProfile(), getAdminAuditLogs()]).then(([profile, result]) => {
      if (!profile.data) { clearAdminToken(); router.replace("/admin/login"); return; }
      if (!profile.data.permissions.includes("view-audit-log")) { router.replace("/admin"); return; }
      setUser(profile.data);
      if (result.data) { setLogs(result.data); setMessage(`${result.data.length} changes loaded.`); }
      else setMessage(result.error ?? "Unable to load audit history.");
    });
  }, [router]);

  if (!user) return <main className="admin-shell"><p className="admin-loading">{message}</p></main>;
  return <main className="admin-shell"><div className="admin-dashboard"><header className="admin-topbar"><Link className="brand-lockup" href="/admin"><span className="brand-mark">BBK</span><span className="brand-name">Bridging<br />Borders Kigali</span></Link><Link className="admin-back" href="/admin">Back to workspace</Link></header><section className="admin-welcome"><p className="eyebrow">Change history</p><h1 className="display">The record<br /><em>of the work.</em></h1><p>Review who changed content, settings, and publication state across the workspace.</p></section><section className="crud-workspace" aria-label="Audit log"><p className="crud-message">{message}</p><div className="crud-records">{logs.map((log) => <article key={log.id}><div><strong>{log.action} · {log.subjectType.split("\\").pop()}</strong><span>{log.user?.name ?? "Unknown user"} · {log.createdAt ? new Date(log.createdAt).toLocaleString() : "Unknown time"}</span></div><code>{JSON.stringify(log.changes ?? {})}</code></article>)}</div></section></div></main>;
}