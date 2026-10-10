import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100svh",
        display: "grid",
        alignContent: "center",
        justifyItems: "start",
        gap: 24,
        padding: "120px clamp(20px, 6vw, 112px)",
        background: "var(--paper)",
        color: "var(--ink)",
        fontFamily: "var(--font-text)",
      }}
    >
      <h1 style={{ margin: 0, fontSize: "clamp(64px, 12vw, 200px)", fontWeight: 900, lineHeight: 0.85, letterSpacing: "-0.045em", color: "var(--pink)" }}>
        NO TRACK
      </h1>
      <p style={{ margin: 0, fontSize: 18 }}>이 페이지는 아직 수록되지 않았어요.</p>
      <Link href="/" style={{ fontFamily: "var(--font-ui)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        항구로 돌아가기 →
      </Link>
    </main>
  );
}
