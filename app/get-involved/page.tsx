"use client";

import { FormEvent, useState } from "react";
import { submitPartnership, submitVolunteer, subscribeNewsletter } from "@/lib/api";

function FormBlock({ title, submitAction, fields }: { title: string; submitAction: (values: Record<string, string>) => Promise<{ error: string | null }>; fields: string[] }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "loading" | "success" | "error" | "rate">("idle");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (fields.some((field) => !values[field]?.trim()) || !/^\S+@\S+\.\S+$/.test(values.email ?? "")) { setState("error"); return; }
    setState("loading");
    const result = await submitAction(values);
    setState(result.error?.includes("429") ? "rate" : result.error ? "error" : "success");
  }
  return <form onSubmit={submit} className="bg-white p-7 md:p-9"><h2 className="display text-2xl font-bold">{title}</h2><div className="mt-7 grid gap-4">{fields.map((field) => <label key={field} className="grid gap-2 text-sm font-semibold capitalize">{field.replace("_", " ")}<input required value={values[field] ?? ""} onChange={(event) => setValues({ ...values, [field]: event.target.value })} type={field === "email" ? "email" : "text"} className="border-b border-[var(--muted)]/40 bg-transparent px-0 py-3 outline-none focus:border-[var(--brand)]" /></label>)}</div><button disabled={state === "loading"} className="mt-8 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-bold text-white">{state === "loading" ? "Sending..." : "Send application ↗"}</button>{state === "error" && <p className="mt-4 text-sm text-[#b44d32]">Please complete every field with a valid email.</p>}{state === "rate" && <p className="mt-4 text-sm text-[#b44d32]">Please wait a moment and try again. We’re receiving a lot of messages.</p>}{state === "success" && <p className="mt-4 text-sm text-[var(--success)]">Thanks. We’ll be in touch soon.</p>}</form>;
}

export default function GetInvolvedPage() { return <main className="min-h-screen bg-[var(--surface-sand)] pb-24 pt-36"><div className="container-wide"><p className="eyebrow">Make your move</p><h1 className="display mt-3 max-w-3xl text-5xl font-bold md:text-7xl">Bring your energy to BBK.</h1><div className="mt-14 grid gap-6 lg:grid-cols-3"><FormBlock title="Volunteer" submitAction={(values) => submitVolunteer({ name: values.name, email: values.email, message: values.message })} fields={["name", "email", "message"]} /><FormBlock title="Partner with us" submitAction={(values) => submitPartnership({ organizationName: values.organizationName, contactName: values.contactName, email: values.email, message: values.message })} fields={["organizationName", "contactName", "email", "message"]} /><FormBlock title="Stay connected" submitAction={(values) => subscribeNewsletter({ email: values.email })} fields={["email"]} /></div></div></main>; }
