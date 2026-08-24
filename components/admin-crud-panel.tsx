"use client";

import { FormEvent, useEffect, useState } from "react";
import { createAdminContent, deleteAdminContent, getAdminContent, reorderAdminHero, updateAdminContent, updateAdminContentStatus, uploadAdminMedia } from "@/lib/api";

const types = ["hero", "hubs", "programs", "stories", "events", "partners", "news"];
const fieldMap: Record<string, string[]> = {
  hero: ["eyebrow", "title", "body", "cta_label", "cta_url", "image_url", "location", "side", "sort_order", "is_active"],
  hubs: ["name", "district", "description"],
  programs: ["title", "category", "summary", "body"],
  stories: ["title", "authorName", "body"],
  events: ["title", "eventType", "location", "startsAt", "description"],
  partners: ["name", "partnerType", "websiteUrl", "description"],
  news: ["title", "body"],
};
const workflowTypes = new Set(["programs", "stories", "events", "news"]);
const statuses = ["draft", "pending_review", "published", "archived"];

function permissionFor(type: string): string {
  return type === "hero" ? "manage-system-settings" : type === "hubs" ? "manage-hubs" : type === "partners" ? "manage-partners" : `manage-${type === "news" ? "news" : type}`;
}

export function AdminCrudPanel({ permissions }: { permissions: string[] }) {
  const permittedTypes = types.filter((value) => permissions.includes(permissionFor(value)));
  const [type, setType] = useState(() => {
    const requestedType = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("content");
    return requestedType && permittedTypes.includes(requestedType) ? requestedType : permittedTypes[0] ?? "";
  });
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<number | null>(null);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [editingPublishedAt, setEditingPublishedAt] = useState("");
  const [message, setMessage] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const canManage = permissions.includes(permissionFor(type));
  const canEdit = canManage || (permissions.includes("publish-content") && type !== "hubs" && type !== "partners");
  const canUploadMedia = permissions.includes("manage-media");

  async function load(): Promise<void> {
    const result = await getAdminContent(type);
    if (result.data) setRecords(result.data.data);
    else setMessage(result.error ?? "Unable to load records.");
  }

  useEffect(() => {
    let active = true;
    if (!type) return () => { active = false; };
    getAdminContent(type).then((result) => {
      if (!active) return;
      if (result.data) setRecords(result.data.data);
      else setMessage(result.error ?? "Unable to load records.");
    });
    return () => { active = false; };
  }, [type, permittedTypes]);

  function startEdit(record: Record<string, unknown>): void {
    setEditing(Number(record.id));
    setEditingStatus(typeof record.status === "string" ? record.status : null);
    setEditingPublishedAt(typeof record.published_at === "string" ? record.published_at : "");
    setValues(Object.fromEntries(fieldMap[type].map((field) => [field, String(record[field] ?? "")] )));
  }

  async function save(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMessage("Saving…");
    const result = editing === null ? await createAdminContent(type, values) : await updateAdminContent(type, editing, values);
    if (result.error) setMessage(result.error);
    else if (!result.data) setMessage("The record could not be saved.");
    else {
      const record = result.data;
      if (editing !== null && editingStatus && workflowTypes.has(type)) {
        const workflow = await updateAdminContentStatus(type, editing, editingStatus);
        if (workflow.error) { setMessage(`Record saved, but status update failed: ${workflow.error}`); await load(); return; }
      }
      if (mediaFile && canUploadMedia) {
        setMessage("Uploading image…");
        const upload = await uploadAdminMedia(type, Number(record.id), mediaFile, altText);
        if (upload.error) { setMessage(`Record saved, but image upload failed: ${upload.error}`); await load(); return; }
      }
      setMessage(editing === null ? "Record created." : "Record updated.");
      setValues({});
      setEditing(null);
      setEditingStatus(null);
      setEditingPublishedAt("");
      setMediaFile(null);
      setAltText("");
      await load();
    }
  }

  async function remove(id: number): Promise<void> {
    const result = await deleteAdminContent(type, id);
    setMessage(result.error ?? "Record deleted.");
    await load();
  }

  async function move(recordIndex: number, direction: -1 | 1): Promise<void> {
    const current = records[recordIndex];
    if (type !== "hero" || !current) return;
    const group = records.filter((record) => record.side === current.side);
    const groupIndex = group.findIndex((record) => record.id === current.id);
    const nextIndex = groupIndex + direction;
    if (nextIndex < 0 || nextIndex >= group.length) return;
    [group[groupIndex], group[nextIndex]] = [group[nextIndex], group[groupIndex]];
    let replacementIndex = 0;
    const reordered = records.map((record) => record.side === current.side ? group[replacementIndex++] : record);
    const result = await reorderAdminHero(reordered.map((record) => Number(record.id)));
    setMessage(result.error ?? "Hero order updated.");
    await load();
  }

  return <section className="crud-workspace" id="content-desk">
    <div className="crud-heading"><div><p className="eyebrow">Content desk</p><h2>Manage records</h2></div><select value={type} onChange={(event) => { setType(event.target.value); setEditing(null); setValues({}); setEditingStatus(null); setEditingPublishedAt(""); setMediaFile(null); setAltText(""); }} aria-label="Content type">{permittedTypes.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
    {(canManage || (canEdit && editing !== null)) && <form className="crud-form" onSubmit={save}><h3>{editing === null ? "Create" : "Edit"} {type}</h3>{fieldMap[type].map((field) => <label key={field}>{field}<input required={!['description', 'summary', 'body'].includes(field)} value={values[field] ?? ""} onChange={(event) => setValues({ ...values, [field]: event.target.value })} /></label>)}{editing !== null && editingStatus && workflowTypes.has(type) && <label>Status<select value={editingStatus} onChange={(event) => setEditingStatus(event.target.value)}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>}{canUploadMedia && <><label>Image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setMediaFile(event.target.files?.[0] ?? null)} /></label><label>Image alt text<input value={altText} onChange={(event) => setAltText(event.target.value)} /></label></>}<div className="crud-form-actions"><button type="submit">{editing === null ? "Create record" : "Save changes"} ↗</button>{editing !== null && <button type="button" onClick={() => { setEditing(null); setValues({}); setEditingStatus(null); setEditingPublishedAt(""); setMediaFile(null); setAltText(""); }}>Cancel</button>}</div></form>}
    <p className="crud-message">{message || `${records.length} records loaded.`}</p>
    <div className="crud-records">{records.map((record, index) => <article key={String(record.id)}><div><strong>{String(record.title ?? record.name ?? "Untitled")}</strong><span>{String(record.status ?? record.side ?? record.partner_type ?? record.category ?? "")}</span></div><div className="crud-actions">{type === "hero" && <><button type="button" aria-label="Move hero earlier" onClick={() => void move(index, -1)}>←</button><button type="button" aria-label="Move hero later" onClick={() => void move(index, 1)}>→</button></>}{canEdit && <button type="button" onClick={() => startEdit(record)}>Edit</button>}{canManage && <button type="button" onClick={() => void remove(Number(record.id))}>Delete</button>}</div></article>)}</div>
  </section>;
}
