"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { productById, type Product } from "@/content/products";
import { useCart } from "@/lib/store";
import ContainerGate from "./ContainerGate";
import ProductViewer from "./ProductViewer";
import { buildRoom, VIEWS, VIEWS_PORTRAIT, type Mood } from "./room";
import styles from "./ShopScene.module.css";

// Clicking either stage light steps through these: off -> soft -> vivid -> rave -> off.
const ORDER: Mood[] = ["off", "soft", "vivid", "rave"];

const won = (n: number) => `₩${n.toLocaleString("ko-KR")}`;

/**
 * The 3D Shop: a furnished studio inside the shipping container, rendered in real time.
 * Fixed camera with a slight mouse follow. Products in the scene open a translucent panel in place.
 */
export default function ShopScene() {
  const mount = useRef<HTMLDivElement>(null);
  const api = useRef<{
    setMood: (m: Mood) => void;
    setSpin: (on: boolean) => void;
    select: (id: string | null) => void;
    cloneProduct: (id: string) => THREE.Group | null;
  } | null>(null);
  const makeModel = useCallback((id: string) => api.current?.cloneProduct(id) ?? null, []);
  const { add } = useCart();
  const router = useRouter();
  const [mood, setMood] = useState<Mood>("off");
  const [spin, setSpin] = useState(false);
  const moodRef = useRef<Mood>("off");
  const spinRef = useRef(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [option, setOption] = useState("");
  const [added, setAdded] = useState(false);
  const panelOpen = useRef(false);
  const tip = useRef<HTMLDivElement>(null);
  // Loading gate: container doors stay shut until the textures are in, then swing open.
  const [ready, setReady] = useState(false);
  const [gone, setGone] = useState(false);
  const [pct, setPct] = useState(0);
  // Before the first paint, pick up the count the intro started (building the room below blocks the page for a moment).
  useLayoutEffect(() => {
    try {
      const stored = Number(sessionStorage.getItem("roomi:gate-t0"));
      if (stored && Date.now() - stored < 20000) setPct(Math.min(92, Math.round(((Date.now() - stored) / 2600) * 100)));
    } catch {}
  }, []);

  const open = useCallback((id: string | null) => {
    const p = id ? productById(id) ?? null : null;
    setProduct(p);
    setOption(p?.options[0] ?? "");
    setAdded(false);
  }, []);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    // The room is static: shadows are computed once (and again when the light mood changes), not every frame.
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#100b10");

    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.5;

    // The camera stands near the open doors and turns between three views: left wall, back wall, right wall.
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 60);
    const vec = (a: [number, number, number]) => new THREE.Vector3(...a);
    const mk = (v: { pos: [number, number, number]; look: [number, number, number] }) => {
      const m = new THREE.Matrix4().lookAt(vec(v.pos), vec(v.look), new THREE.Vector3(0, 1, 0));
      return { pos: vec(v.pos), q: new THREE.Quaternion().setFromRotationMatrix(m) };
    };
    let vC = mk(VIEWS.center);
    let vL = mk(VIEWS.left);
    let vR = mk(VIEWS.right);
    const pickViews = (portrait: boolean) => {
      const v = portrait ? VIEWS_PORTRAIT : VIEWS;
      vC = mk(v.center);
      vL = mk(v.left);
      vR = mk(v.right);
    };
    // t in [-1, 1]: -1 left wall, 0 back wall, 1 right wall
    let t = 0;
    let tGoal = 0;
    const place = (tt: number) => {
      const side = tt < 0 ? vL : vR;
      const k = Math.abs(tt);
      const e = k * k * (3 - 2 * k);
      camera.position.lerpVectors(vC.pos, side.pos, e);
      camera.quaternion.slerpQuaternions(vC.q, side.q, e);
    };
    place(0);

    // The doors count up from the click in the intro (its time is passed through sessionStorage) and open once
    // every texture is in and the count has reached 100. A timeout covers a stuck request.
    const GATE_MS = 2600;
    const manager = THREE.DefaultLoadingManager;
    const prev = { onProgress: manager.onProgress, onLoad: manager.onLoad };
    let loaded = false;
    let gateRaf = 0;
    let openTimer = 0;
    let t0 = Date.now();
    try {
      const stored = Number(sessionStorage.getItem("roomi:gate-t0"));
      if (stored && t0 - stored < 20000) t0 = stored;
    } catch {}
    manager.onLoad = () => {
      loaded = true;
    };
    const failTimer = window.setTimeout(() => {
      loaded = true;
    }, 6000);
    let lastShown = -1;
    const gateTick = () => {
      const t = Math.min(1, (Date.now() - t0) / GATE_MS);
      const shown = Math.round(loaded ? t * 100 : Math.min(t * 100, 92));
      if (shown !== lastShown) {
        lastShown = shown;
        setPct(shown);
      }
      if (shown >= 100) {
        openTimer = window.setTimeout(() => setReady(true), 250);
        try {
          sessionStorage.removeItem("roomi:gate-t0");
        } catch {}
        return;
      }
      gateRaf = requestAnimationFrame(gateTick);
    };
    gateRaf = requestAnimationFrame(gateTick);

    const room = buildRoom(scene);
    const pickMeshes = room.picks.map((p) => p.object);
    const idOf = (o: THREE.Object3D) => room.picks.find((p) => p.object === o)?.id ?? null;

    let exposure = room.setMood("off");
    renderer.toneMappingExposure = exposure;

    const size = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.fov = w / h < 1 ? 74 : 55;
      camera.updateProjectionMatrix();
      pickViews(w / h < 1);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);

    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let hover: string | null = null;
    let selected: string | null = null;
    // The stage lights and the disco ball are controls, not products: they never open the product panel.
    const activate = (id: string) => {
      if (id === "stage-light") {
        moodRef.current = ORDER[(ORDER.indexOf(moodRef.current) + 1) % ORDER.length];
        setMood(moodRef.current);
      } else if (id === "disco-ball") {
        spinRef.current = !spinRef.current;
        setSpin(spinRef.current);
      } else if (id === "laptop") {
        router.push("/shop");
      } else {
        selected = id;
        open(id);
      }
    };

    const hit = (e: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const h = ray.intersectObjects(pickMeshes, false)[0];
      return h ? idOf(h.object) : null;
    };

    // Mouse position turns the view: while the pointer rests in the left or right edge of the screen the room
    // keeps turning that way (faster nearer the edge) and stays where it is when the pointer comes back to the middle.
    // That way products on the walls can still be reached and clicked. Touch screens drag instead.
    let steer = 0;
    let down: { x: number; t: number; moved: boolean } | null = null;
    const ZONE = 0.22;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      down = { x: e.clientX, t, moved: false };
    };
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
      if (e.pointerType === "mouse") {
        const onCanvas = e.target === renderer.domElement;
        const nx = e.clientX / window.innerWidth;
        if (onCanvas && !panelOpen.current) {
          if (nx < ZONE) steer = -((ZONE - nx) / ZONE);
          else if (nx > 1 - ZONE) steer = (nx - (1 - ZONE)) / ZONE;
          else steer = 0;
        } else steer = 0;
        hover = onCanvas ? hit(e) : null;
        // A small tag follows the pointer: "Change" over the stage lights and the disco ball, name and price over products.
        const t = tip.current;
        if (t) {
          const control = hover === "stage-light" || hover === "disco-ball";
          const p = hover && !control && hover !== "laptop" ? productById(hover) : null;
          const text = control ? "Change" : hover === "laptop" ? "Shop all" : p ? `${p.name} · ${won(p.price)}` : "";
          if (t.textContent !== text && text) t.textContent = text;
          t.style.opacity = text ? "1" : "0";
          t.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 18}px)`;
        }
        renderer.domElement.style.cursor = hover ? "pointer" : steer ? (steer < 0 ? "w-resize" : "e-resize") : "default";
        return;
      }
      if (down) {
        const dx = e.clientX - down.x;
        if (Math.abs(dx) > 6) down.moved = true;
        if (down.moved) {
          tGoal = Math.max(-1, Math.min(1, down.t - dx / (window.innerWidth * 0.55)));
          t = tGoal;
        }
      }
    };
    const onLeave = () => {
      steer = 0;
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        if (e.target !== renderer.domElement) return;
        const id = hit(e);
        if (id) activate(id);
        return;
      }
      const d = down;
      down = null;
      if (!d) return;
      if (d.moved) {
        const near = Math.abs(tGoal) < 0.34 ? 0 : tGoal < 0 ? -1 : 1;
        tGoal = near;
        return;
      }
      const id = hit(e);
      if (id) activate(id);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    renderer.domElement.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        tGoal = Math.max(-1, Math.round(tGoal) - 1);
      } else if (e.key === "ArrowRight") {
        tGoal = Math.min(1, Math.round(tGoal) + 1);
      }
    };
    window.addEventListener("keydown", onKey);

    api.current = {
      setSpin: (on) => room.setSpin(on),
      setMood: (m) => {
        exposure = room.setMood(m);
        renderer.toneMappingExposure = exposure;
        renderer.shadowMap.needsUpdate = true;
      },
      select: (id) => {
        selected = id;
      },
      cloneProduct: (id) => room.cloneProduct(id),
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = new THREE.Clock();
    let raf = 0;
    let visible = true;
    const onVis = () => {
      visible = !document.hidden;
      if (visible) {
        clock.getDelta();
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    const glow = new Map<THREE.Object3D, number>();
    const tick = () => {
      if (!visible) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const time = clock.elapsedTime;
      const k = 1 - Math.exp(-dt * 3.2);
      cur.x += (target.x - cur.x) * k;
      cur.y += (target.y - cur.y) * k;
      if (steer) {
        tGoal = Math.max(-1, Math.min(1, tGoal + steer * dt * 1.0));
      }
      // ease toward the wanted view (instantly for reduced motion)
      t += (tGoal - t) * (reduce ? 1 : 1 - Math.exp(-dt * 4.2));
      place(t);
      if (!reduce) {
        // a touch of mouse parallax on top of the view
        camera.position.x += cur.x * 0.12;
        camera.position.y -= cur.y * 0.06;
        room.update(time);
      }
      // Hovered or open product pulses softly so it reads as clickable.
      room.setHover(hover);
      for (const p of room.picks) {
        const m = (p.object as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (!m || !("emissive" in m)) continue;
        const on = p.id === hover || p.id === selected;
        const v = (glow.get(p.object) ?? 0) + ((on ? 1 : 0) - (glow.get(p.object) ?? 0)) * Math.min(1, dt * 8);
        glow.set(p.object, v);
        m.emissive.set("#f71d64");
        m.emissiveIntensity = v * (0.5 + Math.sin(time * 5) * 0.1);
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(gateRaf);
      window.clearTimeout(openTimer);
      window.clearTimeout(failTimer);
      manager.onProgress = prev.onProgress;
      manager.onLoad = prev.onLoad;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("keydown", onKey);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      api.current = null;
      ro.disconnect();
      room.dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [open, router]);

  useEffect(() => {
    api.current?.setMood(mood);
  }, [mood]);

  useEffect(() => {
    api.current?.setSpin(spin);
  }, [spin]);

  useEffect(() => {
    api.current?.select(product?.id ?? null);
    panelOpen.current = !!product;
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setProduct(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [product]);

  return (
    <div className={styles.wrap} data-mood={mood} data-tone="dark">
      <div ref={mount} className={styles.canvas} aria-label="ROOMi 3D Shop: 컨테이너 안의 스튜디오" role="img" />
      <div ref={tip} className={styles.tip} aria-hidden="true">
        Change
      </div>
      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />

      {!gone && <ContainerGate pct={pct} open={ready} onGone={() => setGone(true)} />}

      {product && (
        <div className={styles.modal} onClick={(e) => e.target === e.currentTarget && setProduct(null)}>
          <div className={styles.viewer}>
            <ProductViewer id={product.id} make={makeModel} />
            <p className={styles.viewerHint}>Drag to rotate</p>
          </div>
          <aside className={styles.panel} aria-label={`${product.name} 상세`}>
            <button type="button" className={styles.close} onClick={() => setProduct(null)} aria-label="상세 닫기">
              Close ×
            </button>
            <p className={styles.no}>
              RMV-{product.no} · {product.kind === "Hardware" ? "Gear" : "Goods"}
            </p>
            <h2>{product.name}</h2>
            <p className={styles.summary}>{product.summary}</p>
            <p className={styles.price}>
              {won(product.price)} <span>Sample price</span>
            </p>
            <fieldset className={styles.options}>
              <legend>Option</legend>
              {product.options.map((o) => (
                <label key={o}>
                  <input type="radio" name="opt" checked={option === o} onChange={() => setOption(o)} />
                  <span>{o}</span>
                </label>
              ))}
            </fieldset>
            <button
              type="button"
              className={styles.addBtn}
              onClick={() => {
                add({ productId: product.id, option, qty: 1 });
                setAdded(true);
              }}
            >
              {added ? "Added ✓" : "Add to cart"}
            </button>
            {added && (
              <Link href="/cart" className={styles.toCart}>
                Go to cart →
              </Link>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
