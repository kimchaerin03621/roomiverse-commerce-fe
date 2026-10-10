import type { Product } from "@/content/products";
import styles from "./ProductArt.module.css";

/**
 * Stand-in product plate until real photos arrive: a transparent single-product render of the 3D shop model (public/products)
 * on a soft light plate.
 */
export default function ProductArt({ product, large }: { product: Product; large?: boolean }) {
  const n = parseInt(product.no, 10) || 1;
  const glow = {
    "--x1": `${(n * 29) % 55 + 30}%`,
    "--y1": `${(n * 41) % 40 + 18}%`,
    "--x2": `${(n * 53) % 50 + 8}%`,
    "--y2": `${(n * 23) % 35 + 50}%`,
    "--size1": `${50 + (n % 3) * 12}%`,
  } as React.CSSProperties;
  return (
    <div className={styles.art} data-kind={product.kind} data-tone={n % 3} data-large={large || undefined} style={glow} role="img" aria-label={product.name}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.photo} src={`/products/${product.id}.png`} alt="" loading="lazy" />
      <span className={styles.cat}>
        RMV-{product.no} · {product.kind === "Hardware" ? "Gear" : "Goods"}
      </span>
      <span className={styles.name}>{product.name}</span>
    </div>
  );
}
