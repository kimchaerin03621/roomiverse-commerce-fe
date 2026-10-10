import styles from "./ContainerGate.module.css";

/**
 * The container doors from the intro: shut with pink light leaking through the seam while the 3D shop loads,
 * then they swing open toward the viewer. Shown by the intro right after the click and carried on by the shop page.
 */
export default function ContainerGate({ pct, open, fade, onGone }: { pct: number; open?: boolean; fade?: boolean; onGone?: () => void }) {
  return (
    <div
      className={styles.gate}
      data-open={open || undefined}
      data-fade={fade || undefined}
      aria-hidden="true"
      onTransitionEnd={(e) => e.target === e.currentTarget && open && onGone?.()}
    >
      <div className={styles.glow} />
      {(["l", "r"] as const).map((side) => (
        <div key={side} className={`${styles.leaf} ${styles[side]}`}>
          <span className={styles.bar} />
          <span className={styles.bar} />
        </div>
      ))}
      <div className={styles.seam} />
      <p className={styles.gateLabel}>
        ROOMiVERSE <span>{pct}%</span>
      </p>
    </div>
  );
}
