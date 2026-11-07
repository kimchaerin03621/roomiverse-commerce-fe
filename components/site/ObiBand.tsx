"use client";

import { useEffect, useState } from "react";
import styles from "./ObiBand.module.css";

type Track = { id: string; label: string };

/**
 * Page index, stood upright on the right edge: a short line and a number per section.
 * The current one stretches out and shows its name. It appears once the first section is reached
 * and inverts against whatever it floats over, so it reads on light and dark sections alike.
 */
export default function ObiBand({ tracks, inks }: { tracks: Track[]; inks?: Record<string, "ink" | "paper"> }) {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const sections = tracks
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => Boolean(el));
    let raf = 0;
    // The current section is the last one whose top edge has passed a line 35% down the window. Unlike an intersection
    // check this also works when sheets are pinned and slide over each other.
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.35;
      let id: string | null = null;
      for (const el of sections) if (el.getBoundingClientRect().top <= line) id = el.id;
      setCurrent((prev) => (prev === id ? prev : id));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [tracks]);

  return (
    <nav className={styles.index} data-on={current ? "true" : "false"} data-ink={current ? inks?.[current] : undefined} aria-label="이 페이지의 섹션">
      <ol>
        {tracks.map((t, i) => (
          <li key={t.id}>
            <a href={`#${t.id}`} aria-current={current === t.id ? "location" : undefined}>
              <span className={styles.label}>{t.label}</span>
              <span className={styles.tick} aria-hidden="true" />
              <span className={styles.no}>{String(i + 1).padStart(2, "0")}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
