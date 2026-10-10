import Link from "next/link";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Link href="/" aria-label="ROOMi 항구로">
        <img src="/logo.png" alt="" width={2010} height={399} />
      </Link>
      <nav aria-label="푸터">
        <Link href="/meet-roomi">
          Meet <span style={{ textTransform: "none" }}>ROOMi</span>
        </Link>
        <Link href="/whats-going-on">What&apos;s Going On</Link>
        <Link href="/lets-party">Let&apos;s Party</Link>
        <Link href="/shop">Shop</Link>
        <Link href="/my">My</Link>
      </nav>
      <span style={{ textTransform: "none" }}>© 2026 ROOMiVERSE · 졸업전시 프로젝트</span>
    </footer>
  );
}
