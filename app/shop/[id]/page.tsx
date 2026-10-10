import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/site/SiteFooter";
import ProductArt from "@/components/shop/ProductArt";
import AddToCart from "@/components/shop/AddToCart";
import { PRODUCTS, productById } from "@/content/products";
import { won } from "@/lib/format";
import ui from "@/components/site/ui.module.css";
import styles from "./product.module.css";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = productById((await params).id);
  return p ? { title: `${p.name} · ROOMi Shop`, description: p.summary } : {};
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const product = productById((await params).id);
  if (!product) notFound();
  const others = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <ProductArt product={product} large />
        <div className={styles.info}>
          <Link href="/shop" className={styles.back}>
            ← Shop
          </Link>
          <span className={styles.cat}>
            RMV-{product.no} · {product.kind}
          </span>
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.price}>
            {won(product.price)} <span className={ui.demo}>Sample price</span>
          </p>
          <p className={styles.summary}>{product.summary}</p>
          <ul className={styles.details}>
            {product.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <AddToCart product={product} />
        </div>
      </div>

      <section className={styles.more} aria-labelledby="more-title">
        <h2 id="more-title">More from ROOMi</h2>
        <ul>
          {others.map((p) => (
            <li key={p.id}>
              <Link href={`/shop/${p.id}`}>
                <ProductArt product={p} />
                <span>{p.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <SiteFooter />
    </main>
  );
}
