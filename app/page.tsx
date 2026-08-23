"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getHubs, getPartners, getPrograms, getSiteSettings, getStories, subscribeNewsletter } from "@/lib/api";
import { SiteFooter } from "@/components/site-footer";
import type { Hub, Partner, Program, SiteSettings, Story } from "@/types";

const pillars = [
  { index: "01", title: "Sport", text: "Football and athletics become shared ground for confidence, discipline and belonging." },
  { index: "02", title: "Culture + entertainment", text: "Music, stories and gatherings make room for joy, expression and exchange." },
  { index: "03", title: "Peace-building", text: "We build trust between host communities, migrants and refugees, with girls and women at the centre." },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [contentError, setContentError] = useState<string | null>(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [newsletterState, setNewsletterState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    Promise.all([getHubs(), getPrograms(), getStories(), getPartners(), getSiteSettings()]).then(([hubResult, programResult, storyResult, partnerResult, settingsResult]) => {
      if (hubResult.data) setHubs(hubResult.data);
      if (programResult.data) setPrograms(programResult.data);
      if (storyResult.data) setStories(storyResult.data);
      if (partnerResult.data) setPartners(partnerResult.data);
      if (settingsResult.data) setSettings(settingsResult.data);
      setContentError([hubResult, programResult, storyResult, partnerResult, settingsResult].find((result) => result.error)?.error ?? null);
      setContentLoading(false);
    });
  }, []);

  async function handleNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setNewsletterState("error"); return; }
    setNewsletterState("loading");
    const result = await subscribeNewsletter({ email });
    setNewsletterState(result.error ? "error" : "success");
  }

  return (
    <main>
      <header className="site-header">
        <div className="container-wide header-inner">
          <a href="#top" className="brand-lockup" aria-label="Bridging Borders Kigali home">
            <Image className="brand-logo" src="/bbk-logo.png" alt="Bridging Borders Kigali" width={58} height={58} priority /><span className="brand-name">Bridging<br />Borders Kigali</span>
          </a>
          <button className="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "Close" : "Menu"}</button>
          <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">
            <a href="#approach" onClick={() => setMenuOpen(false)}>Our approach</a><a href="#hubs" onClick={() => setMenuOpen(false)}>Hubs</a><a href="#programs" onClick={() => setMenuOpen(false)}>Programs</a><a href="#stories" onClick={() => setMenuOpen(false)}>Stories</a><Link href="/news" onClick={() => setMenuOpen(false)}>News</Link><a href="#get-involved" className="nav-cta" onClick={() => setMenuOpen(false)}>Get involved <span aria-hidden="true">↗</span></a>
          </nav>
        </div>
      </header>

      <section id="top" className="hero grain">
        <div className="hero-bridge" aria-hidden="true" />
        <div className="container-wide hero-content"><p className="eyebrow">A national movement rooted in Rwanda</p><h1>Different lives.<br /><em>One shared field.</em></h1><p className="hero-copy">Bridging Borders Kigali uses sport, culture and entertainment to rebuild trust between communities, migrants and refugees.</p><a className="text-link light-link" href="#approach">Discover the movement <span aria-hidden="true">↓</span></a></div>
        <div className="hero-note" aria-hidden="true">Kiyovu / Huye<br /><span>Rwanda</span></div>
      </section>

      {contentError && <div className="api-notice" role="status">Some BBK content is temporarily unavailable. Please refresh shortly.</div>}

      <section id="approach" className="section approach"><div className="container-wide"><div className="section-heading"><div><p className="eyebrow">How we move</p><h2>Peace starts<br /><em>in the same place.</em></h2></div><p className="section-intro">The field, the stage and the street can all become places to meet across difference. Our work is built around participation, dignity and shared energy.</p></div><div className="pillar-grid">{pillars.map((pillar) => <article className="pillar" key={pillar.index}><span className="pillar-index">{pillar.index}</span><h3>{pillar.title}</h3><p>{pillar.text}</p></article>)}</div></div></section>

      <section id="hubs" className="section hubs-section"><div className="container-wide"><div className="section-heading compact"><div><p className="eyebrow">Two anchor hubs</p><h2>Local roots.<br /><em>National reach.</em></h2></div><p className="section-intro">Every hub carries the same invitation: show up, take part, belong.</p></div>{contentLoading ? <p className="empty-note">Loading hubs from BBK…</p> : <div className="hub-grid">{hubs.length ? hubs.slice(0, 2).map((hub, index) => <a className={`hub-card hub-${index + 1}`} href={`/hubs/${hub.slug}`} key={hub.id}><span className="hub-label">{hub.district ?? "Rwanda"}</span><h3>{hub.name}</h3><p>{hub.description ?? ""}</p><span className="card-arrow" aria-hidden="true">↗</span></a>) : <p className="empty-note">No active hubs are published yet.</p>}</div>}</div></section>

      <section id="programs" className="section programs-section"><div className="container-wide"><div className="section-heading compact"><div><p className="eyebrow">What is happening</p><h2>Movement with<br /><em>a purpose.</em></h2></div><Link className="text-link" href="/programs">View all programs <span aria-hidden="true">↗</span></Link></div><div className="program-list">{contentLoading ? <p className="empty-note">Loading programs from BBK…</p> : programs.length ? programs.slice(0, 3).map((program) => <Link className="program-row" href={`/programs/${program.slug}`} key={program.id}><span className="program-category">{program.category.replace("_", " ")}</span><h3>{program.title}</h3><span className="card-arrow" aria-hidden="true">↗</span></Link>) : <p className="empty-note">No published programs yet.</p>}</div></div></section>

      <section id="stories" className="section story-section"><div className="container-wide story-layout"><div><p className="eyebrow eyebrow-gold">Voices from the movement</p>{stories[0] ? <><blockquote>“{stories[0].body.slice(0, 190)}{stories[0].body.length > 190 ? "…" : ""}”</blockquote><p className="story-byline">{stories[0].authorName} · {stories[0].hub?.name ?? ""}</p><a className="text-link light-link" href={`/stories/${stories[0].slug}`}>Read the full story <span aria-hidden="true">↗</span></a></> : <p className="empty-note">No published stories yet.</p>}</div><div className="story-aside"><span className="aside-number">{String(stories.length).padStart(2, "0")}</span><p>published stories from the BBK community</p></div></div></section>

      <section className="partner-strip"><div className="container-wide partner-inner"><p className="eyebrow">With support from</p><div className="partner-names">{contentLoading ? <span>Loading partners…</span> : partners.length ? partners.slice(0, 4).map((partner) => <span key={partner.id}>{partner.name}</span>) : <span>No partners published yet.</span>}</div></div></section>

      <section id="get-involved" className="section newsletter-section"><div className="container-wide newsletter-layout"><div><p className="eyebrow eyebrow-gold">Stay connected</p><h2>There is room<br /><em>for your energy.</em></h2></div><form onSubmit={handleNewsletter} className="newsletter-form"><label htmlFor="email">Get occasional news from BBK</label><div className="input-row"><input id="email" value={email} onChange={(event) => { setEmail(event.target.value); setNewsletterState("idle"); }} placeholder="Your email address" type="email" /><button type="submit" disabled={newsletterState === "loading"}>{newsletterState === "loading" ? "Joining…" : "Join us ↗"}</button></div>{newsletterState === "error" && <p className="form-message error">Please enter a valid email or try again in a moment.</p>}{newsletterState === "success" && <p className="form-message success">You are on the list. Welcome to the movement.</p>}</form></div></section>

      <SiteFooter settings={settings} />
    </main>
  );
}