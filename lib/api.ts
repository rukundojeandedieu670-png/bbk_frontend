export interface Paginated<T> { data: T[]; current_page: number; last_page: number; total: number; }
import type { AuditLogEntry, ContactMessage, Event, Hub, NewsPost, NewsletterSubscriber, Partner, PartnershipInquiry, Program, SiteSettings, StaffUser, Story, VolunteerApplication } from "@/types";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
export function resolveMediaUrl(url?: string | null, mediaId?: number): string | null {
  if (!url) return null;
  return url.startsWith("/") && baseUrl && mediaId ? `${baseUrl}/api/v1/media/${mediaId}` : url;
}
export async function fetchApi<T>(path: string, options?: RequestInit): Promise<{ data: T | null; error: string | null; status?: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const headers = new Headers(options?.headers);
    if (!(options?.body instanceof FormData)) headers.set("Content-Type", "application/json");
    const response = await fetch(`${baseUrl}${path}`, { ...options, signal: controller.signal, headers, next: { revalidate: 60 } });
    const payload = await response.json();
    if (!response.ok) return { data: null, error: payload?.message ?? `Request failed (${response.status})`, status: response.status };
    return { data: payload?.data ?? payload, error: null, status: response.status };
  } catch { return { data: null, error: "The service is currently unavailable." }; }
  finally { clearTimeout(timeout); }
}
const get = <T>(resource: string, query = "") => fetchApi<T[]>(`/api/v1/${resource}${query}`);
const getOne = <T>(resource: string, slug: string) => fetchApi<T>(`/api/v1/${resource}/${slug}`);
export const getHubs = () => get<Hub>("hubs");
export const getPrograms = () => get<Program>("programs");
export const getStories = () => get<Story>("stories");
export const getEvents = () => get<Event>("events");
export const getPartners = () => get<Partner>("partners");
export const getNewsPosts = () => get<NewsPost>("news");
export const getSiteSettings = () => fetchApi<SiteSettings>("/api/v1/site-settings");
export function updateAdminSiteSettings(settings: Partial<SiteSettings>) {
  return adminRequest<SiteSettings>("/api/v1/admin/site-settings", { method: "PUT", body: JSON.stringify(settings) });
}
export const getHub = (slug: string) => getOne<Hub>("hubs", slug);
export const getProgram = (slug: string) => getOne<Program>("programs", slug);
export const getStory = (slug: string) => getOne<Story>("stories", slug);
export const getEvent = (slug: string) => getOne<Event>("events", slug);
export const getPartner = (slug: string) => getOne<Partner>("partners", slug);
export const getNewsPost = (slug: string) => getOne<NewsPost>("news", slug);
const post = <T>(path: string, payload: T) => fetchApi<{ message: string; id?: number }>(path, { method: "POST", body: JSON.stringify(payload) });
export const subscribeNewsletter = (payload: NewsletterSubscriber) => post("/api/v1/interactions/newsletter", payload);
export const submitVolunteer = (payload: VolunteerApplication) => post("/api/v1/interactions/volunteer", payload);
export const submitPartnership = (payload: PartnershipInquiry) => post("/api/v1/interactions/partnership", payload);
export const submitContact = (payload: ContactMessage) => post("/api/v1/interactions/contact", payload);

const tokenKey = "bbk_admin_token";
export function getAdminToken(): string | null {
  return typeof window === "undefined" ? null : window.localStorage.getItem(tokenKey);
}
export function clearAdminToken(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(tokenKey);
}
export async function loginAdmin(email: string, password: string) {
  const result = await fetchApi<{ token: string; user: StaffUser }>("/api/v1/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  if (result.data && typeof window !== "undefined") window.localStorage.setItem(tokenKey, result.data.token);
  return result;
}
export function getAdminProfile() {
  const token = getAdminToken();
  return fetchApi<StaffUser>("/api/v1/admin/auth/me", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
}
export function getAdminUsers() { return adminRequest<StaffUser[]>("/api/v1/admin/users"); }
export function createAdminUser(payload: { name: string; email: string; password: string; role: "admin" | "publisher" }) {
  return adminRequest<StaffUser>("/api/v1/admin/users", { method: "POST", body: JSON.stringify(payload) });
}
export function updateAdminUser(id: number, payload: Partial<{ name: string; email: string; password: string; role: "admin" | "publisher" }>) {
  return adminRequest<StaffUser>(`/api/v1/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}
export function deleteAdminUser(id: number) { return adminRequest<{ message: string }>(`/api/v1/admin/users/${id}`, { method: "DELETE" }); }
export function getAdminAuditLogs() { return adminRequest<AuditLogEntry[]>("/api/v1/admin/audit-log"); }
export async function logoutAdmin() {
  const token = getAdminToken();
  const result = await fetchApi<{ message: string }>("/api/v1/admin/auth/logout", { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {} });
  clearAdminToken();
  return result;
}

function adminRequest<T>(path: string, options: RequestInit = {}) {
  const token = getAdminToken();
  return fetchApi<T>(path, { ...options, headers: { Authorization: `Bearer ${token ?? ""}`, ...options.headers } });
}
export function getAdminContent(type: string) { return adminRequest<{ data: Record<string, unknown>[] }>(`/api/v1/admin/content/${type}`); }
export function createAdminContent(type: string, payload: Record<string, unknown>) { return adminRequest<Record<string, unknown>>(`/api/v1/admin/content/${type}`, { method: "POST", body: JSON.stringify(payload) }); }
export function updateAdminContent(type: string, id: number, payload: Record<string, unknown>) { return adminRequest<Record<string, unknown>>(`/api/v1/admin/content/${type}/${id}`, { method: "PATCH", body: JSON.stringify(payload) }); }
export function updateAdminContentStatus(type: string, id: number, status: string) { return adminRequest<Record<string, unknown>>(`/api/v1/admin/content/${type}/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); }
export function deleteAdminContent(type: string, id: number) { return adminRequest<{ message: string }>(`/api/v1/admin/content/${type}/${id}`, { method: "DELETE" }); }
export async function uploadAdminMedia(type: string, id: number, file: File, altText: string) {
  const token = getAdminToken();
  const formData = new FormData();
  formData.append("file", file);
  if (altText.trim()) formData.append("altText", altText.trim());
  return fetchApi<{ id: number; type: string; url?: string | null; altText?: string | null }>(`/api/v1/admin/media/${type}/${id}`, {
    method: "POST",
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}