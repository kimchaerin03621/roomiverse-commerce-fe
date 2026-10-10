"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/content/products";
import { useCart } from "@/lib/store";
import ui from "@/components/site/ui.module.css";
import styles from "./AddToCart.module.css";

export default function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const [option, setOption] = useState(product.options[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <div className={styles.box}>
      <div>
        <span className={ui.label}>Option</span>
        <div className={ui.choices} role="radiogroup">
          {product.options.map((o) => (
            <label key={o} className={ui.choice}>
              <input type="radio" name="option" checked={option === o} onChange={() => setOption(o)} />
              <span>{o}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className={ui.label} id="qty-label">Quantity</span>
        <div className={styles.qty} role="group" aria-labelledby="qty-label">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="수량 줄이기">
            −
          </button>
          <output aria-live="polite">{qty}</output>
          <button type="button" onClick={() => setQty((q) => Math.min(9, q + 1))} aria-label="수량 늘리기">
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        className={ui.button}
        onClick={() => {
          add({ productId: product.id, option, qty });
          setAdded(true);
        }}
      >
        Add to cart
      </button>

      {added && (
        <p className={styles.added} role="status">
          장바구니에 담았어요. <Link href="/cart">Cart 보기 →</Link>
        </p>
      )}
    </div>
  );
}
