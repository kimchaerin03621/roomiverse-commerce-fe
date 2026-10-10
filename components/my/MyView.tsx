"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { findRecord, listRecords, won, type RecordEntry } from "@/lib/store";
import ui from "@/components/site/ui.module.css";
import styles from "./MyView.module.css";

function fmt(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function Detail({ r }: { r: RecordEntry }) {
  if (r.kind === "order") {
    return (
      <article className={styles.detail}>
        <header>
          <span className={styles.badge}>Order</span>
          <h2>{r.number}</h2>
          <span className={styles.status}>{r.status}</span>
        </header>
        <dl>
          <dt>주문일</dt>
          <dd>{fmt(r.createdAt)}</dd>
          <dt>주문자</dt>
          <dd>{r.name}</dd>
          <dt>상품</dt>
          <dd>
            {r.lines.map((l) => (
              <div key={`${l.name}-${l.option}`}>
                {l.name} · {l.option} × {l.qty} — {won(l.price * l.qty)}
              </div>
            ))}
          </dd>
          <dt>결제 금액</dt>
          <dd>{won(r.total)}</dd>
          <dt>진행 상태</dt>
          <dd>
            <ol className={styles.track}>
              {["결제 완료", "배송 준비", "배송 중", "배송 완료"].map((s, i) => (
                <li key={s} data-on={i === 0 || undefined}>
                  {s}
                </li>
              ))}
            </ol>
          </dd>
        </dl>
        <p className={ui.hint}>전시용 시뮬레이터라 배송은 진행되지 않아요. 취소·반품 요청도 체험용 안내만 제공해요.</p>
      </article>
    );
  }
  return (
    <article className={styles.detail}>
      <header>
        <span className={styles.badge} data-kind="reservation">
          예약 문의
        </span>
        <h2>{r.number}</h2>
        <span className={styles.status}>{r.status}</span>
      </header>
      <dl>
        <dt>파티</dt>
        <dd>
          {r.party}
          {r.addOns.length > 0 && ` + ${r.addOns.join(", ")}`}
        </dd>
        <dt>일시</dt>
        <dd>
          {r.date} · {r.start} · {r.duration}
        </dd>
        <dt>장소</dt>
        <dd>
          {r.spaceType} · {r.area}
        </dd>
        <dt>인원 · 무드</dt>
        <dd>
          {r.guests}
          {r.vibe && ` · ${r.vibe}`}
        </dd>
        <dt>공간 조건</dt>
        <dd>
          {Object.entries(r.space)
            .map(([k, v]) => `${k} ${v}`)
            .join(" · ")}
        </dd>
        <dt>문의자</dt>
        <dd>
          {r.name} · {r.contact}
        </dd>
        {r.request && (
          <>
            <dt>요청 사항</dt>
            <dd>{r.request}</dd>
          </>
        )}
      </dl>
      <p className={ui.hint}>예약 문의 취소·일정 변경은 실제 서비스에서 취소 수수료 규정 안내 후 진행돼요. 지금은 전시용 체험이에요.</p>
    </article>
  );
}

export default function MyView() {
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<RecordEntry | null>(null);
  const [miss, setMiss] = useState(false);

  useEffect(() => {
    setRecords(listRecords());
    const no = new URLSearchParams(window.location.search).get("no");
    if (no) {
      setQuery(no);
      setActive(findRecord(no) ?? null);
      setMiss(!findRecord(no));
    }
  }, []);

  const lookup = () => {
    const hit = findRecord(query);
    setActive(hit ?? null);
    setMiss(!hit);
  };

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>My</h1>
        <p className={styles.standfirst}>
          주문번호나 문의번호로 내역을 조회해요. 기록은 이 브라우저에만 저장돼요. <span className={ui.demo}>Exhibition demo</span>
        </p>
      </header>

      <form
        className={styles.lookup}
        onSubmit={(e) => {
          e.preventDefault();
          lookup();
        }}
      >
        <label className={ui.label} htmlFor="no">
          주문번호 / 문의번호
        </label>
        <div className={styles.lookupRow}>
          <input id="no" className={ui.input} placeholder="RMV-R261004-ABCD" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button type="submit" className={ui.button}>
            조회
          </button>
        </div>
        {miss && <p className={ui.error}>이 브라우저에 저장된 기록에서 찾을 수 없어요. 번호를 다시 확인해 주세요.</p>}
      </form>

      {active && <Detail r={active} />}

      <section className={styles.history} aria-labelledby="hist-title">
        <h2 id="hist-title">이 브라우저의 기록</h2>
        {records.length === 0 ? (
          <div className={styles.none}>
            <p>아직 주문이나 예약 문의 기록이 없어요.</p>
            <div className={styles.noneLinks}>
              <Link className={ui.ghost} href="/lets-party">
                Build your party →
              </Link>
              <Link className={ui.ghost} href="/shop">
                Shop →
              </Link>
            </div>
          </div>
        ) : (
          <ul className={styles.list}>
            {records.map((r) => (
              <li key={r.number}>
                <button
                  type="button"
                  aria-pressed={active?.number === r.number}
                  onClick={() => {
                    setActive(r);
                    setQuery(r.number);
                    setMiss(false);
                  }}
                >
                  <span className={styles.badge} data-kind={r.kind}>
                    {r.kind === "order" ? "주문" : "예약 문의"}
                  </span>
                  <span className={styles.listNo}>{r.number}</span>
                  <span className={styles.listWhat}>{r.kind === "order" ? `${r.lines[0]?.name}${r.lines.length > 1 ? ` 외 ${r.lines.length - 1}` : ""}` : r.party}</span>
                  <span className={styles.listDate}>{fmt(r.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
