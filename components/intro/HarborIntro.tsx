"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ContainerGate from "@/components/shop3d/ContainerGate";
import styles from "./HarborIntro.module.css";

/**
 * 2.5D harbor parallax. Every layer drifts off one shared clock, offset by its
 * depth (0 = horizon, 1 = nearest crane), so the scene moves as one camera.
 */

const MAX_X = 2.2; // % of stage width at depth 1
const MAX_Y = 1.3; // % of stage height at depth 1
const ENTER_MS = 700; // the doors cover the zoom well before the page changes
const GATE_MS = 2600; // keep in step with ShopScene

/*
 * Light shafts from a source deep inside the container, aimed out through the
 * door (≈116° in CSS conic terms). Each shaft breathes on its own period, like
 * sun through moving leaves, so the light never pulses in unison.
 */
const RAYS = [
  { angle: 90, width: 2.5, peak: 0.7, pulse: 2.2, drift: 7.1, delay: -0.4 },
  { angle: 96, width: 4, peak: 0.85, pulse: 3.1, drift: 8.2, delay: -2.1 },
  { angle: 102, width: 2, peak: 0.6, pulse: 2.5, drift: 6.4, delay: -1.5 },
  { angle: 108, width: 5, peak: 0.9, pulse: 2.8, drift: 7.6, delay: -1.2 },
  { angle: 115, width: 3, peak: 0.75, pulse: 3.8, drift: 9.3, delay: -3.3 },
  { angle: 121, width: 4.5, peak: 0.85, pulse: 2.0, drift: 6.8, delay: -0.8 },
  { angle: 128, width: 2.5, peak: 0.65, pulse: 3.4, drift: 8.9, delay: -2.7 },
  { angle: 134, width: 4, peak: 0.75, pulse: 2.5, drift: 7.9, delay: -1.9 },
  { angle: 141, width: 2.5, peak: 0.55, pulse: 3.7, drift: 9.7, delay: -3.8 },
];

export default function HarborIntro() {
  const stageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [entering, setEntering] = useState(false);
  const [pct, setPct] = useState(0);
  const countRaf = useRef(0);

  useEffect(() => () => cancelAnimationFrame(countRaf.current), []);

  // Camera: pointer (or idle drift on touch) → eased offset written as CSS vars.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let pointerSeen = false;
    let raf = 0;
    let last = performance.now();

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      pointerSeen = true;
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!fine && !pointerSeen) {
        const t = now / 1000;
        target.x = Math.sin(t * 0.23) * 0.55;
        target.y = Math.cos(t * 0.17) * 0.3;
      }
      const k = 1 - Math.exp(-dt * 4.2);
      cur.x += (target.x - cur.x) * k;
      cur.y += (target.y - cur.y) * k;
      stage.style.setProperty("--cam-x", cur.x.toFixed(4));
      stage.style.setProperty("--cam-y", cur.y.toFixed(4));
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const enter = () => {
    if (entering) return;
    setEntering(true);
    const t0 = Date.now();
    try {
      sessionStorage.setItem("roomi:gate-t0", String(t0));
    } catch {}
    // The count starts at once; the shop page picks it up from the same start time.
    const count = () => {
      setPct(Math.min(92, Math.round(((Date.now() - t0) / GATE_MS) * 100)));
      countRaf.current = requestAnimationFrame(count);
    };
    countRaf.current = requestAnimationFrame(count);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => router.push("/shop/3d"), reduce ? 200 : ENTER_MS);
  };

  return (
    <main className={styles.intro} data-entering={entering || undefined} data-tone="dark">
      <h1 className="visually-hidden">ROOMi, 내 방안의 나만의 우주</h1>

      <div
        ref={stageRef}
        className={styles.stage}
        style={{ "--max-x": `${MAX_X}%`, "--max-y": `${MAX_Y}%` } as React.CSSProperties}
      >
        <picture>
          <source srcSet="/intro/bg-sky-sea.webp" type="image/webp" />
          <img className={`${styles.layer} ${styles.bg}`} src="/intro/bg-sky-sea.png" alt="" style={{ "--d": 0.12 } as React.CSSProperties} />
        </picture>
        <picture>
          <source srcSet="/intro/mid-yard.webp" type="image/webp" />
          <img className={`${styles.layer} ${styles.mid}`} src="/intro/mid-yard.png" alt="" style={{ "--d": 0.4 } as React.CSSProperties} />
        </picture>

        <button
          type="button"
          className={`${styles.layer} ${styles.trigger}`}
          style={{ "--d": 0.4 } as React.CSSProperties}
          onClick={enter}
          aria-label="빛나는 컨테이너 안으로 들어가기 (3D Shop)"
        >
          <span className={styles.lift}>
            <picture>
          <source srcSet="/intro/trigger-container.webp" type="image/webp" />
          <img src="/intro/trigger-container.png" alt="" width={1448} height={1086} />
        </picture>
            <span className={styles.glow} aria-hidden="true">
              <span className={styles.source}>
                {RAYS.map((r, i) => (
                  <span
                    key={i}
                    className={styles.ray}
                    style={
                      {
                        "--a": `${r.angle}deg`,
                        "--w": `${r.width}deg`,
                        "--peak": r.peak,
                        "--pulse": `${r.pulse}s`,
                        "--drift": `${r.drift}s`,
                        "--delay": `${r.delay}s`,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </span>
            </span>
          </span>
        </button>

        <picture>
          <source srcSet="/intro/fg-right-crane.webp" type="image/webp" />
          <img className={`${styles.layer} ${styles.fgRight}`} src="/intro/fg-right-crane.png" alt="" style={{ "--d": 0.75 } as React.CSSProperties} />
        </picture>
        <picture>
          <source srcSet="/intro/fg-left-crane.webp" type="image/webp" />
          <img className={`${styles.layer} ${styles.fgLeft}`} src="/intro/fg-left-crane.png" alt="" style={{ "--d": 1 } as React.CSSProperties} />
        </picture>
      </div>

      <div className={styles.flash} aria-hidden="true" />
      {entering && <ContainerGate pct={pct} fade />}
    </main>
  );
}
