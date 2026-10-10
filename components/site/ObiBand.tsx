"use client";

import { useEffect, useState } from "react";
import styles from "./ObiBand.module.css";

type Track = { id: string; label: string };

/**
 * Page index, stood upright on the right edge: a short line and a number per section.
 * The current one stretches out and shows its name. It appears once the first section is reached
 * and inverts against whatever it floats over, so it reads on light and dark sections alike.
 */
export default function ObiBand({ tracks }: { tracks: Track[] }) {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const sections = tracks
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => Boolean(el));
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setCurrent(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [tracks]);

  return (
    <nav className={styles.index} data-on={current ? "true" : "false"} aria-label="이 페이지의 섹션">
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
