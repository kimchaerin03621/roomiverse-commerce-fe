import type { Metadata } from "next";
import Link from "next/link";
import ObiBand from "@/components/site/ObiBand";
import PageHead from "@/components/site/PageHead";
import SiteFooter from "@/components/site/SiteFooter";
import Disc from "@/components/site/Disc";
import { PARTIES } from "@/content/parties";
import styles from "./wgo.module.css";

export const metadata: Metadata = {
  title: "What's Going On · ROOMi",
  description: "House, Listening, Day, Themed, Rave, After. ROOMi가 제안하는 여섯 가지 파티 장면.",
};

/** Where each photo is cropped to, since the same photo is shown in a very different frame in each layout. */
const POS: Record<string, { a?: string; b?: string; c?: string }> = {
  "house-party": { a: "40% 50%", b: "50% 45%", c: "40% 40%" },
  "listening-party": { a: "50% 55%", b: "50% 30%" },
  "day-party": { a: "50% 40%" },
  "themed-party": { a: "50% 50%", b: "50% 70%", c: "30% 40%" },
  "after-party": { a: "50% 50%", b: "50% 55%" },
};

/** Keep each " / " attached to the word before it, so a line never starts with a slash. */
const glueSlash = (v: string) => v.replace(/ \/ /g, "\u00A0/ ");

const href = (slug: string) => `/whats-going-on/${slug}`;

function Photo({ className, src, alt, pos }: { className: string; src: string; alt: string; pos?: string }) {
  return (
    <div className={className}>
      <img className={styles.photo} style={{ objectPosition: pos }} src={src} alt={alt} loading="lazy" />
    </div>
  );
}

export default function WhatsGoingOn() {
  return (
    <main className={styles.page}>
      <PageHead title="ROOMi SCENE" standfirst="Different ways to gather, listen and party. 여섯 가지 장면 중 나와 닮은 파티를 찾아보세요." />
      <ObiBand tracks={PARTIES.map((p) => ({ id: p.slug, label: p.short }))} />

      {PARTIES.map((party) => {
        const dark = party.slug === "rave-party";
        const pos = POS[party.slug] ?? {};
        return (
          <section
            key={party.slug}
            id={party.slug}
            className={styles.scene}
            data-layout={party.slug}
            aria-labelledby={`${party.slug}-title`}
          >
            <header className={styles.head}>
              <p className={styles.sceneNo}>Scene 0{party.no}</p>
              <h2 id={`${party.slug}-title`} className={styles.sceneTitle}>
                {party.name}
                <Disc className={styles.disc} size={44} />
              </h2>
            </header>

            {!dark && (
              <div className={styles.media}>
                <Photo className={styles.imgA} src={party.hero} alt={party.heroAlt} pos={pos.a} />
                <Photo className={styles.imgB} src={party.side} alt="" pos={pos.b} />
                {party.extra && (
                  <Photo className={styles.imgC} src={party.extra.src} alt={party.extra.alt} pos={pos.c} />
                )}
              </div>
            )}

            <div className={styles.copy} data-tone={dark ? "dark" : undefined}>
              {dark && <img className={styles.darkBg} src={party.hero} alt="" loading="lazy" />}
              <div className={styles.intro}>
                <ul className={styles.tags} aria-label="Tags">
                  {party.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <p className={styles.desc}>{party.description}</p>
                <Link className={styles.explore} href={href(party.slug)}>
                  Explore this scene <span aria-hidden="true">→</span>
                </Link>
              </div>

              <div className={styles.spec}>
                <h3 className={styles.makeTitle}>Make it yours</h3>
                <dl>
                  {(
                    [
                      ["Space", party.spec.space],
                      ["Sound", party.spec.sound],
                      ["Mood", party.spec.mood],
                      ["Key elements", party.spec.key],
                    ] as const
                  ).map(([k, v]) => (
                    <div key={k} className={styles.pair}>
                      <dt>{k}</dt>
                      <dd>{glueSlash(v)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>
        );
      })}

      <SiteFooter />
    </main>
  );
}
