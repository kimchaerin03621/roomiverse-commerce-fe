"use client";

import Link from "next/link";
import { useState } from "react";
import { productById } from "@/content/products";
import { makeNumber, saveRecord, useCart, won, type OrderRecord } from "@/lib/store";
import ProductArt from "./ProductArt";
import ui from "@/components/site/ui.module.css";
import styles from "./CartView.module.css";

export default function CartView() {
  const { lines, setQty, remove, clear } = useCart();
  const [name, setName] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderRecord | null>(null);

  const rows = lines
    .map((l) => ({ line: l, product: productById(l.productId) }))
    .filter((r): r is { line: (typeof lines)[number]; product: NonNullable<ReturnType<typeof productById>> } => Boolean(r.product));
  const subtotal = rows.reduce((n, r) => n + r.product.price * r.line.qty, 0);
  const total = subtotal;

  const pay = () => {
    if (!name.trim()) return setError("주문자 이름을 입력해 주세요.");
    if (!agree) return setError("전시용 결제라는 안내에 동의해 주세요.");
    const record: OrderRecord = {
      kind: "order",
      number: makeNumber("O"),
      createdAt: new Date().toISOString(),
      lines: rows.map((r) => ({ name: r.product.name, option: r.line.option, qty: r.line.qty, price: r.product.price })),
      total,
      name: name.trim(),
      status: "결제 완료",
    };
    saveRecord(record);
    setOrder(record);
    clear();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (order) {
    return (
      <main className={styles.page}>
        <section className={styles.done} aria-live="polite">
          <p className={ui.demo}>Exhibition demo · 실제 결제가 아니에요</p>
          <h1 className={styles.doneTitle}>Thank you.</h1>
          <p className={styles.number}>
            주문번호 <strong>{order.number}</strong>
          </p>
          <ul className={styles.receipt}>
            {order.lines.map((l) => (
              <li key={`${l.name}-${l.option}`}>
                <span>
                  {l.name} · {l.option} × {l.qty}
                </span>
                <span>{won(l.price * l.qty)}</span>
              </li>
            ))}
            <li className={styles.receiptTotal}>
              <span>Total</span>
              <span>{won(order.total)}</span>
            </li>
          </ul>
          <p className={ui.hint}>주문번호는 이 브라우저에 저장돼요. My에서 다시 조회할 수 있어요.</p>
          <div className={styles.actions}>
            <Link className={ui.button} href={`/my?no=${order.number}`}>
              My에서 확인하기 →
            </Link>
            <Link className={ui.ghost} href="/shop">
              Continue shopping
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Cart</h1>
        <p className={styles.standfirst}>
          장바구니는 새로고침하면 비워져요. <span className={ui.demo}>Exhibition demo</span>
        </p>
      </header>

      {rows.length === 0 ? (
        <section className={styles.empty}>
          <p>장바구니가 비어 있어요.</p>
          <Link className={ui.button} href="/shop">
            Go to shop →
          </Link>
        </section>
      ) : (
        <div className={styles.layout}>
          <ul className={styles.lines}>
            {rows.map(({ line, product }) => (
              <li key={`${line.productId}-${line.option}`}>
                <Link href={`/shop/${product.id}`} className={styles.thumb}>
                  <ProductArt product={product} />
                </Link>
                <div className={styles.lineInfo}>
                  <Link href={`/shop/${product.id}`} className={styles.lineName}>
                    {product.name}
                  </Link>
                  <span className={styles.lineOpt}>Option · {line.option}</span>
                  <div className={styles.qty} role="group" aria-label={`${product.name} 수량`}>
                    <button type="button" onClick={() => setQty(line.productId, line.option, line.qty - 1)} aria-label="수량 줄이기">
                      −
                    </button>
                    <output>{line.qty}</output>
                    <button type="button" onClick={() => setQty(line.productId, line.option, line.qty + 1)} aria-label="수량 늘리기">
                      +
                    </button>
                  </div>
                </div>
                <div className={styles.lineEnd}>
                  <span className={styles.linePrice}>{won(product.price * line.qty)}</span>
                  <button type="button" className={styles.remove} onClick={() => remove(line.productId, line.option)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <aside className={styles.summary} aria-labelledby="sum-title">
            <h2 id="sum-title">Order summary</h2>
            <dl>
              <dt>Subtotal</dt>
              <dd>{won(subtotal)}</dd>
              <dt className={styles.total}>Total</dt>
              <dd className={styles.total}>{won(total)}</dd>
            </dl>
            <label className={ui.label} htmlFor="buyer">
              Name
            </label>
            <input id="buyer" className={ui.input} placeholder="주문자 이름" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            <label className={styles.agree}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>전시용 시뮬레이터예요. 실제 결제·배송은 발생하지 않아요.</span>
            </label>
            {error && <p className={ui.error}>{error}</p>}
            <button type="button" className={ui.button} onClick={pay}>
              Pay {won(total)}
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}
