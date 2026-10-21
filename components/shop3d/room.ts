import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/*
 * The shop room, kept deliberately small and calm: dark concrete, one pink accent, few objects, few lights.
 * Units are metres. Layout follows the user's three sketches:
 *   entry view: big ROOMiVERSE letters on the back wall, a disco ball, two stage lights, the DJ booth with speakers,
 *     a star-edged rug in front;
 *   left wall: a sofa with the cap, towel and bandana, an oval table with party food and drinks,
 *     the mini CD keyrings and letter patches;
 *   right wall: a six-cell shelf of party supplies with a Bluetooth speaker on top.
 * The floor is modular carpet tile.
 */

export const W = 3.6; // half-width
export const Z0 = -4.4; // back wall
export const Z1 = 3.6; // open front (behind the camera)
export const H = 3.3;

/** Stage-light modes, cycled by clicking the lights: off -> soft -> vivid -> rave -> off. */
export type Mood = "off" | "soft" | "vivid" | "rave";
export type Pick = { id: string; object: THREE.Object3D };
type Vec3 = [number, number, number];
export const VIEWS: Record<"center" | "left" | "right", { pos: Vec3; look: Vec3 }> = {
  center: { pos: [0, 1.6, 1.9], look: [0, 1.4, -4.4] },
  left: { pos: [0.7, 1.75, 0.5], look: [-2.9, 0.65, -1.5] },
  right: { pos: [-0.1, 1.75, -0.9], look: [2.6, 0.95, -2.8] },
};
/** Tall (phone) screens are narrow, so the side views turn more toward the wall furniture to keep it in frame. */
export const VIEWS_PORTRAIT: typeof VIEWS = {
  center: VIEWS.center,
  left: VIEWS.left,
  right: { pos: [-0.1, 1.75, -0.9], look: [3.3, 1.15, -1.6] },
};

type Room = {
  update: (t: number) => void;
  dispose: () => void;
  picks: Pick[];
  /** Sets the light mood and returns the tone-mapping exposure that suits it. */
  setMood: (m: Mood) => number;
  /** Disco ball spin: turns the ball, its light spots and the stage-light sway together. */
  setSpin: (on: boolean) => void;
  /** Pointer is over a control: "stage-light", "disco-ball" or "laptop" brighten softly, null for none. */
  setHover: (id: string | null) => void;
  /** An independent copy of one product (materials cloned, cloth laid flat) for the zoom viewer, centred on its own origin. */
  cloneProduct: (id: string) => THREE.Group | null;
  /** Keeps only one product (cloth laid flat) at the world origin and returns its bounds; for product shots. */
  solo: (id: string) => THREE.Box3;
};

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, g: c.getContext("2d")! };
}

