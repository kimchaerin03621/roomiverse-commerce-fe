"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./meet.module.css";

type Box = { x: number; y: number; w: number; h: number };

/**
 * The hero photograph a second time, undimmed, cut to the ROOMi lettering and laid over the dimmed copy underneath,
 * so the letters read as windows onto the party. It measures the real wordmark and keeps its mask on top of it.
 */
export default function HeroLit({ src, targetId }: { src: string; targetId: string }) {
  const layer = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box | null>(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    const hero = layer.current?.parentElement;
    if (!target || !hero) return;

    // Layout offsets, not bounding rects: the wordmark's rise-in animation moves its painted box but not its layout box.
    const measure = () => {
      let x = 0;
      let y = 0;
      for (let el: HTMLElement | null = target; el && el !== hero; el = el.offsetParent as HTMLElement | null) {
        x += el.offsetLeft;
        y += el.offsetTop;
      }
      setBox({ x, y, w: target.offsetWidth, h: target.offsetHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(target);
    ro.observe(hero);
    // Layout can settle after fonts load and the intro copy below the wordmark gets its height.
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [targetId]);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    if (box) target.setAttribute("data-lit", "");
    return () => target.removeAttribute("data-lit");
  }, [box, targetId]);

  const mask = box ? `url("/meet/wordmark-roomi@4x.png") ${box.x}px ${box.y}px / ${box.w}px ${box.h}px no-repeat` : undefined;

  return (
    <div
      ref={layer}
      className={styles.heroLit}
      aria-hidden="true"
      style={{ WebkitMask: mask, mask, opacity: box ? undefined : 0 }}
    >
      <img className={styles.heroPhotoLit} src={src} alt="" />
    </div>
  );
}
