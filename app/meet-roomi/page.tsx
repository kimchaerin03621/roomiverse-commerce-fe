import type { Metadata } from "next";
import Link from "next/link";
import ObiBand from "@/components/site/ObiBand";
import SiteFooter from "@/components/site/SiteFooter";
import HeroLit from "./HeroLit";
import Transform from "./Transform";
import styles from "./meet.module.css";

export const metadata: Metadata = {
  title: "Meet ROOMi · ROOMiVERSE",
  description: "음악을 직접 플레이하고 싶은 누구나, 어디서든 나만의 음악적 우주를 펼칠 수 있도록. DJ 라이프스타일 브랜드 ROOMi를 소개합니다.",
};

const TRACKS = [
  { id: "brand-story", label: "Brand Story" },
  { id: "transform", label: "Before / After" },
  { id: "about-us", label: "About Us" },
  { id: "value", label: "Value" },
  { id: "how", label: "How" },
];

const VALUES = [
  { key: "play", en: "Play", ko: "놀이", line: ["Touch it. Try it.", "Make it yours."] },
  { key: "immersion", en: "Immersion", ko: "몰입", line: ["Less setup.", "More music."] },
  { key: "expansion", en: "Expansion", ko: "확장", line: ["Start small.", "Make it bigger."] },
];

const STEPS = [
  {
    no: "01",
    en: "Gear",
    ko: "장비",
    text: "직접 만지고 플레이하는 ROOMi의 DJ 컨트롤러와 굿즈.",
    img: "/meet/how-gear.webp",
    pos: "50% 50%",
    href: "/shop",
    cta: "Shop",
  },
  {
    no: "02",
    en: "Space",
    ko: "공간 연출",
    text: "조명과 소품으로 익숙한 공간을 파티 분위기로.",
    img: "/meet/how-space.webp",
    pos: "50% 40%",
    href: "/whats-going-on",
    cta: "See the scenes",
  },
  {
    no: "03",
    en: "Setup",
    ko: "세팅",
    text: "복잡한 설치는 ROOMi가. 당신은 플레이만 하세요.",
    img: "/meet/how-setup.webp",
    pos: "68% 40%",
    href: "/lets-party",
    cta: "Let's party",
  },
];

export default function MeetRoomi() {
  return (
    <main className={styles.page}>
      {/* Hero: always exactly one viewport, so the story starts on the first scroll. */}
      <section className={styles.hero} data-tone="dark" aria-labelledby="meet-title">
        <img className={styles.heroPhoto} src="/meet/hero.webp" alt="" fetchPriority="high" />
        <div className={styles.heroShade} aria-hidden="true" />
        <HeroLit src="/meet/hero.webp" targetId="meet-wordmark" />
        <div className={styles.heroBody}>
          <h1 id="meet-title" className={styles.wordmark}>
            <span id="meet-wordmark" className={styles.wordmarkBox} aria-hidden="true" />
            <span className={styles.wordmarkRoomi} aria-hidden="true" />
            <span className={styles.wordmarkVerse} aria-hidden="true" />
            <span className="visually-hidden">ROOMi, ROOMiVERSE</span>
          </h1>
          <p className={styles.heroIntro}>
            Anyone, anywhere — your own musical universe.
            <span lang="ko">어디서 누구와 함께하든, 평범한 공간이 파티가 됩니다.</span>
          </p>
        </div>
        <a className={styles.scrollCue} href="#brand-story">
          <span>Scroll</span>
          <svg viewBox="0 0 24 14" aria-hidden="true">
            <path d="M1 1l11 11L23 1" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </a>
      </section>

      <ObiBand tracks={TRACKS} />

      <section id="brand-story" className={styles.story} aria-labelledby="story-title">
        <h2 id="story-title" className={styles.storyLead}>
          Ordinary space, <em>party space.</em>
        </h2>
        <div className={styles.storyCols}>
          <p lang="ko">
            어디서 누구와 함께하든 원하는 파티를 만들 수 있도록, ROOMi는 평범한 공간이 파티 공간으로 변화하는 경험을
            제공합니다. 누구든지 어디에서든지 자유롭게 나만의 음악적 우주의 방을 펼칠 수 있게 해 줍니다.
          </p>
          <p>
            For those who love DJing but have been held back by the barriers of equipment, ROOMi offers an experience where
            anyone can become an artist. ROOMi empowers anyone, anywhere, to freely create a space that reflects their own
            musical universe.
          </p>
        </div>
      </section>

      <Transform />

      <section id="about-us" className={styles.about} aria-labelledby="about-title">
        <img className={styles.aboutPhoto} src="/meet/about.webp" alt="핑크 조명 아래 병을 높이 들어 건배하는 사람들" loading="lazy" />
        <div className={styles.aboutText}>
          <h2 id="about-title" className={styles.aboutTitle}>
            About
            <br />
            Us
            <img className={styles.sprayX} src="/meet/graffiti-x.svg" alt="" aria-hidden="true" />
          </h2>
          <p>
            Our mission is to lower the barriers to DJing and make it easier for anyone to play, share, and enjoy music
            anywhere, with anyone.
          </p>
          <p lang="ko">
            음악과 파티를 직접 즐기고 싶지만 장비, 공간 구성, 세팅이 부담스러운 사람들을 위해. 장비와 공간 연출, 세팅
            서비스로 그 문턱을 낮춥니다.
          </p>
        </div>
      </section>

      <section id="value" className={styles.values} data-tone="dark" aria-labelledby="value-title">
        <h2 id="value-title" className={styles.valuesTitle}>Value</h2>
        <ul className={styles.valueList}>
          {VALUES.map((v) => (
            <li key={v.key} className={styles.value}>
              <img src={`/meet/value-${v.key}.webp`} alt="" loading="lazy" />
              <h3>
                {v.en} <span lang="ko">{v.ko}</span>
              </h3>
              <p>
                {v.line[0]}
                <br />
                {v.line[1]}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section id="how" className={styles.how} aria-labelledby="how-title">
        <div className={styles.howHead}>
          <h2 id="how-title" className={styles.howTitle}>How</h2>
          <p lang="ko" className={styles.howLead}>
            장비에서 공간, 세팅까지. 세 단계로 내 방이 파티장이 돼요.
          </p>
        </div>
        <ol className={styles.steps}>
          {STEPS.map((step) => (
            <li key={step.no} className={styles.step}>
              <img className={styles.stepImg} src={step.img} alt="" loading="lazy" style={{ objectPosition: step.pos }} />
              <div className={styles.stepBody}>
                <span className={styles.stepNo}>{step.no}</span>
                <h3 className={styles.stepName}>
                  {step.en} <span lang="ko">{step.ko}</span>
                </h3>
                <p lang="ko">{step.text}</p>
                <Link href={step.href} className={styles.stepCta}>
                  {step.cta} →
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <SiteFooter />
    </main>
  );
}