export function buildRoom(scene: THREE.Scene): Room {
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(o: T): T => {
    disposables.push(o);
    return o;
  };

  const picks: Pick[] = [];
  /** Marks a mesh as a product. It gets its own material so hovering lights only this object. */
  const tag = <T extends THREE.Object3D>(o: T, id: string): T => {
    const m = o as unknown as THREE.Mesh;
    const mat = m.material as THREE.Material | undefined;
    if (mat && "emissive" in mat) m.material = track(mat.clone());
    o.userData.part = id;
    picks.push({ id, object: o });
    return o;
  };
  /** Per-product callbacks that lay a draped cloth flat for the isolated product shot. */
  const flatten: Partial<Record<string, () => void>> = {};
  /** Same flat layout as `flatten`, but as a fresh geometry so the room's own cloth is left alone. */
  const flatGeo: Partial<Record<string, () => THREE.BufferGeometry>> = {};

  // Soft emissive accents (no bloom): a few strips and lenses, scaled by mood.
  const neons: { mat: THREE.MeshBasicMaterial; base: THREE.Color; gain: number }[] = [];
  const neonMat = (hex: string, gain = 1) => {
    const base = new THREE.Color(hex);
    const mat = track(new THREE.MeshBasicMaterial({ color: base.clone().multiplyScalar(gain) }));
    neons.push({ mat, base, gain });
    return mat;
  };

  const tex = (c: HTMLCanvasElement) => {
    const t = track(new THREE.CanvasTexture(c));
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  };

  const loader = new THREE.TextureLoader();
  const file = (name: string, srgb: boolean, repeat: [number, number]) => {
    const t = track(loader.load(`/shop3d/${name}`));
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
    t.anisotropy = 8;
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    return t;
  };
  const pbr = (base: string, repeat: [number, number], normalScale = 1, extra: THREE.MeshStandardMaterialParameters = {}) =>
    track(
      new THREE.MeshStandardMaterial({
        map: file(`${base}_color.jpg`, true, repeat),
        normalMap: file(`${base}_normal.jpg`, false, repeat),
        normalScale: new THREE.Vector2(normalScale, normalScale),
        roughness: 1,
        ...extra,
      }),
    );
  const fabric = (color: THREE.ColorRepresentation, repeat: [number, number] = [6, 6], rough = 0.95) =>
    track(new THREE.MeshStandardMaterial({ color, roughness: rough, normalMap: file("fabric_normal.jpg", false, repeat), normalScale: new THREE.Vector2(0.8, 0.8) }));
  const velvetMat = (color: string, sheen: string, repeat: [number, number]) =>
    track(
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.85,
        sheen: 1,
        sheenColor: new THREE.Color(sheen),
        sheenRoughness: 0.45,
        normalMap: file("fabric_normal.jpg", false, repeat),
        normalScale: new THREE.Vector2(0.7, 0.7),
      }),
    );
  const std = (color: THREE.ColorRepresentation, rough = 0.85, metal = 0) => track(new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal }));

  const rgbOf = (hex: string) => {
    const n = parseInt(hex.replace("#", ""), 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  };
  /** Procedural wood: long wavy grain streaks with a few darker rings. "v" turns the grain to run vertically. */
  const woodMat = (base: string, dark: string, repeat: [number, number], dir: "h" | "v" = "h", rough = 0.5) => {
    const { c, g } = canvas(512, 512);
    g.fillStyle = base;
    g.fillRect(0, 0, 512, 512);
    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const dk = rgbOf(dark);
    for (let i = 0; i < 300; i++) {
      const y = rnd() * 512;
      const ph = rnd() * 6;
      g.strokeStyle = `rgba(${dk},${0.05 + rnd() * 0.2})`;
      g.lineWidth = 0.5 + rnd() * 2.4;
      g.beginPath();
      g.moveTo(0, y);
      for (let x = 0; x <= 512; x += 32) g.lineTo(x, y + Math.sin(x * 0.014 + ph) * (2 + rnd() * 2.5));
      g.stroke();
    }
    for (let k = 0; k < 4; k++) {
      const cx = rnd() * 512;
      const cy = rnd() * 512;
      for (let r = 4; r < 26; r += 4) {
        g.strokeStyle = `rgba(${dk},0.1)`;
        g.lineWidth = 1;
        g.beginPath();
        g.ellipse(cx, cy, r * 3.2, r, 0, 0, Math.PI * 2);
        g.stroke();
      }
    }
    const t = tex(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (dir === "v") {
      t.center.set(0.5, 0.5);
      t.rotation = Math.PI / 2;
    }
    t.repeat.set(repeat[0], repeat[1]);
    return track(new THREE.MeshPhysicalMaterial({ map: t, bumpMap: t, bumpScale: 0.7, roughness: rough, clearcoat: 0.3, clearcoatRoughness: 0.45 }));
  };
  /** Polished stone / terrazzo: speckled base with optional coloured chips. */
  const stoneMat = (base: string, specks: string[], count: number, size: number, chips: string[] = [], rough = 0.3) => {
    const { c, g } = canvas(512, 512);
    g.fillStyle = base;
    g.fillRect(0, 0, 512, 512);
    let seed = 5;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < count; i++) {
      g.fillStyle = `rgba(${rgbOf(specks[i % specks.length])},${0.15 + rnd() * 0.3})`;
      g.beginPath();
      g.arc(rnd() * 512, rnd() * 512, 0.6 + rnd() * size, 0, Math.PI * 2);
      g.fill();
    }
    chips.forEach((col, k) => {
      for (let i = 0; i < 70; i++) {
        const x = rnd() * 512;
        const y = rnd() * 512;
        g.fillStyle = col;
        g.beginPath();
        const n = 5 + Math.floor(rnd() * 3);
        const r0 = 3 + rnd() * 7;
        for (let a = 0; a < n; a++) {
          const ang = (a / n) * Math.PI * 2 + k;
          const rr = r0 * (0.65 + rnd() * 0.5);
          g.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr);
        }
        g.closePath();
        g.fill();
      }
    });
    const t = tex(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1.6, 1.6);
    return track(new THREE.MeshPhysicalMaterial({ map: t, roughness: rough, clearcoat: 0.85, clearcoatRoughness: 0.12 }));
  };
  const brass = () => track(new THREE.MeshStandardMaterial({ color: "#c9a45c", roughness: 0.28, metalness: 1, envMap: scene.environment, envMapIntensity: 1.6 }));

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0, parent: THREE.Object3D = scene, shadow = true) => {
    track(geo);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = shadow;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const box = (w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number, parent?: THREE.Object3D) =>
    add(new THREE.BoxGeometry(w, h, d), mat, x, y, z, parent);
  const rbox = (w: number, h: number, d: number, r: number, mat: THREE.Material, x: number, y: number, z: number, parent?: THREE.Object3D) =>
    add(new RoundedBoxGeometry(w, h, d, 4, r), mat, x, y, z, parent);
  const cyl = (rt: number, rb: number, h: number, mat: THREE.Material, x: number, y: number, z: number, parent?: THREE.Object3D, seg = 28) =>
    add(new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y, z, parent);
  const hitBox = (w: number, h: number, d: number, x: number, y: number, z: number, parent: THREE.Object3D, id: string) => {
    const m = new THREE.Mesh(track(new THREE.BoxGeometry(w, h, d)), track(new THREE.MeshBasicMaterial({ visible: false })));
    m.position.set(x, y, z);
    parent.add(m);
    picks.push({ id, object: m });
  };
  /** A soft dark blob under furniture: cheap ambient occlusion, so things sit on the carpet. */
  const blobTex = (() => {
    const { c, g } = canvas(128, 128);
    const gr = g.createRadialGradient(64, 64, 6, 64, 64, 62);
    gr.addColorStop(0, "rgba(0,0,0,0.75)");
    gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
    return tex(c);
  })();
  /** Soft round glow shown around a control while the pointer is over it. */
  const glowTex = (() => {
    const { c, g } = canvas(128, 128);
    const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    gr.addColorStop(0, "rgba(255,255,255,0.95)");
    gr.addColorStop(0.35, "rgba(255,200,230,0.45)");
    gr.addColorStop(1, "rgba(255,200,230,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
    return tex(c);
  })();
  const glowSprites: THREE.Sprite[] = [];
  let lapMat: THREE.MeshBasicMaterial;
  let lapGlow: THREE.Sprite;
  const addGlow = (parent: THREE.Object3D, x: number, y: number, z: number, size: number) => {
    const mat = track(new THREE.SpriteMaterial({ map: glowTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }));
    const sp = new THREE.Sprite(mat);
    sp.position.set(x, y, z);
    sp.scale.setScalar(size);
    sp.renderOrder = 10;
    sp.userData.size = size;
    parent.add(sp);
    glowSprites.push(sp);
    return sp;
  };
  const blob = (x: number, z: number, w: number, d: number, rot = 0, op = 0.8) => {
    const mat = track(new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: op }));
    const m = add(new THREE.PlaneGeometry(w, d), mat, x, 0.006, z, scene, false);
    m.rotation.set(-Math.PI / 2, 0, rot);
    m.receiveShadow = false;
  };

  // ---------- Shell: dark concrete, plain ceiling, carpet tile ----------
  const concrete = (repeat: [number, number]) =>
    track(
      new THREE.MeshStandardMaterial({
        map: file("concrete_color.jpg", true, repeat),
        normalMap: file("concrete_wall_normal.jpg", false, repeat),
        normalScale: new THREE.Vector2(0.9, 0.9),
        color: "#8a868f",
        roughness: 0.95,
      }),
    );
  const floorMat = pbr("carpet", [(W * 2) / 2, (Z1 - Z0) / 2], 1.4, { roughness: 0.96 });
  const L = Z1 - Z0;
  const cz = (Z0 + Z1) / 2;

  const floor = add(new THREE.PlaneGeometry(W * 2 + 0.4, L), floorMat, 0, 0, cz);
  floor.rotation.x = -Math.PI / 2;
  floor.castShadow = false;
  box(W * 2 + 0.8, H, 0.2, concrete([2, 1]), 0, H / 2, Z0 - 0.1);
  // Side walls: corrugated container steel (ribs drawn into a tiny tiling color + normal texture).
  const corr = (() => {
    const N = 128;
    const col = canvas(N, 8);
    const nor = canvas(N, 8);
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const trap = Math.max(-1, Math.min(1, Math.sin(a) * 1.6));
      const slope = Math.max(-1, Math.min(1, Math.cos(a) * 1.6)) * (Math.abs(Math.sin(a) * 1.6) < 1 ? 1 : 0);
      const l = 62 + (trap * 0.5 + 0.5) * 26;
      col.g.fillStyle = `rgb(${l},${l + 3},${l + 9})`;
      col.g.fillRect(i, 0, 1, 8);
      nor.g.fillStyle = `rgb(${Math.round(128 - slope * 70)},128,235)`;
      nor.g.fillRect(i, 0, 1, 8);
    }
    const mk = (c: HTMLCanvasElement, srgb: boolean) => {
      const t = track(new THREE.CanvasTexture(c));
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(L / 0.3, 1);
      t.anisotropy = 8;
      t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      return t;
    };
    return track(
      new THREE.MeshStandardMaterial({ map: mk(col.c, true), normalMap: mk(nor.c, false), normalScale: new THREE.Vector2(1.6, 1.6), roughness: 0.55, metalness: 0.45 }),
    );
  })();
  const steel = std("#2b2c32", 0.5, 0.5);
  for (const sx of [-1, 1]) {
    box(0.2, H, L + 0.4, corr, sx * (W + 0.1), H / 2, cz);
    box(0.1, 0.16, L, steel, sx * (W - 0.05), H - 0.08, cz); // top rail
    box(0.08, 0.14, L, steel, sx * (W - 0.04), 0.07, cz); // bottom rail
    box(0.14, H, 0.14, steel, sx * (W - 0.07), H / 2, Z0 + 0.07); // corner post
    box(0.14, H, 0.14, steel, sx * (W - 0.07), H / 2, Z1 - 0.07);
  }
  box(W * 2 + 0.8, 0.2, L + 0.4, std("#0f0d12", 0.9), 0, H + 0.1, cz);
  // one track rail over the booth, nothing else up there
  const rail = std("#1a171d", 0.5, 0.6);
  box(W * 2 - 1.2, 0.04, 0.06, rail, 0, H - 0.1, -2.2);
  for (let i = 0; i < 4; i++) cyl(0.05, 0.065, 0.15, rail, -1.5 + i * 1.0, H - 0.2, -2.2, undefined, 16);

  // ---------- Lights (few on purpose) ----------
  const sun = new THREE.DirectionalLight("#ffd2ac", 2.4);
  sun.position.set(3.5, 3.4, 15);
  sun.target.position.set(-0.2, 0, -1.8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  const sc = sun.shadow.camera;
  sc.left = -11;
  sc.right = 11;
  sc.top = 11;
  sc.bottom = -11;
  sc.near = 1;
  sc.far = 40;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);

  // Doors stand open behind the camera: an invisible frame shapes the sun into one door-sized shaft.
  {
    const blocker = track(new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }));
    const fz = Z1 + 0.5;
    const door = { x0: -1.5, x1: 2.0, y1: 2.6 };
    const slab = (w: number, h: number, x: number, y: number) => box(w, h, 0.2, blocker, x, y, fz);
    slab(door.x0 + W + 1, H + 2, (door.x0 - W - 1) / 2, (H + 2) / 2);
    slab(W + 1 - door.x1, H + 2, (door.x1 + W + 1) / 2, (H + 2) / 2);
    slab(door.x1 - door.x0, H + 2 - door.y1, (door.x0 + door.x1) / 2, door.y1 + (H + 2 - door.y1) / 2);
  }

  const hemi = new THREE.HemisphereLight("#fff3f6", "#5d5560", 0.95);
  scene.add(hemi);

  // ---------- Back wall: the brand sign, stage lights, disco ball ----------
  {
    const signTex = file("sign.png", true, [1, 1]);
    const W_SIGN = 4.1 * 0.7;
    const sign = add(new THREE.PlaneGeometry(W_SIGN, W_SIGN * (424 / 812)), track(new THREE.MeshBasicMaterial({ map: signTex, transparent: true, opacity: 0.95 })), 0, 2.0, Z0 + 0.03, scene, false);
    sign.receiveShadow = false;
  }

  const fixtures: THREE.SpotLight[] = [];
  const lensMats: THREE.MeshBasicMaterial[] = [];
  const fixturePos: THREE.Vector3[] = [];
  const fixtureGlow: THREE.Sprite[] = [];
  for (const [sx, col] of [[-1, "#f71d64"], [1, "#c14ed4"]] as const) {
    const g = new THREE.Group();
    g.position.set(sx * 3.05, 3.0, -3.6);
    scene.add(g);
    cyl(0.012, 0.012, 0.5, std("#222", 0.5, 0.6), 0, 0.25, 0, g, 8).castShadow = false;
    const can = cyl(0.15, 0.17, 0.4, std("#1a1618", 0.4, 0.5), 0, 0, 0, g, 20);
    const lensMat = track(new THREE.MeshBasicMaterial({ color: col }));
    lensMats.push(lensMat);
    const lens = cyl(0.14, 0.14, 0.02, lensMat, 0, -0.21, 0, g, 20);
    hitBox(0.7, 0.7, 0.7, 0, 0, 0, g, "stage-light");
    fixtureGlow.push(addGlow(g, 0, -0.1, 0, 1.3));
    fixturePos.push(g.position.clone());
    g.lookAt(0, 0.9, -3.0);
    g.rotateX(Math.PI / 2);
    can.castShadow = lens.castShadow = false;
    const spot = new THREE.SpotLight(col, 0, 12, 0.5, 0.65, 1.6);
    spot.position.copy(g.position);
    spot.target.position.set(0, 0.8, -3.0);
    scene.add(spot, spot.target);
    fixtures.push(spot);
  }

  const ball = new THREE.Group();
  ball.position.set(0, 2.82, -3.2);
  cyl(0.004, 0.004, 0.6, std("#555", 0.5, 0.8), 0, 0.5, 0, ball, 6).castShadow = false;
  const ballMat = track(new THREE.MeshStandardMaterial({ color: "#dcdcff", roughness: 0.1, metalness: 1, flatShading: true, envMap: scene.environment, envMapIntensity: 3.2, emissive: "#ffffff", emissiveIntensity: 0 }));
  const ballMesh = add(
    new THREE.IcosahedronGeometry(0.32, 2),
    ballMat,
    0,
    0,
    0,
    ball,
  );
  hitBox(0.9, 0.9, 0.9, 0, 0, 0, ball, "disco-ball");
  const ballGlow = addGlow(ball, 0, 0, -0.25, 1.5);
  (ballGlow.material as THREE.SpriteMaterial).depthTest = true; // halo stays behind the ball
  scene.add(ball);

  // ---------- DJ booth ----------
  const djMats: THREE.MeshStandardMaterial[] = [];
  {
    const g = new THREE.Group();
    g.position.set(0, 0, -3.0);
    box(3.2, 0.92, 0.8, woodMat("#2a2227", "#0f0b0d", [1, 1], "v", 0.6), 0, 0.46, 0, g);
    // fluted front: slim vertical slats above the neon strip
    const flute = woodMat("#34292d", "#120d0f", [0.12, 1], "v", 0.5);
    for (let i = 0; i < 31; i++) box(0.062, 0.66, 0.026, flute, -1.5 + i * 0.1, 0.55, 0.409, g);
    box(3.28, 0.05, 0.88, stoneMat("#e6e3ea", ["#9a96a2", "#c9c4cc"], 1800, 1.6, [], 0.3), 0, 0.945, 0, g);
    box(3.24, 0.014, 0.84, brass(), 0, 0.915, 0, g);
    box(3.0, 0.016, 0.016, neonMat("#ff3d8a", 1.2), 0, 0.12, 0.405, g).castShadow = false;
    const dark = std("#1a1618", 0.4, 0.3);
    // Stand-in controller, replaced by the real model (public/models/dj-controller.glb) as soon as it has loaded.
    const standIn = new THREE.Group();
    g.add(standIn);
    rbox(0.78, 0.05, 0.42, 0.012, dark, 0, 1.0, 0.02, standIn);
    for (const x of [-0.22, 0.22]) {
      cyl(0.1, 0.1, 0.018, std("#2c2630", 0.3, 0.6), x, 1.035, 0.03, standIn, 32);
      cyl(0.032, 0.032, 0.02, neonMat("#f71d64", 1), x, 1.04, 0.03, standIn, 20);
    }
    // click target sized to the real model (opened case, scaled up so it reads from across the room)
    const DJ_SCALE = 1.8;
    hitBox(1.1, 0.48, 0.88, 0, 0.97 + 0.24, 0.0, g, "dj-controller");
    new GLTFLoader().load("/models/dj-controller.glb", (gltf) => {
      const model = gltf.scene;
      model.scale.setScalar(DJ_SCALE);
      model.position.set(0, 0.97, 0.01);
      model.userData.part = "dj-controller";
      model.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        m.castShadow = true;
        m.receiveShadow = true;
        const mat = m.material as THREE.MeshStandardMaterial;
        mat.envMap = scene.environment;
        mat.side = THREE.FrontSide;
        // ROOMi "Black" edition: ink-black lacquer body, brushed silver, pink / purple / peach accents
        const paint = (hex: string, rough: number, metal = 0, env = 1) => {
          mat.map = null;
          mat.color.set(hex);
          mat.roughness = rough;
          mat.metalness = metal;
          mat.envMapIntensity = env;
        };
        switch (mat.name) {
          case "stone": // the case shell
            paint("#5b2f86", 0.28, 0.12, 1.5);
            break;
          case "cover_band": // trim ring around the case
            paint("#f71d64", 0.35, 0.2, 1.2);
            break;
          case "controller": // main body
            paint("#2a2430", 0.38, 0.15, 1.2);
            break;
          case "jog": // jog wheel tops
            paint("#15111a", 0.25, 0.25, 1.4);
            break;
          case "satin_metal": // wheel rims, rails, screws
            paint("#c9c6d1", 0.28, 0.9, 1.7);
            break;
          case "knob":
            paint("#ffb792", 0.4, 0.1, 1);
            break;
          case "slider":
            paint("#c14ed4", 0.4, 0.15, 1);
            break;
          case "pads":
            paint("#ff5c93", 0.3, 0.05, 1);
            mat.emissive = new THREE.Color("#f71d64");
            mat.emissiveIntensity = 0.45;
            break;
          case "indicator":
            paint("#ffb792", 0.5, 0, 1);
            mat.emissive = new THREE.Color("#ffb792");
            mat.emissiveIntensity = 0.8;
            break;
          case "display":
            mat.roughness = 0.35;
            mat.emissive = new THREE.Color("#ffffff");
            mat.emissiveMap = mat.map;
            mat.emissiveIntensity = 0.55;
            break;
          default:
            mat.roughness = 0.42;
        }
        mat.needsUpdate = true;
        mat.userData.baseEmissive = mat.emissive.clone();
        mat.userData.baseEmissiveIntensity = mat.emissiveIntensity;
        djMats.push(mat);
      });
      g.add(model);
      g.remove(standIn);
    });
    scene.add(g);

    for (const sx of [-1, 1]) {
      const sp = new THREE.Group();
      sp.position.set(sx * 2.25, 0, -3.05);
      sp.rotation.y = -sx * 0.22;
      rbox(0.55, 1.2, 0.46, 0.025, fabric("#16131a", [3, 6], 0.7), 0, 0.6, 0, sp);
      for (const [y, r] of [[0.42, 0.17], [0.9, 0.075]] as const) {
        cyl(r + 0.03, r + 0.03, 0.03, std("#0b090c", 0.7), 0, y, 0.235, sp, 36).rotation.x = Math.PI / 2;
        cyl(r, r * 0.8, 0.03, std("#2a252c", 0.4, 0.3), 0, y, 0.245, sp, 36).rotation.x = Math.PI / 2;
        add(new THREE.TorusGeometry(r * 0.8, r * 0.1, 8, 36), std("#0b090c", 0.9), 0, y, 0.262, sp);
        add(new THREE.SphereGeometry(r * 0.34, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), std("#34303a", 0.35, 0.4), 0, y, 0.256, sp).rotation.x = Math.PI / 2;
      }
      scene.add(sp);
    }
    blob(0, -3.0, 3.8, 1.5, 0, 0.9);
    blob(-2.25, -3.05, 1.1, 1.0, 0, 0.8);
    blob(2.25, -3.05, 1.1, 1.0, 0, 0.8);
  }

  // ---------- Star-edged rug in front of the booth ----------
  {
    const spikes = 34;
    const rx = 2.5;
    const rz = 1.55;
    const s = new THREE.Shape();
    for (let i = 0; i < spikes * 2; i++) {
      const a = (i / (spikes * 2)) * Math.PI * 2;
      const k = i % 2 === 0 ? 1 : 0.9;
      const x = Math.cos(a) * rx * k;
      const y = Math.sin(a) * rz * k;
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
    s.closePath();
    const geo = new THREE.ShapeGeometry(s);
    const p = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / (rx * 2) + 0.5, p.getY(i) / (rz * 2) + 0.5);
    const { c, g } = canvas(512, 320);
    const grad = g.createRadialGradient(256, 160, 20, 256, 160, 260);
    grad.addColorStop(0, "#9a3a78");
    grad.addColorStop(1, "#c82868");
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 320);
    g.strokeStyle = "rgba(240,240,240,0.8)";
    g.lineWidth = 5;
    g.beginPath();
    g.ellipse(256, 160, 165, 95, 0, 0, Math.PI * 2);
    g.stroke();
    const rugMat = track(new THREE.MeshStandardMaterial({ map: tex(c), roughness: 1, normalMap: file("fabric_normal.jpg", false, [10, 6]), normalScale: new THREE.Vector2(1, 1) }));
    const rug = add(geo, rugMat, 0, 0.014, -0.55);
    rug.rotation.x = -Math.PI / 2;
    rug.castShadow = false;
  }

  // ---------- Left wall: sofa with the goods on it ----------
  {
    const g = new THREE.Group();
    g.position.set(-W + 0.7, 0, -1.3);
    g.rotation.y = Math.PI / 2;
    const velvet = velvetMat("#3b2c46", "#b58ad0", [5, 3]);
    const velvetL = velvetMat("#46345a", "#c79ae0", [4, 3]);
    rbox(2.5, 0.36, 1.0, 0.09, velvet, 0, 0.25, 0, g);
    for (const x of [-0.6, 0.6]) rbox(1.15, 0.22, 0.84, 0.1, velvetL, x, 0.52, 0.06, g);
    for (const x of [-0.6, 0.6]) rbox(1.15, 0.52, 0.28, 0.11, velvetL, x, 0.84, -0.34, g).rotation.x = -0.14;
    for (const x of [-1.24, 1.24]) rbox(0.24, 0.64, 1.0, 0.09, velvet, x, 0.5, 0, g);
    const legWood = woodMat("#4a3426", "#21140d", [1, 1], "v", 0.45);
    for (const x of [-1.1, 1.1]) {
      for (const z of [-0.4, 0.4]) {
        cyl(0.036, 0.022, 0.14, legWood, x, 0.07, z, g, 14);
        cyl(0.024, 0.024, 0.014, brass(), x, 0.007, z, g, 14);
      }
    }
    // piping along the seat fronts and tops of the backs, seams down the backrests, plinth shadow line
    const pipe = std("#34283f", 0.85);
    for (const x of [-0.6, 0.6]) {
      cyl(0.0085, 0.0085, 1.1, pipe, x, 0.612, 0.478, g, 8).rotation.z = Math.PI / 2;
      cyl(0.0085, 0.0085, 1.08, pipe, x, 1.1, -0.38, g, 8).rotation.z = Math.PI / 2;
      const back = new THREE.Group();
      back.position.set(x, 0.84, -0.34);
      back.rotation.x = -0.14;
      for (const sx of [-0.27, 0, 0.27]) box(0.005, 0.38, 0.004, pipe, sx, 0.02, 0.141, back);
      g.add(back);
    }
    for (const x of [-1.24, 1.24]) cyl(0.0085, 0.0085, 0.9, pipe, x, 0.835, 0, g, 8).rotation.x = Math.PI / 2;
    box(2.46, 0.03, 0.96, std("#1b1422", 0.9), 0, 0.085, 0, g);
    // throw pillow against the left arm
    {
      const pil = rbox(0.34, 0.34, 0.12, 0.05, velvetMat("#c6806c", "#ffb792", [2, 2]), -0.98, 0.84, -0.1, g);
      pil.rotation.set(-0.16, 0.38, 0.16);
      cyl(0.006, 0.006, 0.01, brass(), -0.98, 0.84, -0.04, g, 8).rotation.x = Math.PI / 2;
    }

    // cap on the seat (a product): six-panel baseball cap with seams, button, eyelets, stitched brim, back strap and a front mark
    {
      const cg = new THREE.Group();
      cg.position.set(0.62, 0.66, 0.14);
      cg.rotation.set(-0.06, 0.5, 0.03);
      const R = 0.112;
      const SY = 0.84;
      const capMat = fabric("#f71d64", [10, 10], 0.82);
      const seamMat = std("#d3135a", 0.85);
      const light = std("#ffd9e6", 0.8);
      const part = <T extends THREE.Object3D>(o: T) => tag(o, "cap");
      // crown
      part(add(new THREE.SphereGeometry(R, 56, 28, 0, Math.PI * 2, 0, Math.PI / 2), capMat, 0, 0, 0, cg)).scale.set(1, SY, 1);
      // panel seams (meridians) with a darker, raised thread and a topstitch beside each
      for (let k = 0; k < 6; k++) {
        const th = (k * Math.PI) / 3;
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i <= 20; i++) {
          const ph = (i / 20) * (Math.PI / 2 - 0.02);
          pts.push(new THREE.Vector3(R * 1.004 * Math.sin(ph) * Math.sin(th), R * SY * 1.004 * Math.cos(ph), R * 1.004 * Math.sin(ph) * Math.cos(th)));
        }
        part(add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 28, 0.0016, 5), seamMat, 0, 0, 0, cg, false));
        for (const d of [-0.05, 0.05]) {
          const sp: THREE.Vector3[] = [];
          for (let i = 1; i <= 18; i++) {
            const ph = (i / 20) * (Math.PI / 2 - 0.03);
            const t2 = th + d / Math.max(Math.sin(ph), 0.25);
            sp.push(new THREE.Vector3(R * 1.003 * Math.sin(ph) * Math.sin(t2), R * SY * 1.003 * Math.cos(ph), R * 1.003 * Math.sin(ph) * Math.cos(t2)));
          }
          part(add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sp), 28, 0.0007, 4), light, 0, 0, 0, cg, false));
        }
      }
      // eyelets on the four back and side panels
      for (const th of [Math.PI / 2, (5 * Math.PI) / 6, (7 * Math.PI) / 6, (3 * Math.PI) / 2]) {
        const ph = 0.62;
        const e = part(add(new THREE.SphereGeometry(0.0062, 10, 6), std("#a80f47", 0.6), R * 1.002 * Math.sin(ph) * Math.sin(th), R * SY * Math.cos(ph), R * 1.002 * Math.sin(ph) * Math.cos(th), cg, false));
        e.scale.set(1, 1, 0.45);
        e.lookAt(0, R * SY * Math.cos(ph) * 0.5, 0);
      }
      // button
      part(add(new THREE.SphereGeometry(0.0125, 16, 10), capMat, 0, R * SY + 0.0015, 0, cg, false)).scale.y = 0.7;
      // bottom binding showing at the rim
      part(add(new THREE.TorusGeometry(R * 0.998, 0.0045, 8, 56), std("#f4f2f5", 0.7), 0, 0.002, 0, cg, false)).rotation.x = Math.PI / 2;
      // brim: its back edge hugs the crown's bottom circle, the front is a rounded visor, bent down at the sides
      {
        const XE = 0.108;
        const yb = (x: number) => Math.sqrt(Math.max(R * R - x * x, 0)) - 0.014;
        const c1 = new THREE.CubicBezierCurve(new THREE.Vector2(-XE, yb(-XE)), new THREE.Vector2(-0.118, 0.175), new THREE.Vector2(-0.06, 0.226), new THREE.Vector2(0, 0.226));
        const c2 = new THREE.CubicBezierCurve(new THREE.Vector2(0, 0.226), new THREE.Vector2(0.06, 0.226), new THREE.Vector2(0.118, 0.175), new THREE.Vector2(XE, yb(XE)));
        const sh = new THREE.Shape();
        sh.moveTo(-XE, yb(-XE));
        sh.bezierCurveTo(-0.118, 0.175, -0.06, 0.226, 0, 0.226);
        sh.bezierCurveTo(0.06, 0.226, 0.118, 0.175, XE, yb(XE));
        for (let i = 1; i <= 24; i++) {
          const x = XE - (i / 24) * 2 * XE;
          sh.lineTo(x, yb(x));
        }
        const bend = (x: number) => 2.1 * x * x;
        const place = new THREE.Matrix4().makeTranslation(0, 0.017, 0).multiply(new THREE.Matrix4().makeRotationX(0.07));
        // flat shape (x, y) -> world (x, bent height, y): a top sheet, a darker underside sheet 3.5mm below, and a rounded edge between
        const sheet = (dy: number) => {
          const gm = new THREE.ShapeGeometry(sh, 32);
          const pp = gm.attributes.position;
          for (let i = 0; i < pp.count; i++) {
            const x = pp.getX(i);
            const z = pp.getY(i);
            pp.setXYZ(i, x, -bend(x) + dy, z);
          }
          gm.computeVertexNormals();
          gm.applyMatrix4(place);
          return gm;
        };
        const topMat = fabric("#f71d64", [4, 4], 0.78);
        topMat.side = THREE.DoubleSide;
        const underMat = std("#c4124f", 0.85);
        underMat.side = THREE.DoubleSide;
        part(add(sheet(0), topMat, 0, 0, 0, cg));
        part(add(sheet(-0.0035), underMat, 0, 0, 0, cg, false));
        const edge = sh.getPoints(60).map((p) => new THREE.Vector3(p.x, -bend(p.x) - 0.00175, p.y).applyMatrix4(place));
        part(add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(edge, true), 160, 0.0021, 6, true), seamMat, 0, 0, 0, cg, false));
        const front = [...c1.getPoints(24), ...c2.getPoints(24).slice(1)].filter((p) => p.y > 0.13);
        for (const k of [0.95, 0.88, 0.81]) {
          const v = front.map((p) => {
            const x = p.x * k;
            const z = 0.118 + (p.y - 0.118) * k;
            return new THREE.Vector3(x, -bend(x) + 0.0006, z).applyMatrix4(place);
          });
          part(add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(v), 60, 0.0006, 4), light, 0, 0, 0, cg, false));
        }
      }
      // back strap with a small metal slide
      {
        const strap = part(add(new THREE.BoxGeometry(0.075, 0.018, 0.005), std("#f0eef2", 0.8), 0, 0.028, -R * 0.985, cg, false));
        strap.rotation.x = 0.12;
        part(add(new THREE.BoxGeometry(0.022, 0.02, 0.008), brass(), 0.012, 0.028, -R * 0.99, cg, false));
      }
      // small front mark on the crown, following its slope
      {
        const { c, g: cx } = canvas(256, 112);
        const paint = () => {
          cx.clearRect(0, 0, 256, 112);
          cx.fillStyle = "#fff3f7";
          cx.textAlign = "center";
          cx.textBaseline = "middle";
          cx.font = '900 70px "Pretendard Variable", "Arial Black", sans-serif';
          cx.fillText("ROOMi", 128, 56);
        };
        paint();
        const tt = tex(c);
        document.fonts?.ready.then(() => {
          paint();
          tt.needsUpdate = true;
        });
        const ph = 1.12;
        const mark = add(
          new THREE.PlaneGeometry(0.092, 0.0402),
          track(new THREE.MeshBasicMaterial({ map: tt, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })),
          0,
          R * SY * Math.cos(ph),
          R * Math.sin(ph) * 1.022,
          cg,
          false,
        );
        mark.rotation.x = -(Math.PI / 2 - ph) * 0.96;
        mark.userData.part = "cap";
      }
      hitBox(0.34, 0.2, 0.34, 0, 0.05, 0.05, cg, "cap");
      g.add(cg);
    }
    // slogan towel: a banner-shaped cloth thrown over the backrest, slumping onto the seat
    {
      // The cloth runs along the logo: canvas x follows the drape (back of the sofa -> over the top -> down onto the seat).
      const { c, g: cg2 } = canvas(2048, 640);
      const paintTowel = (logo?: HTMLImageElement) => {
        cg2.fillStyle = "#f71d64";
        cg2.fillRect(0, 0, 2048, 640);
        cg2.fillStyle = "#f4f2f5";
        cg2.fillRect(0, 70, 2048, 8);
        cg2.fillRect(0, 562, 2048, 8);
        if (logo) {
          const h = 420;
          const w = (h * logo.width) / logo.height;
          cg2.drawImage(logo, 2048 - w - 120, 320 - h / 2, w, h);
        }
      };
      paintTowel();
      const tt = tex(c);
      const logoImg = new Image();
      logoImg.onload = () => {
        paintTowel(logoImg);
        tt.needsUpdate = true;
      };
      logoImg.src = "/shop3d/slogan.png";
      const mat = track(new THREE.MeshStandardMaterial({ map: tt, roughness: 1, normalMap: file("fabric_normal.jpg", false, [6, 3]), normalScale: new THREE.Vector2(0.6, 0.6), side: THREE.DoubleSide }));
      // path in the sofa's (z, y) plane: behind the backrest -> over its top -> down its face -> across the seat
      const path: [number, number][] = [[-0.52, 0.55], [-0.5, 1.0], [-0.42, 1.15], [-0.3, 1.16], [-0.2, 1.02], [-0.14, 0.78], [-0.1, 0.67], [0.05, 0.655], [0.3, 0.65], [0.5, 0.65]];
      const cum = [0];
      for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
      const total = cum[cum.length - 1];
      const SX = 36;
      const SS = 28;
      const geo = new THREE.PlaneGeometry(1, 1, SX, SS);
      const pos = geo.attributes.position;
      const uv = geo.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i) + 0.5;
        const sv = 0.5 - pos.getY(i);
        const d = sv * total;
        let k = 1;
        while (k < cum.length - 1 && cum[k] < d) k++;
        const f = (d - cum[k - 1]) / (cum[k] - cum[k - 1]);
        let z = path[k - 1][0] + (path[k][0] - path[k - 1][0]) * f;
        let y = path[k - 1][1] + (path[k][1] - path[k - 1][1]) * f;
        const rip = Math.sin(u * 17 + sv * 6) * 0.012 + Math.sin(u * 7 - sv * 3) * 0.01;
        z += 0.012 + rip;
        y += 0.008 + rip * 0.5;
        const x = -0.45 + (u - 0.5) * 0.62 + sv * (u - 0.5) * 0.12 + Math.sin(sv * 4) * 0.025;
        pos.setXYZ(i, x, y, z);
        uv.setXY(i, sv, u);
      }
      geo.computeVertexNormals();
      flatten["slogan-towel"] = () => {
        const base = new THREE.PlaneGeometry(1, 1, SX, SS).attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const u = base.getX(i) + 0.5;
          const sv = 0.5 - base.getY(i);
          pos.setXYZ(i, (u - 0.5) * 0.62, (0.5 - sv) * 1.82, Math.sin(sv * 5 + u * 3) * 0.018 + Math.sin(u * 9 + sv * 2) * 0.008);
        }
        geo.computeVertexNormals();
        pos.needsUpdate = true;
      };
      flatGeo["slogan-towel"] = () => {
        const g2 = geo.clone();
        const p2 = g2.attributes.position;
        const base = new THREE.PlaneGeometry(1, 1, SX, SS).attributes.position;
        for (let i = 0; i < p2.count; i++) {
          const u = base.getX(i) + 0.5;
          const sv = 0.5 - base.getY(i);
          p2.setXYZ(i, (u - 0.5) * 0.62, (0.5 - sv) * 1.82, Math.sin(sv * 5 + u * 3) * 0.018 + Math.sin(u * 9 + sv * 2) * 0.008);
        }
        g2.computeVertexNormals();
        // the copied geometry still carries the sofa-side bounding sphere: recompute it or the viewer culls the flat cloth
        g2.computeBoundingBox();
        g2.computeBoundingSphere();
        g2.userData.own = true;
        return g2;
      };
      const cloth = tag(add(geo, mat, 0, 0, 0, g), "slogan-towel");
      cloth.castShadow = false;
      hitBox(0.7, 0.55, 0.45, -0.45, 0.88, -0.15, g, "slogan-towel");
    }
    // bandana: a square folded into a triangle, thrown over the right armrest with the point hanging down
    {
      const { c, g: cg } = canvas(256, 256);
      cg.clearRect(0, 0, 256, 256);
      cg.beginPath();
      cg.moveTo(0, 0);
      cg.lineTo(256, 0);
      cg.lineTo(128, 256);
      cg.closePath();
      cg.fillStyle = "#b845cf";
      cg.fill();
      cg.save();
      cg.clip();
      // paisley-ish print: a border line and rows of small dots
      cg.strokeStyle = "#f4e3fa";
      cg.lineWidth = 6;
      cg.beginPath();
      cg.moveTo(18, 14);
      cg.lineTo(238, 14);
      cg.lineTo(128, 232);
      cg.closePath();
      cg.stroke();
      cg.fillStyle = "#ff9fcb";
      for (let r = 0; r < 7; r++) {
        for (let k = 0; k < 8 - r; k++) {
          const x = 40 + k * 26 + r * 13;
          const y = 40 + r * 26;
          cg.beginPath();
          cg.arc(x, y, 4.5, 0, Math.PI * 2);
          cg.fill();
        }
      }
      cg.restore();
      const bt = tex(c);
      const mat = track(new THREE.MeshStandardMaterial({ map: bt, alphaTest: 0.5, roughness: 1, side: THREE.DoubleSide, normalMap: file("fabric_normal.jpg", false, [4, 4]), normalScale: new THREE.Vector2(0.6, 0.6) }));
      // path in the sofa's (x, y) plane: seat side -> over the arm -> down the outside
      const path: [number, number][] = [[1.0, 0.7], [1.1, 0.8], [1.24, 0.842], [1.36, 0.8], [1.395, 0.66], [1.405, 0.42]];
      const cum = [0];
      for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
      const total = cum[cum.length - 1];
      const geo = new THREE.PlaneGeometry(1, 1, 22, 26);
      const pos = geo.attributes.position;
      const uv = geo.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i) + 0.5;
        const sv = 0.5 - pos.getY(i);
        const d = sv * total;
        let k = 1;
        while (k < cum.length - 1 && cum[k] < d) k++;
        const f = (d - cum[k - 1]) / (cum[k] - cum[k - 1]);
        const x0 = path[k - 1][0] + (path[k][0] - path[k - 1][0]) * f;
        const y0 = path[k - 1][1] + (path[k][1] - path[k - 1][1]) * f;
        const tx = path[k][0] - path[k - 1][0];
        const ty = path[k][1] - path[k - 1][1];
        const tl = Math.hypot(tx, ty);
        const nx = -ty / tl;
        const ny = tx / tl;
        const rip = Math.sin(u * 14 + sv * 5) * 0.008 + Math.sin(u * 5 - sv * 3) * 0.006;
        const off = 0.01 + rip;
        pos.setXYZ(i, x0 + nx * off, y0 + ny * off, 0.12 + (u - 0.5) * 0.5 + (sv - 0.4) * 0.1);
        uv.setXY(i, u, 1 - sv);
      }
      geo.computeVertexNormals();
      flatten["bandana"] = () => {
        const base = new THREE.PlaneGeometry(1, 1, 22, 26).attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const u = base.getX(i) + 0.5;
          const sv = 0.5 - base.getY(i);
          pos.setXYZ(i, (u - 0.5) * 0.5, (0.5 - sv) * 0.5, Math.sin(u * 8 + sv * 5) * 0.016 + Math.sin(u * 3 - sv * 4) * 0.012);
        }
        geo.computeVertexNormals();
        pos.needsUpdate = true;
      };
      flatGeo["bandana"] = () => {
        const g2 = geo.clone();
        const p2 = g2.attributes.position;
        const base = new THREE.PlaneGeometry(1, 1, 22, 26).attributes.position;
        for (let i = 0; i < p2.count; i++) {
          const u = base.getX(i) + 0.5;
          const sv = 0.5 - base.getY(i);
          p2.setXYZ(i, (u - 0.5) * 0.5, (0.5 - sv) * 0.5, Math.sin(u * 8 + sv * 5) * 0.016 + Math.sin(u * 3 - sv * 4) * 0.012);
        }
        g2.computeVertexNormals();
        // the copied geometry still carries the sofa-side bounding sphere: recompute it or the viewer culls the flat cloth
        g2.computeBoundingBox();
        g2.computeBoundingSphere();
        g2.userData.own = true;
        return g2;
      };
      const cloth = tag(add(geo, mat, 0, 0, 0, g), "bandana");
      cloth.castShadow = false;
      hitBox(0.3, 0.55, 0.55, 1.28, 0.62, 0.12, g, "bandana");
    }
    scene.add(g);
    blob(-W + 0.7, -1.3, 1.5, 2.9, 0, 0.9);
  }

  // ---------- Left wall: oval table, party food and drinks, keyrings, patches ----------
  {
    const g = new THREE.Group();
    g.position.set(-W + 2.0, 0, -1.3);
    g.rotation.y = 0.12;
    // terrazzo top; the side is plain lacquer so the texture does not smear into streaks
    const tableSide = track(new THREE.MeshPhysicalMaterial({ color: "#ece7e2", roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.15 }));
    const tableTop = stoneMat("#e9e4df", ["#a39a94", "#cfc6bf"], 1400, 1.2, ["#f71d64", "#c14ed4", "#ffb792", "#6b6470"], 0.26);
    tableTop.map!.repeat.set(2.4, 2.4);
    cyl(1, 1, 0.07, tableSide, 0, 0.46, 0, g, 64).scale.set(0.9, 1, 0.58);
    {
      const topDisc = add(new THREE.CircleGeometry(1, 64), tableTop, 0, 0.4955, 0, g, false);
      topDisc.rotation.x = -Math.PI / 2;
      topDisc.scale.set(0.9, 0.58, 1);
      topDisc.receiveShadow = true;
    }
    // brass edge bands
    for (const y of [0.4955, 0.4255]) {
      const rim = add(new THREE.TorusGeometry(1, 0.011, 8, 96), brass(), 0, y, 0, g, false);
      rim.rotation.x = Math.PI / 2;
      rim.scale.set(0.9, 0.58, 1);
    }
    for (const x of [-0.45, 0.45]) {
      cyl(0.09, 0.12, 0.43, std("#262329", 0.4, 0.6), x, 0.22, 0, g, 28);
      cyl(0.1, 0.1, 0.012, brass(), x, 0.428, 0, g, 28);
      cyl(0.13, 0.13, 0.012, brass(), x, 0.008, 0, g, 28);
    }
    box(0.42, 0.045, 0.42, std("#c9a26a", 0.9), -0.45, 0.52, -0.08, g).rotation.y = 0.35;
    cyl(0.17, 0.17, 0.02, std("#e7b04a", 0.8), -0.45, 0.555, -0.08, g, 24);
    const glassM = track(new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.05, transparent: true, opacity: 0.26, clearcoat: 1 }));
    for (const [c, x, z] of [["#f71d64", -0.05, -0.14], ["#ffb792", 0.08, 0.02], ["#c14ed4", 0.2, -0.1]] as const) {
      cyl(0.045, 0.036, 0.13, glassM, x, 0.565, z, g, 18).castShadow = false;
      cyl(0.04, 0.033, 0.07, track(new THREE.MeshStandardMaterial({ color: c, roughness: 0.2, emissive: c, emissiveIntensity: 0.2 })), x, 0.545, z, g, 18);
    }
    const bottleM = track(new THREE.MeshPhysicalMaterial({ color: "#1b5a38", roughness: 0.12, clearcoat: 1 }));
    cyl(0.04, 0.04, 0.26, bottleM, 0.38, 0.62, -0.18, g, 18);
    cyl(0.015, 0.04, 0.07, bottleM, 0.38, 0.79, -0.18, g, 14);

    for (const [x, z, col, rot] of [[-0.48, 0.28, "#f71d64", 0.2], [-0.28, 0.34, "#c14ed4", -0.3]] as const) {
      const kg = new THREE.Group();
      kg.position.set(x, 0.52, z);
      kg.rotation.y = rot;
      tag(box(0.13, 0.008, 0.13, std(col, 0.6), 0, 0, 0, kg), "mini-cd-keyring");
      tag(cyl(0.055, 0.055, 0.006, track(new THREE.MeshStandardMaterial({ color: "#cfd3ff", roughness: 0.12, metalness: 0.9, envMap: scene.environment, envMapIntensity: 2 })), 0, 0.008, 0, kg, 28), "mini-cd-keyring");
      hitBox(0.3, 0.12, 0.2, 0.06, 0.03, 0, kg, "mini-cd-keyring");
      g.add(kg);
    }
    ["R", "O", "M", "i"].forEach((ch, i) => {
      const { c, g: pg } = canvas(96, 72);
      pg.fillStyle = ["#f71d64", "#c14ed4", "#ffb792", "#f0f0f0"][i];
      pg.fillRect(0, 0, 96, 72);
      pg.fillStyle = i === 3 ? "#111" : "#fff";
      pg.font = '900 56px "Pretendard Variable", Arial Black, sans-serif';
      pg.textAlign = "center";
      pg.textBaseline = "middle";
      pg.fillText(ch, 48, 40);
      const pm = track(new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.9 }));
      tag(box(0.12, 0.012, 0.09, pm, 0.02 + i * 0.14, 0.512, 0.34 - (i % 2) * 0.05, g), "letter-patch").rotation.y = 0.2 - i * 0.18;
    });
    hitBox(0.6, 0.1, 0.22, 0.2, 0.52, 0.32, g, "letter-patch");
    scene.add(g);
    blob(-W + 2.0, -1.3, 2.1, 1.4, 0.12, 0.7);
  }

  // ---------- Right wall: six-cell shelf of party supplies + Bluetooth speaker ----------
  {
    const g = new THREE.Group();
    g.position.set(W - 0.32, 0, -1.6);
    g.rotation.y = -Math.PI / 2;
    const frame = woodMat("#3a2a24", "#1b100c", [1, 1], "v", 0.42);
    const cw = 0.54;
    const cols = 3;
    const rows = 2;
    const shelfH = rows * cw + 0.06;
    const y0 = 0.14;
    rbox(cols * cw + 0.06, 0.14, 0.4, 0.01, frame, 0, 0.07, 0, g);
    for (let i = 0; i <= cols; i++) rbox(0.035, shelfH, 0.38, 0.006, frame, -(cols * cw) / 2 + i * cw, y0 + shelfH / 2, 0, g);
    for (let j = 0; j <= rows; j++) rbox(cols * cw + 0.035, 0.035, 0.38, 0.006, frame, 0, y0 + j * cw + 0.017, 0, g);
    box(cols * cw + 0.03, shelfH, 0.01, std("#0e0a10", 0.8), 0, y0 + shelfH / 2, -0.19, g);

    const mats = ["#f71d64", "#c14ed4", "#ffb792", "#f0f0f0"].map((c) => std(c, 0.55));
    // Each cell holds one calm group: balloons, hats, rolls, gifts, cups, poppers.
    const cell = (cx: number, cy: number, kind: number) => {
      const by = y0 + cy * cw + 0.03;
      if (kind === 0) {
        for (let i = 0; i < 3; i++) {
          const col = ["#f71d64", "#c14ed4", "#f0f0f0"][i];
          const b = add(new THREE.SphereGeometry(0.085, 20, 16), track(new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.22, clearcoat: 0.6 })), cx - 0.12 + i * 0.12, by + 0.3 + (i % 2) * 0.06, 0, g);
          b.scale.y = 1.2;
          cyl(0.002, 0.002, 0.2, std("#ddd", 0.9), b.position.x, by + 0.19, 0, g, 4);
        }
      } else if (kind === 1) {
        for (let i = 0; i < 3; i++) add(new THREE.ConeGeometry(0.06, 0.2, 18), mats[i], cx - 0.13 + i * 0.13, by + 0.1, 0, g);
      } else if (kind === 2) {
        for (let i = 0; i < 3; i++) cyl(0.055, 0.055, 0.13, mats[(i + 1) % 4], cx - 0.14 + i * 0.14, by + 0.065, 0, g, 18);
      } else if (kind === 3) {
        for (let i = 0; i < 2; i++) {
          const w = 0.16 + i * 0.04;
          rbox(w, w * 0.9, w, 0.006, mats[(i + 2) % 4], cx - 0.1 + i * 0.17, by + (w * 0.9) / 2, 0, g);
          box(w + 0.006, 0.02, 0.02, std("#fff", 0.4), cx - 0.1 + i * 0.17, by + (w * 0.9) / 2, w / 2, g);
        }
      } else if (kind === 4) {
        for (let i = 0; i < 2; i++) for (let k = 0; k < 4; k++) cyl(0.05, 0.038, 0.055, std(i === 0 ? "#f71d64" : "#f0f0f0", 0.5), cx - 0.1 + i * 0.2, by + 0.03 + k * 0.035, 0, g, 16);
      } else {
        for (let i = 0; i < 3; i++) add(new THREE.ConeGeometry(0.04, 0.2, 12), mats[(i + 3) % 4], cx - 0.12 + i * 0.12, by + 0.1, 0, g).rotation.z = 0.2 - i * 0.2;
      }
    };
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) cell(-((cols * cw) / 2) + (i + 0.5) * cw, j, j * cols + i);

    // Bluetooth speaker on top: black tolex, cream grille, gold knobs. No logo.
    {
      const sp = new THREE.Group();
      sp.position.set(-0.5, y0 + rows * cw + 0.03 + 0.16, 0.0);
      rbox(0.6, 0.32, 0.24, 0.02, track(new THREE.MeshStandardMaterial({ color: "#15121a", roughness: 0.85, normalMap: file("fabric_normal.jpg", false, [10, 5]), normalScale: new THREE.Vector2(1.2, 1.2) })), 0, 0, 0, sp);
      const { c, g: gc } = canvas(256, 128);
      gc.fillStyle = "#cdbd8f";
      gc.fillRect(0, 0, 256, 128);
      for (let i = 0; i < 128; i += 3) {
        gc.fillStyle = i % 6 === 0 ? "rgba(70,52,28,0.5)" : "rgba(255,246,214,0.25)";
        gc.fillRect(0, i, 256, 1);
      }
      add(new THREE.PlaneGeometry(0.54, 0.2), track(new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.9 })), 0, -0.03, 0.123, sp).castShadow = false;
      const gold = std("#e7dcb4", 0.35, 0.5);
      box(0.57, 0.012, 0.01, gold, 0, 0.075, 0.125, sp);
      box(0.57, 0.012, 0.01, gold, 0, -0.135, 0.125, sp);
      add(new THREE.TorusGeometry(0.11, 0.012, 8, 20, Math.PI), std("#1d1a20", 0.5, 0.3), 0, 0.16, 0, sp);
      for (let i = 0; i < 4; i++) cyl(0.017, 0.017, 0.022, std("#d6b25a", 0.3, 0.9), -0.2 + i * 0.1, 0.168, 0.07, sp, 14);
      g.add(sp);
    }

    // Open laptop beside the speaker, turned a little toward the back wall. Clicking it leaves for the 2D shop.
    {
      const lp = new THREE.Group();
      lp.position.set(0.32,y0 + shelfH + 0.007, 0.02);
      lp.rotation.y = -0.28;
      lp.scale.setScalar(1.3);
      const alu = std("#b9b6bd", 0.35, 0.8);
      rbox(0.32, 0.012, 0.22, 0.004, alu, 0, 0, 0, lp);
      box(0.27, 0.002, 0.1, std("#1c1a20", 0.6), 0, 0.0065, -0.03, lp).castShadow = false;
      box(0.09, 0.002, 0.055, std("#9d9aa2", 0.4, 0.6), 0, 0.0065, 0.075, lp).castShadow = false;
      const lid = new THREE.Group();
      lid.position.set(0, 0.006, -0.11);
      lid.rotation.x = -0.3;
      rbox(0.32, 0.21, 0.008, 0.003, alu, 0, 0.105, 0, lid);
      const { c, g: sg } = canvas(512, 330);
      const bg = sg.createLinearGradient(0, 0, 512, 330);
      bg.addColorStop(0, "#f71d64");
      bg.addColorStop(1, "#c14ed4");
      sg.fillStyle = bg;
      sg.fillRect(0, 0, 512, 330);
      sg.fillStyle = "#fff";
      sg.textAlign = "center";
      sg.textBaseline = "middle";
      sg.font = '900 74px "Pretendard Variable", Arial Black, sans-serif';
      sg.fillText("ROOMi", 256, 120);
      sg.font = '700 40px "Pretendard Variable", Arial, sans-serif';
      sg.fillText("SHOP", 256, 186);
      sg.fillStyle = "#111";
      sg.beginPath();
      sg.roundRect(176, 236, 160, 52, 26);
      sg.fill();
      sg.fillStyle = "#fff";
      sg.font = '700 26px "Pretendard Variable", Arial, sans-serif';
      sg.fillText("Enter →", 256, 263);
      lapMat = track(new THREE.MeshBasicMaterial({ map: tex(c) }));
      add(new THREE.PlaneGeometry(0.29, 0.186), lapMat, 0, 0.108, 0.0045, lid, false);
      lapGlow = addGlow(lid, 0, 0.108, 0.05, 0.6);
      hitBox(0.38, 0.3, 0.34, 0, 0.14, 0.02, lp, "laptop");
      lp.add(lid);
      g.add(lp);
    }
    scene.add(g);
    blob(W - 0.32, -1.6, 0.8, 2.0, 0, 0.8);
  }

  // ---------- Light spots thrown by the disco ball (a few, only after dark) ----------
  const spotGeo = track(new THREE.PlaneGeometry(0.2, 0.2));
  const spotMats = ["#ff5c9a", "#d77bff", "#ffffff"].map((c) => track(new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })));
  const dirs: THREE.Vector3[] = [];
  {
    const ico = new THREE.IcosahedronGeometry(1, 2).attributes.position;
    const seen = new Set<string>();
    for (let i = 0; i < ico.count; i++) {
      const v = new THREE.Vector3(ico.getX(i), ico.getY(i), ico.getZ(i));
      const key = v.toArray().map((n) => n.toFixed(3)).join();
      if (!seen.has(key) && seen.size % 5 === 0) dirs.push(v);
      seen.add(key);
    }
  }
  const spots = dirs.map((_, i) => {
    const m = new THREE.Mesh(spotGeo, spotMats[i % spotMats.length]);
    m.userData.s = 0.5 + ((i * 37) % 10) / 14;
    m.frustumCulled = false;
    scene.add(m);
    return m;
  });
  const ballPos = new THREE.Vector3();
  const rot = new THREE.Matrix4();
  const tmp = new THREE.Vector3();
  const throwSpots = (t: number, strength: number) => {
    ball.getWorldPosition(ballPos);
    rot.makeRotationY(t * 0.6);
    const lim = [
      [-W, W, "x"],
      [0, H, "y"],
      [Z0, Z1 - 0.05, "z"],
    ] as const;
    for (let i = 0; i < spots.length; i++) {
      const m = spots[i];
      tmp.copy(dirs[i]).applyMatrix4(rot);
      let best = Infinity;
      let hitAxis = "y";
      let sign = 1;
      for (const [lo, hi, ax] of lim) {
        const dv = tmp[ax];
        if (Math.abs(dv) < 1e-4) continue;
        const target = dv > 0 ? hi : lo;
        const dist = (target - ballPos[ax]) / dv;
        if (dist > 0.05 && dist < best) {
          best = dist;
          hitAxis = ax;
          sign = dv > 0 ? 1 : -1;
        }
      }
      if (!isFinite(best)) {
        m.visible = false;
        continue;
      }
      m.visible = strength > 0.01;
      m.position.copy(ballPos).addScaledVector(tmp, best - 0.02);
      m.rotation.set(0, 0, 0);
      if (hitAxis === "x") m.rotation.y = (-sign * Math.PI) / 2;
      else if (hitAxis === "y") m.rotation.x = ((sign > 0 ? 1 : -1) * Math.PI) / 2;
      else if (sign > 0) m.rotation.y = Math.PI;
      m.scale.setScalar((0.6 + best * 0.12) * (m.userData.s as number));
      (m.material as THREE.MeshBasicMaterial).opacity = strength * 0.45;
    }
  };

  // ---------- Lasers (rave mode only): thin additive beams sweeping from the stage lights ----------
  const beamGeo = track(new THREE.CylinderGeometry(0.006, 0.006, 1, 5, 1, true));
  beamGeo.translate(0, 0.5, 0);
  const beams = Array.from({ length: 6 }, (_, i) => {
    const mat = track(new THREE.MeshBasicMaterial({ color: i % 2 ? "#ff1f2d" : "#ff7a1a", transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
    const m = new THREE.Mesh(beamGeo, mat);
    m.frustumCulled = false;
    m.visible = false;
    scene.add(m);
    return m;
  });
  const up = new THREE.Vector3(0, 1, 0);
  const sweep = (t: number) => {
    beams.forEach((m, i) => {
      const src = fixturePos[i % 2];
      const k = Math.floor(i / 2);
      const a = t * (0.2 + k * 0.05) + k * 1.3 + (i % 2) * 2.1;
      tmp.set(Math.sin(a) * 2.6, 0.2 + (Math.sin(a * 1.7) * 0.5 + 0.5) * 2.2, -1.2 + Math.cos(a * 0.9) * 1.8).sub(src);
      const len = tmp.length();
      m.position.copy(src);
      m.quaternion.setFromUnitVectors(up, tmp.normalize());
      m.scale.set(1, Math.min(len + 3, 9), 1);
    });
  };

  // ---------- Moods ----------
  let spotStrength = 0;
  let lasers = false;
  let spin = false;
  let angle = 0;
  let lastT = 0;
  const lensBase = [new THREE.Color(), new THREE.Color()];
  let hoverId: string | null = null;
  let hLight = 0;
  let hBall = 0;
  let hLap = 0;
  let hDj = 0;
  const pinkGlow = new THREE.Color("#f71d64");
  const setMood = (m: Mood) => {
    const v = {
      off: { sun: 2.4, sunC: "#ffd2ac", hemi: 0.95, env: 0.45, ex: 0.95, stage: 0, neon: 0.7, spots: 0, a: "#555055", b: "#555055" },
      soft: { sun: 0.9, sunC: "#ffb996", hemi: 0.6, env: 0.3, ex: 1.0, stage: 28, neon: 0.85, spots: 0.3, a: "#ffc8b0", b: "#ffc8b0" },
      vivid: { sun: 0.2, sunC: "#c14ed4", hemi: 0.3, env: 0.16, ex: 1.05, stage: 95, neon: 1.0, spots: 0.8, a: "#f71d64", b: "#c14ed4" },
      rave: { sun: 0, sunC: "#5a4cff", hemi: 0.1, env: 0.06, ex: 1.05, stage: 70, neon: 1.0, spots: 0.7, a: "#7a3dff", b: "#f71d64" },
    }[m];
    sun.intensity = v.sun;
    sun.color.set(v.sunC);
    hemi.intensity = v.hemi;
    scene.environmentIntensity = v.env;
    fixtures[0].color.set(v.a);
    fixtures[1].color.set(v.b);
    const lensGain = m === "off" ? 1 : 1.1;
    lensBase[0].set(v.a).multiplyScalar(lensGain);
    lensBase[1].set(v.b).multiplyScalar(lensGain);
    lensMats[0].color.copy(lensBase[0]);
    lensMats[1].color.copy(lensBase[1]);
    for (const f of fixtures) f.intensity = v.stage;
    for (const n of neons) n.mat.color.copy(n.base).multiplyScalar(n.gain * v.neon);
    spotStrength = v.spots;
    lasers = m === "rave";
    for (const b of beams) b.visible = lasers;
    if (lasers) sweep(lastT);
    return v.ex;
  };

  return {
    picks,
    setMood,
    setSpin(on: boolean) {
      spin = on;
    },
    setHover(id: string | null) {
      hoverId = id;
    },
    cloneProduct(id: string) {
      const parts: THREE.Object3D[] = [];
      scene.traverse((o) => {
        if (o.userData.part === id && o.visible) parts.push(o);
      });
      if (!parts.length) return null;
      scene.updateMatrixWorld(true);
      const out = new THREE.Group();
      const flat = flatGeo[id];
      for (const o of parts) {
        const c = o.clone(true);
        const m4 = o.matrixWorld.clone();
        if (flat && (o as THREE.Mesh).isMesh) {
          (c as THREE.Mesh).geometry = flat();
          m4.identity();
        }
        c.traverse((n) => {
          const mesh = n as THREE.Mesh;
          if (!mesh.isMesh) return;
          const one = (m: THREE.Material) => {
            const k = m.clone();
            // the room's environment map belongs to the main renderer; the viewer lights these from its own
            if ("envMap" in k) (k as THREE.MeshStandardMaterial).envMap = null;
            return k;
          };
          mesh.material = Array.isArray(mesh.material) ? mesh.material.map(one) : one(mesh.material);
          mesh.castShadow = false;
          mesh.receiveShadow = false;
        });
        c.matrix.copy(m4);
        c.matrix.decompose(c.position, c.quaternion, c.scale);
        c.visible = true;
        out.add(c);
      }
      return out;
    },
    solo(id: string) {
      let parts: THREE.Object3D[] = [];
      scene.traverse((o) => {
        if (o.userData.part === id) parts.push(o);
      });
      const parent = parts[0].parent;
      parts = parts.filter((o) => o.parent === parent);
      scene.traverse((o) => {
        o.visible = false;
      });
      scene.visible = true;
      const flat = flatten[id];
      if (flat) flat();
      scene.updateMatrixWorld(true);
      const box = new THREE.Box3();
      for (const o of parts) {
        if (flat) {
          o.removeFromParent();
          scene.add(o);
        } else {
          scene.attach(o);
        }
        o.visible = true;
      }
      scene.updateMatrixWorld(true);
      for (const o of parts) box.expandByObject(o);
      return box;
    },
    update(t: number) {
      const dt = Math.min(0.1, t - lastT);
      lastT = t;
      if (spin) angle += dt * 0.55;
      ballMesh.rotation.y = angle;
      // hover feedback: the lens lights up, the ball brightens, both eased
      hLight += ((hoverId === "stage-light" ? 1 : 0) - hLight) * Math.min(1, dt * 10);
      hBall += ((hoverId === "disco-ball" ? 1 : 0) - hBall) * Math.min(1, dt * 10);
      hDj += ((hoverId === "dj-controller" ? 1 : 0) - hDj) * Math.min(1, dt * 10);
      for (const m of djMats) {
        // hovering lights the whole controller softly in the brand pink, on top of whatever it already emits
        m.emissive.copy(m.userData.baseEmissive).lerp(pinkGlow, hDj * 0.5);
        m.emissiveIntensity = (m.userData.baseEmissiveIntensity as number) + hDj * 0.35;
      }
      hLap += ((hoverId === "laptop" ? 1 : 0) - hLap) * Math.min(1, dt * 10);
      lapMat.color.setScalar(0.85 + hLap * 0.45);
      (lapGlow.material as THREE.SpriteMaterial).opacity = hLap * 0.5;
      lensMats.forEach((m, i) => m.color.copy(lensBase[i]).multiplyScalar(1 + hLight * 1.4));
      ballMat.emissiveIntensity = hBall * 0.12;
      for (const f of fixtureGlow) (f.material as THREE.SpriteMaterial).opacity = hLight * 0.75;
      (ballGlow.material as THREE.SpriteMaterial).opacity = hBall * 0.5;
      ballMat.envMapIntensity = 3.2 + hBall * 1.8;
      ball.position.y = 2.82 + Math.sin(t * 0.6) * 0.008;
      fixtures.forEach((f, i) => {
        // stage lights sway together with the spinning ball
        f.target.position.x = spin ? Math.sin(angle * 2.2 + i * 3) * 1.3 : 0;
      });
      if (lasers) sweep(t);
      throwSpots(angle, spotStrength);
    },
    dispose() {
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
      for (const d of disposables) d.dispose();
    },
  };
}
