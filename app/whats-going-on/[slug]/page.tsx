import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/site/SiteFooter";
import Disc from "@/components/site/Disc";
import { PARTIES, partyBySlug } from "@/content/parties";
import styles from "./scene.module.css";

export function generateStaticParams() {
  return PARTIES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const party = partyBySlug((await params).slug);
  return party ? { title: `${party.name} · ROOMi`, description: party.description } : {};
}

const Icon = {
  size: (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M8 16l16-8 16 8v18l-16 8-16-8z M8 16l16 8 16-8 M24 24v18" />
    </svg>
  ),
  place: (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M6 22L24 7l18 15 M11 18v23h26V18 M20 41V29h8v12" />
    </svg>
  ),
  guests: (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="13" cy="17" r="5" />
      <circle cx="24" cy="14" r="5.5" />
      <circle cx="35" cy="17" r="5" />
      <path d="M4 36c1-6 5-9 9-9s6 1.5 7 3 M17 38c1-7 4-11 7-11s6 4 7 11 M44 36c-1-6-5-9-9-9s-6 1.5-7 3" />
    </svg>
  ),
  power: (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M18 6v10 M30 6v10 M13 16h22v8a11 11 0 0 1-22 0z M24 35v8 M26 21l-4 6h5l-3 5" />
    </svg>
  ),
};

export default async function Scene({ params }: { params: Promise<{ slug: string }> }) {
  const party = partyBySlug((await params).slug);
  if (!party) notFound();
  const i = PARTIES.indexOf(party);
  const prev = PARTIES[(i + PARTIES.length - 1) % PARTIES.length];
  const next = PARTIES[(i + 1) % PARTIES.length];

  const req = [
    { icon: Icon.size, label: "Size", value: party.requirements.size },
    { icon: Icon.place, label: "Place", value: party.requirements.place },
    { icon: Icon.guests, label: "Guests", value: party.requirements.guests },
    { icon: Icon.power, label: "Power", value: party.requirements.power },
  ];

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <p className={styles.no}>
          Scene 0{party.no} <Disc size={22} />
        </p>
        <h1 className={styles.title} data-party={party.slug}>
          {party.name}
        </h1>
        <div className={styles.headCopy}>
          <p className={styles.lead}>{party.lead}</p>
          <p className={styles.intro}>{party.intro}</p>
        </div>
      </header>

      <figure className={styles.hero} data-tone="dark">
        <img src={party.hero} alt={party.heroAlt} fetchPriority="high" />
        <figcaption>{party.tags.map((t) => `#${t}`).join("  ")}</figcaption>
      </figure>

      <section className={styles.block} aria-labelledby="req-title">
        <h2 id="req-title" className={styles.blockTitle}>Requirements</h2>
        <ul className={styles.req}>
          {req.map((r) => (
            <li key={r.label}>
              {r.icon}
              <span className={styles.reqLabel}>{r.label}</span>
              <span className={styles.reqValue}>{r.value}</span>
            </li>
          ))}
        </ul>
        <p className={styles.note}>전시용 예시 기준이에요. 실제 공간 조건은 문의 단계에서 함께 확인해요.</p>
      </section>

      <section className={styles.block} aria-labelledby="ess-title">
        <h2 id="ess-title" className={styles.blockTitle}>Essentials</h2>
        <ol className={styles.essentials}>
          {party.essentials.map((e, n) => (
            <li key={e.title}>
              <div className={styles.plate}>
                <img src={e.image} alt="" loading="lazy" style={e.pos ? { objectPosition: e.pos } : undefined} />
                <span className={styles.n}>{String(n + 1).padStart(2, "0")}</span>
              </div>
              <div>
                <h3>{e.title}</h3>
                <p>{e.copy}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className={styles.optional}>
          <h2 id="add-title" className={styles.optionalHead}>
            Add-ons <span>Optional extras</span>
          </h2>
          <ul className={styles.addons} aria-labelledby="add-title">
            {party.addOns.map((a) => (
              <li key={a.title}>
                <img src={a.image} alt="" loading="lazy" />
                <div>
                  <h3>{a.title}</h3>
                  <p>{a.copy}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Link href={`/lets-party?party=${party.slug}`} className={styles.cta}>
        <span>Let&apos;s party</span>
        <span className={styles.ctaSub}>{party.name}로 내 파티 만들기 →</span>
      </Link>

      <nav className={styles.pager} aria-label="다른 장면">
        <Link href={`/whats-going-on/${prev.slug}`}>
          <span>← Prev</span>
          {prev.name}
        </Link>
        <Link href="/whats-going-on">All scenes</Link>
        <Link href={`/whats-going-on/${next.slug}`}>
          <span>Next →</span>
          {next.name}
        </Link>
      </nav>

      <SiteFooter />
    </main>
  );
}
