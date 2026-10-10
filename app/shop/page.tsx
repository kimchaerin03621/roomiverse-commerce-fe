import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "@/components/site/PageHead";
import SiteFooter from "@/components/site/SiteFooter";
import ProductArt from "@/components/shop/ProductArt";
import { PRODUCTS } from "@/content/products";
import { won } from "@/lib/format";
import ui from "@/components/site/ui.module.css";
import styles from "./shop.module.css";

export const metadata: Metadata = {
  title: "Shop · ROOMi",
  description: "ROOMi DJ 컨트롤러와 굿즈. (전시용 샘플 가격)",
};

export default function Shop() {
  const [hero, ...goods] = PRODUCTS;
  return (
    <main className={styles.page}>
      <PageHead title="SHOP" standfirst="직접 만지고 플레이하는 ROOMi의 DJ 컨트롤러와 굿즈. 표시된 가격은 전시용 예시예요." />

      <Link href={`/shop/${hero.id}`} className={styles.feature}>
        <ProductArt product={hero} large />
        <div className={styles.featureText}>
          <span className={styles.cat}>RMV-{hero.no} · {hero.kind}</span>
          <h2>{hero.name}</h2>
          <p>{hero.summary}</p>
          <span className={styles.price}>
            {won(hero.price)} <span className={ui.demo}>Sample price</span>
          </span>
        </div>
      </Link>

      <ul className={styles.grid}>
        {goods.map((p) => (
          <li key={p.id}>
            <Link href={`/shop/${p.id}`} className={styles.card}>
              <ProductArt product={p} />
              <span className={styles.cardName}>{p.name}</span>
              <span className={styles.cardPrice}>{won(p.price)}</span>
            </Link>
          </li>
        ))}
      </ul>

      <SiteFooter />
    </main>
  );
}
