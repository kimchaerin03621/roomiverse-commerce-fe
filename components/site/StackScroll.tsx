"use client";

import { useEffect } from "react";

/**
 * Lets stacked sheets pin: each element matching `selector` sticks once its bottom edge reaches the bottom of the
 * window (so a sheet taller than the screen can be read to the end first), and the next sheet slides up over it.
 * It only writes `--stick` on those elements; the CSS does the sticking.
 */
export default function StackScroll({ selector }: { selector: string }) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
    const set = () => {
      const vh = window.innerHeight;
      els.forEach((el) => el.style.setProperty("--stick", `${Math.min(0, vh - el.offsetHeight)}px`));
    };
    set();
    const ro = new ResizeObserver(set);
    els.forEach((el) => ro.observe(el));
    window.addEventListener("resize", set);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", set);
    };
  }, [selector]);
  return null;
}
