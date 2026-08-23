"use client";

import { FormEvent, useState } from "react";
import { submitContact } from "@/lib/api";
import { SocialLinks } from "@/components/social-links";
import { SiteFooter } from "@/components/site-footer";

export default function ContactPage() {
  const [status, setStatus] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const payload = { name: String(form.get("name")), email: String(form.get("email")), subject: String(form.get("subject")), message: String(form.get("message")) }; if (!payload.name || !/^\S+@\S+\.\S+$/.test(payload.email) || !payload.subject || !payload.message) { setStatus("Please complete the form with a valid email."); return; } const result = await submitContact(payload); setStatus(result.error?.includes("429") ? "Please wait a moment and try again." : result.error ?? "Message received. We’ll be in touch soon."); }
  return <><main className="min-h-screen bg-[var(--surface-tint)] pb-24 pt-36"><div className="container-wide max-w-3xl"><p className="eyebrow">Say hello</p><h1 className="display mt-3 text-5xl font-bold md:text-7xl">Let’s talk.</h1><div className="mt-8"><p className="text-sm text-[var(--muted)]">Connect with BBK</p><SocialLinks /></div><form onSubmit={submit} className="mt-12 grid gap-6 bg-white p-8 md:p-12"><label className="grid gap-2 text-sm font-semibold">Name<input name="name" className="border-b border-[var(--muted)]/40 py-3 outline-none focus:border-[var(--brand)]" required /></label><label className="grid gap-2 text-sm font-semibold">Email<input name="email" type="email" className="border-b border-[var(--muted)]/40 py-3 outline-none focus:border-[var(--brand)]" required /></label><label className="grid gap-2 text-sm font-semibold">Subject<input name="subject" className="border-b border-[var(--muted)]/40 py-3 outline-none focus:border-[var(--brand)]" required /></label><label className="grid gap-2 text-sm font-semibold">Message<textarea name="message" rows={5} className="border-b border-[var(--muted)]/40 py-3 outline-none focus:border-[var(--brand)]" required /></label><button className="justify-self-start rounded-full bg-[var(--brand)] px-7 py-3 text-sm font-bold text-white">Send message ↗</button>{status && <p className="text-sm text-[var(--brand)]">{status}</p>}</form></div></main><SiteFooter /></>;
}
