"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAdmin } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const result = await loginAdmin(email, password);
    if (result.error) setError(result.error);
    else router.push("/admin");
    setLoading(false);
  }

  return <main className="admin-shell"><div className="admin-login"><p className="eyebrow">BBK staff access</p><h1 className="display">Welcome back.</h1><p className="admin-lede">Sign in to manage content, review stories, and keep the movement moving.</p><form onSubmit={submit} className="admin-form"><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label><button type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in ↗"}</button>{error && <p className="admin-error" role="alert">{error}</p>}</form><Link className="admin-back" href="/">← Return to public site</Link></div></main>;
}