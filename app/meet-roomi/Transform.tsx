"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./meet.module.css";

const BEFORE = "/meet/transform-before.webp";
const AFTER = "/meet/transform-after.webp";
const REST = 56;

/** Same room, before / after (two photographs, same camera). Drag (or use arrow keys) to turn it into a party. */
export default function Transform() {
  const stage = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const [pos, setPos] = useState(100);

  // On first view the room "switches on" once by itself, so the idea is understood before anyone drags.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        if (reduce) return setPos(REST);
        const start = performance.now();
        const run = (now: number) => {
          if (touched.current) return;
          const t = Math.min((now - start - 500) / 1900, 1);
          if (t > 0) setPos(100 - (100 - REST) * (1 - Math.pow(1 - t, 3)));
          if (t < 1) raf = requestAnimationFrame(run);
        };
        raf = requestAnimationFrame(run);
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="transform" className={styles.transform} aria-labelledby="transform-title">
      <h2 id="transform-title" className="visually-hidden">
        Before and after: an ordinary room becomes a party space
      </h2>
      <div className={styles.stage} ref={stage} style={{ "--pos": `${pos}%` } as React.CSSProperties}>
        <img className={styles.stageImg} src={BEFORE} alt="햇빛이 드는 평범한 거실에서 사람들이 가랜드를 달고 있다" loading="lazy" />
        <div className={styles.afterLayer} aria-hidden="true">
          <img className={styles.stageImg} src={AFTER} alt="" loading="lazy" />
        </div>
        <div className={styles.divider} aria-hidden="true">
          <span className={styles.knob}>
            <svg viewBox="0 0 28 12">
              <path d="M8 1L2 6l6 5M20 1l6 5-6 5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </span>
        </div>
        <span className={`${styles.chip} ${styles.chipBefore}`}>
          Before <span lang="ko">평범한 공간</span>
        </span>
        <span className={`${styles.chip} ${styles.chipAfter}`}>
          After <span lang="ko">ROOMi의 파티 공간</span>
        </span>
        <input
          className={styles.range}
          type="range"
          min={0}
          max={100}
          step={0.5}
          value={pos}
          onChange={(e) => {
            touched.current = true;
            setPos(Number(e.target.value));
          }}
          aria-label="Before와 After 비교: 오른쪽으로 갈수록 평범한 공간, 왼쪽으로 갈수록 파티 공간"
        />
      </div>
    </section>
  );
}
