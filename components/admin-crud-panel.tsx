"use client";

import { FormEvent, useEffect, useState } from "react";
import { createAdminContent, deleteAdminContent, getAdminContent, updateAdminContent } from "@/lib/api";

const types = ["hubs", "programs", "stories", "events", "partners", "news"];
const fieldMap: Record<string, string[]> = {
  hubs: ["name", "district", "description"],
  programs: ["title", "category", "summary", "body"],
  stories: ["title", "authorName", "body"],
  events: ["title", "eventType", "location", "startsAt", "description"],
  partners: ["name", "partnerType", "websiteUrl", "description"],
  news: ["title", "body"],
};

function permissionFor(type: string): string {
  return type === "hubs" ? "manage-hubs" : type === "partners" ? "manage-partners" : `manage-${type === "news" ? "news" : type}`;
}

export function AdminCrudPanel({ permissions }: { permissions: string[] }) {
  const [type, setType] = useState("programs");
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const canManage = permissions.includes(permissionFor(type));
  const canEdit = canManage || (permissions.includes("publish-content") && type !== "hubs" && type !== "partners");

  async function load(): Promise<void> {
    const result = await getAdminContent(type);
    if (result.data) setRecords(result.data.data);
    else setMessage(result.error ?? "Unable to load records.");
  }

  useEffect(() => {
    let active = true;
    getAdminContent(type).then((result) => {
      if (!active) return;
      if (result.data) setRecords(result.data.data);
      else setMessage(result.error ?? "Unable to load records.");
    });
    return () => { active = false; };
  }, [type]);

  function startEdit(record: Record<string, unknown>): void {
    setEditing(Number(record.id));
    setValues(Object.fromEntries(fieldMap[type].map((field) => [field, String(record[field] ?? "")] )));
  }

  async function save(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMessage("Saving…");
    const result = editing === null ? await createAdminContent(type, values) : await updateAdminContent(type, editing, values);
    if (result.error) setMessage(result.error);
    else { setMessage(editing === null ? "Record created." : "Record updated."); setValues({}); setEditing(null); await load(); }
  }

  async function remove(id: number): Promise<void> {
    const result = await deleteAdminContent(type, id);
    setMessage(result.error ?? "Record deleted.");
    await load();
  }

  return <section className="crud-workspace">
    <div className="crud-heading"><div><p className="eyebrow">Content desk</p><h2>Manage records</h2></div><select value={type} onChange={(event) => { setType(event.target.value); setEditing(null); setValues({}); }} aria-label="Content type">{types.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
    {(canManage || (canEdit && editing !== null)) && <form className="crud-form" onSubmit={save}><h3>{editing === null ? "Create" : "Edit"} {type}</h3>{fieldMap[type].map((field) => <label key={field}>{field}<input required={!['description', 'summary', 'body'].includes(field)} value={values[field] ?? ""} onChange={(event) => setValues({ ...values, [field]: event.target.value })} /></label>)}<div className="crud-form-actions"><button type="submit">{editing === null ? "Create record" : "Save changes"} ↗</button>{editing !== null && <button type="button" onClick={() => { setEditing(null); setValues({}); }}>Cancel</button>}</div></form>}
    <p className="crud-message">{message || `${records.length} records loaded.`}</p>
    <div className="crud-records">{records.map((record) => <article key={String(record.id)}><div><strong>{String(record.title ?? record.name ?? "Untitled")}</strong><span>{String(record.status ?? record.partner_type ?? record.category ?? "")}</span></div><div className="crud-actions">{canEdit && <button type="button" onClick={() => startEdit(record)}>Edit</button>}{canManage && <button type="button" onClick={() => void remove(Number(record.id))}>Delete</button>}</div></article>)}</div>
  </section>;
}
