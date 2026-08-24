"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearAdminToken, createAdminUser, deleteAdminUser, getAdminProfile, getAdminUsers, updateAdminUser } from "@/lib/api";
import type { StaffUser } from "@/types";
import "./users.css";

type Role = "admin" | "publisher";
type FormValues = { name: string; email: string; password: string; role: Role };
const emptyForm: FormValues = { name: "", email: "", password: "", role: "admin" };

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [editing, setEditing] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadUsers(): Promise<void> {
    const result = await getAdminUsers();
    if (result.data) setUsers(result.data);
    else setMessage(result.error ?? "Unable to load staff accounts.");
  }

  useEffect(() => {
    Promise.all([getAdminProfile(), getAdminUsers()]).then(([profile, result]) => {
      if (!profile.data) { clearAdminToken(); router.replace("/admin/login"); return; }
      if (!profile.data.permissions.includes("manage-users")) { router.replace("/admin"); return; }
      if (result.data) setUsers(result.data);
      else setMessage(result.error ?? "Unable to load staff accounts.");
      setLoading(false);
    });
  }, [router]);

  function beginEdit(user: StaffUser): void {
    const role = user.roles.find((value): value is Role => value === "admin" || value === "publisher") ?? "admin";
    setEditing(user.id);
    setForm({ name: user.name, email: user.email, password: "", role });
    setMessage("");
  }

  async function save(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMessage("Saving...");
    const result = editing === null
      ? await createAdminUser(form)
      : await updateAdminUser(editing, form.password ? form : { name: form.name, email: form.email, role: form.role });
    if (result.error) { setMessage(result.error); return; }
    setMessage(editing === null ? "Staff account created." : "Staff account updated.");
    setForm(emptyForm);
    setEditing(null);
    await loadUsers();
  }

  async function remove(user: StaffUser): Promise<void> {
    if (!window.confirm(`Delete ${user.name}'s staff account?`)) return;
    const result = await deleteAdminUser(user.id);
    setMessage(result.error ?? "Staff account deleted.");
    await loadUsers();
  }

  if (loading) return <main className="admin-shell"><p className="admin-loading">Loading staff accounts...</p></main>;

  return <main className="admin-shell"><div className="admin-dashboard"><header className="admin-topbar"><Link className="brand-lockup" href="/admin"><span className="brand-mark">BBK</span><span className="brand-name">Bridging<br />Borders Kigali</span></Link><Link className="admin-back" href="/admin">Back to workspace</Link></header><section className="admin-welcome users-heading"><p className="eyebrow">System settings</p><h1 className="display">Staff accounts,<br /><em>kept current.</em></h1><p>Create and maintain Admin and Publisher access. Passwords are never shown after saving.</p></section><div className="users-layout"><form className="admin-form users-form" onSubmit={save}><p className="eyebrow">{editing === null ? "New account" : "Edit account"}</p><label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label><label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label><label>Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} minLength={editing === null ? 12 : undefined} required={editing === null} placeholder={editing === null ? "At least 12 characters" : "Leave blank to keep current"} /></label><label>Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as Role })}><option value="admin">Admin</option><option value="publisher">Publisher</option></select></label><div className="theme-actions"><button type="submit">{editing === null ? "Create account" : "Save changes"}</button>{editing !== null && <button type="button" onClick={() => { setEditing(null); setForm(emptyForm); }}>Cancel</button>}</div>{message && <p className="crud-message" role="status">{message}</p>}</form><section className="users-list" aria-label="Staff accounts"><div className="users-list-heading"><p className="eyebrow">Directory</p><strong>{users.length} accounts</strong></div>{users.map((user) => <article className="user-row" key={user.id}><div><strong>{user.name}</strong><span>{user.email}</span><small>{user.roles.join(" / ")}</small></div><div className="crud-actions"><button type="button" onClick={() => beginEdit(user)}>Edit</button><button type="button" onClick={() => void remove(user)}>Delete</button></div></article>)}</section></div></div></main>;
}
