export interface Paginated<T> { data: T[]; current_page: number; last_page: number; total: number; }
import type { ContactMessage, Event, Hub, NewsPost, NewsletterSubscriber, Partner, PartnershipInquiry, Program, StaffUser, Story, VolunteerApplication } from "@/types";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
export async function fetchApi<T>(path: string, options?: RequestInit): Promise<{ data: T | null; error: string | null; status?: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(`${baseUrl}${path}`, { ...options, signal: controller.signal, headers: { "Content-Type": "application/json", ...options?.headers }, next: { revalidate: 60 } });
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
export function createAdminContent(type: string, payload: Record<string, unknown>) { return adminRequest<{ data: Record<string, unknown>; message: string }>(`/api/v1/admin/content/${type}`, { method: "POST", body: JSON.stringify(payload) }); }
export function updateAdminContent(type: string, id: number, payload: Record<string, unknown>) { return adminRequest<{ data: Record<string, unknown>; message: string }>(`/api/v1/admin/content/${type}/${id}`, { method: "PATCH", body: JSON.stringify(payload) }); }
export function deleteAdminContent(type: string, id: number) { return adminRequest<{ message: string }>(`/api/v1/admin/content/${type}/${id}`, { method: "DELETE" }); }