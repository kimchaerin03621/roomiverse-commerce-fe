"use client";

/*
 * Exhibition simulator state. Nothing is paid, shipped or booked.
 * - The cart lives in memory only: a refresh empties it.
 * - Completed orders and reservations are saved in this browser
 *   (localStorage), so their numbers can be looked up later on My.
 */

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type CartLine = { productId: string; option: string; qty: number };

export type OrderRecord = {
  kind: "order";
  number: string;
  createdAt: string;
  lines: { name: string; option: string; qty: number; price: number }[];
  total: number;
  name: string;
  status: "결제 완료";
};

export type ReservationRecord = {
  kind: "reservation";
  number: string;
  createdAt: string;
  party: string;
  addOns: string[];
  guests: string;
  vibe: string;
  date: string;
  start: string;
  duration: string;
  spaceType: string;
  area: string;
  space: Record<string, string>;
  name: string;
  contact: string;
  request: string;
  status: "문의 접수";
};

export type RecordEntry = OrderRecord | ReservationRecord;

const KEY = "roomi:records";

function readAll(): RecordEntry[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RecordEntry[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: RecordEntry[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* private mode or storage off: the confirmation screen still shows the number */
  }
}

export function saveRecord(entry: RecordEntry) {
  writeAll([entry, ...readAll().filter((r) => r.number !== entry.number)]);
}

export function listRecords(): RecordEntry[] {
  return readAll();
}

export function findRecord(number: string): RecordEntry | undefined {
  const n = number.trim().toUpperCase();
  return readAll().find((r) => r.number === n);
}

export function makeNumber(prefix: "O" | "R") {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const tail = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RMV-${prefix}${ymd}-${tail}`;
}

type CartApi = {
  lines: CartLine[];
  count: number;
  add: (line: CartLine) => void;
  setQty: (productId: string, option: string, qty: number) => void;
  remove: (productId: string, option: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const add = useCallback((line: CartLine) => {
    setLines((prev) => {
      const hit = prev.find((l) => l.productId === line.productId && l.option === line.option);
      if (hit) return prev.map((l) => (l === hit ? { ...l, qty: Math.min(9, l.qty + line.qty) } : l));
      return [...prev, line];
    });
  }, []);

  const setQty = useCallback((productId: string, option: string, qty: number) => {
    setLines((prev) => prev.map((l) => (l.productId === productId && l.option === option ? { ...l, qty: Math.max(1, Math.min(9, qty)) } : l)));
  }, []);

  const remove = useCallback((productId: string, option: string) => {
    setLines((prev) => prev.filter((l) => !(l.productId === productId && l.option === option)));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const api = useMemo(
    () => ({ lines, count: lines.reduce((n, l) => n + l.qty, 0), add, setQty, remove, clear }),
    [lines, add, setQty, remove, clear],
  );

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export { won } from "./format";
