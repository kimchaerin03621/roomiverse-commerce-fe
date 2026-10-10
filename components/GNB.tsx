"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/store";
import styles from "./GNB.module.css";

const LEFT: { href: string; label: string; brand?: string }[] = [
  { href: "/meet-roomi", label: "Meet", brand: "ROOMi" },
  { href: "/whats-going-on", label: "What's Going On" },
  { href: "/lets-party", label: "Let's Party" },
  { href: "/shop", label: "Shop" },
];

export default function GNB() {
  const [open, setOpen] = useState(false);
  const [onLight, setOnLight] = useState(false);
  const { count } = useCart();
  const pathname = usePathname();

  // Read what sits under the bar: dark imagery keeps it white and bare,
  // paper sections turn it into an ink-on-paper bar.
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const under = document
        .elementsFromPoint(window.innerWidth / 2, 36)
        .find((el) => !el.closest("header"));
      setOnLight(!under?.closest('[data-tone="dark"]'));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={styles.gnb} data-open={open || undefined} data-surface={onLight ? "light" : "dark"}>
      <nav className={styles.left} aria-label="주 메뉴">
        <button
          type="button"
          className={styles.menuToggle}
          aria-expanded={open}
          aria-controls="gnb-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
        <ul id="gnb-menu" className={styles.links}>
          {LEFT.map((item) => (
            <li key={item.href}>
              <Link href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
                {item.label}
                {item.brand && (
                  <>
                    {" "}
                    <span className={styles.brand}>{item.brand}</span>
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Link href="/" className={styles.logo} aria-label="ROOMi 홈">
        <img src="/logo.png" alt="" width={2010} height={399} />
      </Link>

      <nav className={styles.right} aria-label="계정">
        <ul className={styles.links}>
          <li>
            <Link href="/cart">
              Cart <span className={styles.count}>({count})</span>
            </Link>
          </li>
          <li>
            <Link href="/my">My</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
