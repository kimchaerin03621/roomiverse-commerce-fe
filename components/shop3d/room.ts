import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { PARTIES } from "@/content/parties";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

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
/** Plain daylight, then the six party scenes of the site (see content/parties.ts). */
export type Mood = "day" | "house" | "listening" | "dayparty" | "themed" | "rave" | "after";
export const MOODS: Mood[] = ["day", "house", "listening", "dayparty", "themed", "rave", "after"];
export const MOOD_LABEL: Record<Mood, string> = {
  day: "Daylight",
  house: "House Party",
  listening: "Listening Party",
  dayparty: "Day Party",
  themed: "Themed Party",
  rave: "Rave Party",
  after: "After Party",
};
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
  /** Turns the room lamps on or off. */
  toggleLamps: () => void;
  /** Switches one ceiling spotlight (0 = left, 1 = right) on or off. */
  toggleStage: (i: number) => void;
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


/**
 * Light weights of the baked groups per mood: sun/sky bounce, warm lamps, neon + LED strip, stage spots.
 * tp / ts re-colour the baked neon-strip and stage-spot light (tm = how far toward the tint, 0 keeps the baked pink and purple),
 * so every scene gets its own colour from the same four images (no extra download).
 */
type LmMood = { base: number; warm: number; party: number; stage: number; lamp: number; neon: number; tp: [number, number, number]; ts: [number, number, number]; tm: number };
const WHITE: [number, number, number] = [1, 1, 1];
const LM_MOOD: Record<Mood, LmMood> = {
  day: { base: 1.0, warm: 0.15, party: 0.15, stage: 0.1, lamp: 0.35, neon: 0.55, tp: WHITE, ts: WHITE, tm: 0 },
  house: { base: 0.08, warm: 0.7, party: 1.2, stage: 1.0, lamp: 0.8, neon: 1.0, tp: WHITE, ts: WHITE, tm: 0 },
  listening: { base: 0.2, warm: 1.0, party: 0.3, stage: 0.45, lamp: 1.0, neon: 0.6, tp: [1, 0.62, 0.3], ts: [1, 0.68, 0.38], tm: 0.85 },
  dayparty: { base: 0.62, warm: 0.45, party: 0.3, stage: 0.5, lamp: 0.5, neon: 0.7, tp: [1, 0.85, 0.45], ts: [1, 0.88, 0.55], tm: 0.85 },
  themed: { base: 0.06, warm: 0.35, party: 1.0, stage: 1.0, lamp: 0.5, neon: 1.0, tp: [1, 0.5, 0.12], ts: [0.2, 1, 0.65], tm: 0.8 },
  rave: { base: 0.03, warm: 0.15, party: 1.4, stage: 0.9, lamp: 0.25, neon: 1.0, tp: [0.55, 0.3, 1], ts: [0.3, 0.45, 1], tm: 0.65 },
  after: { base: 0.05, warm: 0.8, party: 0.5, stage: 0.3, lamp: 0.9, neon: 0.8, tp: [1, 0.35, 0.5], ts: [1, 0.5, 0.36], tm: 0.7 },
};
const LM_GAIN = 1.0;

/** Picks two party photos for the two frames, never the same pair as the last visit (kept in this browser only). */
function pickFramePhotos(): [string, string, string, string] {
  const imgs = PARTIES.map((p) => p.hero);
  let last = "";
  try {
    last = localStorage.getItem("roomi-frames") ?? "";
  } catch {}
  let a = 0;
  let b = 1;
  for (let t = 0; t < 12; t++) {
    a = Math.floor(Math.random() * imgs.length);
    b = (a + 1 + Math.floor(Math.random() * (imgs.length - 1))) % imgs.length;
    if (`${a},${b}` !== last && `${b},${a}` !== last) break;
  }
  try {
    localStorage.setItem("roomi-frames", `${a},${b}`);
  } catch {}
  // the two portrait frames on the right wall: detail shots from two other scenes
  const rest = PARTIES.map((_, i) => i).filter((i) => i !== a && i !== b).sort(() => Math.random() - 0.5);
  return [imgs[a], imgs[b], PARTIES[rest[0]].side, PARTIES[rest[1]].side];
}

function loadBackModule(scene: THREE.Scene, track: <T extends { dispose: () => void }>(o: T) => T, env: () => THREE.Texture | null) {
  const weights = { ...LM_MOOD.day };
  const uW = { value: new THREE.Vector4(1, 0, 0, 0) };
  const uTP = { value: new THREE.Vector3(1, 1, 1) };
  const uTS = { value: new THREE.Vector3(1, 1, 1) };
  const uTM = { value: 0 };
  const emitters: { mat: THREE.MeshBasicMaterial; base: THREE.Color; kind: "lamp" | "neon" }[] = [];
  const texLoader = new THREE.TextureLoader();
  const lmTex = (name: string) => {
    const t = texLoader.load(`/models/lm_${name}.webp`);
    t.flipY = false;
    t.colorSpace = THREE.NoColorSpace;
    t.channel = 1;
    t.minFilter = THREE.LinearFilter;
    t.generateMipmaps = false;
    return t;
  };
  const lms = { base: lmTex("base"), warm: lmTex("warm"), party: lmTex("party"), stage: lmTex("stage") };
  let lampsOn = true;
  let lampC = 1;
  let lampHover = 0;
  let scales = new THREE.Vector4(1, 1, 1, 1);
  fetch("/models/room-back-lm.json")
    .then((r) => r.json())
    .then((j) => scales.set(j.base, j.warm, j.party, j.stage))
    .catch(() => {});
  const uScale = { value: scales };

  const bakedMat = (src: THREE.MeshStandardMaterial) => {
    const m = new THREE.MeshBasicMaterial({ map: src.map, color: src.color, lightMap: lms.base, lightMapIntensity: Math.PI * LM_GAIN });
    m.onBeforeCompile = (sh) => {
      sh.uniforms.lmWarm = { value: lms.warm };
      sh.uniforms.lmParty = { value: lms.party };
      sh.uniforms.lmStage = { value: lms.stage };
      sh.uniforms.lmW = uW;
      sh.uniforms.lmTP = uTP;
      sh.uniforms.lmTS = uTS;
      sh.uniforms.lmTM = uTM;
      sh.uniforms.lmS = uScale;
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <lightmap_pars_fragment>", "#include <lightmap_pars_fragment>\nuniform sampler2D lmWarm;\nuniform sampler2D lmParty;\nuniform sampler2D lmStage;\nuniform vec4 lmW;\nuniform vec4 lmS;\nuniform vec3 lmTP;\nuniform vec3 lmTS;\nuniform float lmTM;")
        .replace(
          "vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );",
          `vec3 lmA = pow(texture2D( lightMap, vLightMapUv ).rgb, vec3(2.2)) * lmS.x * lmW.x;
          lmA += pow(texture2D( lmWarm, vLightMapUv ).rgb, vec3(2.2)) * lmS.y * lmW.y;
          vec3 lmP = pow(texture2D( lmParty, vLightMapUv ).rgb, vec3(2.2)) * lmS.z;
          vec3 lmG = pow(texture2D( lmStage, vLightMapUv ).rgb, vec3(2.2)) * lmS.w;
          lmP = mix(lmP, dot(lmP, vec3(0.299, 0.587, 0.114)) * lmTP * 1.6, lmTM);
          lmG = mix(lmG, dot(lmG, vec3(0.299, 0.587, 0.114)) * lmTS * 1.6, lmTM);
          lmA += lmP * lmW.z + lmG * lmW.w;
          vec4 lightMapTexel = vec4(lmA, 1.0);`,
        );
    };
    m.customProgramCacheKey = () => "roomi-baked";
    return m;
  };

  let neonMesh: THREE.Mesh | null = null;
  let glow: THREE.Mesh | null = null;
  const root = new THREE.Group();
  root.position.y = 0;
  scene.add(root);
  const draco = new DRACOLoader().setDecoderPath("/draco/");
  const loader = new GLTFLoader().setDRACOLoader(draco);
  loader.load("/models/room-back.glb", (gltf) => {
    draco.dispose();
    const photos = pickFramePhotos();
    gltf.scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const src = mesh.material as THREE.MeshStandardMaterial;
      mesh.castShadow = mesh.receiveShadow = false;
      const n = mesh.name;
      if (n.startsWith("E_") || src.name.startsWith("E_")) {
        const neon = /neon|led/i.test(src.name + n) || n === "Text";
        const base = new THREE.Color(neon ? (/led/i.test(src.name + n) ? "#ff3d8a" : "#ff2f7e") : "#ffa24d");
        const m = track(new THREE.MeshBasicMaterial({ color: base, vertexColors: !!mesh.geometry.attributes.color }));
        mesh.material = m;
        emitters.push({ mat: m, base, kind: neon ? "neon" : "lamp" });
        if (/neon/i.test(src.name + n) || n === "Text") neonMesh = mesh;
      } else if (n.startsWith("P_pic")) {
        const m = track(new THREE.MeshBasicMaterial({ color: "#ffffff" }));
        mesh.material = m;
        const url = photos["abcd".indexOf(n.slice(-1))];
        const geo = mesh.geometry;
        geo.computeBoundingBox();
        const bb = geo.boundingBox!;
        // wall frames lie in the x/y plane, the right-wall ones in the z/y plane (viewed from inside the room, u grows with +z)
        const sideWall = bb.max.x - bb.min.x < bb.max.z - bb.min.z;
        const ax: "x" | "z" = sideWall ? "z" : "x";
        const pw = bb.max[ax] - bb.min[ax];
        const ph = bb.max.y - bb.min.y;
        const pos = geo.attributes.position;
        const uv = geo.attributes.uv;
        texLoader.load(url, (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          t.flipY = false;
          t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
          // "cover" crop: planar uv from the picture's own size, centred on the photo
          const ia = t.image.width / t.image.height;
          const pa = pw / ph;
          const su = ia > pa ? pa / ia : 1;
          const sv = ia > pa ? 1 : ia / pa;
          for (let i = 0; i < pos.count; i++) {
            const u = ((sideWall ? pos.getZ(i) : pos.getX(i)) - bb.min[ax]) / pw;
            const v = 1 - (pos.getY(i) - bb.min.y) / ph;
            uv.setXY(i, 0.5 + (u - 0.5) * su, 0.5 + (v - 0.5) * sv);
          }
          uv.needsUpdate = true;
          m.map = t;
          m.needsUpdate = true;
        });
      } else if (n.startsWith("M_")) {
        // convex mirror: the room's warm light, floor and ceiling are painted into the reflection so it reads as a round bulging mirror
        const mc = document.createElement("canvas");
        mc.width = mc.height = 256;
        const mg = mc.getContext("2d")!;
        const lin = mg.createLinearGradient(0, 0, 0, 256);
        lin.addColorStop(0, "#f4efe8");
        lin.addColorStop(0.5, "#cfc8c4");
        lin.addColorStop(1, "#8a6040");
        mg.fillStyle = lin;
        mg.fillRect(0, 0, 256, 256);
        const rad = mg.createRadialGradient(90, 80, 4, 128, 128, 140);
        rad.addColorStop(0, "rgba(255,255,255,0.95)");
        rad.addColorStop(0.25, "rgba(255,255,255,0.1)");
        rad.addColorStop(1, "rgba(30,20,20,0.55)");
        mg.fillStyle = rad;
        mg.fillRect(0, 0, 256, 256);
        const mt = track(new THREE.CanvasTexture(mc));
        mt.colorSpace = THREE.SRGBColorSpace;
        mesh.material = track(new THREE.MeshStandardMaterial({ color: "#ffffff", map: mt, roughness: 0.08, metalness: 0.9, envMap: env(), envMapIntensity: 1.6 }));
        const mgeo = mesh.geometry;
        mgeo.computeBoundingBox();
        const mb = mgeo.boundingBox!;
        const mp = mgeo.attributes.position;
        const muv = mgeo.attributes.uv;
        for (let i = 0; i < mp.count; i++) muv.setXY(i, (mp.getX(i) - mb.min.x) / (mb.max.x - mb.min.x), 1 - (mp.getY(i) - mb.min.y) / (mb.max.y - mb.min.y));
        muv.needsUpdate = true;
      } else {
        mesh.material = track(bakedMat(src));
      }
    });
    root.add(gltf.scene);
    if (neonMesh) {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const g = c.getContext("2d")!;
      const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64);
      gr.addColorStop(0, "rgba(255,24,110,0.5)");
      gr.addColorStop(0.55, "rgba(255,24,110,0.22)");
      gr.addColorStop(1, "rgba(255,24,110,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 128, 128);
      // A flat plane lying on the wall, not a camera-facing sprite: a sprite is cut off by the wall when seen from the side.
      // Normal blending: an additive pink over the green wall turns grey.
      const gl = new THREE.Mesh(
        track(new THREE.PlaneGeometry(2.9, 1.2)),
        track(new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), depthWrite: false, transparent: true, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })),
      );
      gl.position.set(0, 2.22, -4.357);
      gl.renderOrder = 1;
      root.add(gl);
      glow = gl;
    }
    apply();
  });

  // the neon stutters for a moment every ten seconds or so, like a tube that is not quite settled
  let flick = 1;
  let clock = 0;
  let nextFlick = 4;
  const apply = () => {
    uW.value.set(weights.base, weights.warm * lampC, weights.party, weights.stage);
    uTP.value.set(weights.tp[0], weights.tp[1], weights.tp[2]);
    uTS.value.set(weights.ts[0], weights.ts[1], weights.ts[2]);
    uTM.value = weights.tm;
    if (glow) (glow.material as THREE.MeshBasicMaterial).opacity = (0.25 + 0.75 * weights.neon) * flick;
    for (const e of emitters) e.mat.color.copy(e.base).multiplyScalar(e.kind === "lamp" ? (0.4 + 0.9 * weights.lamp) * (0.08 + 0.92 * lampC) * (1 + lampHover * 0.5) : (0.35 + 0.9 * weights.neon) * flick);
  };
  return {
    root,
    setMood(m: Mood) {
      Object.assign(weights, LM_MOOD[m]);
      apply();
    },
    toggleLamps() {
      lampsOn = !lampsOn;
    },
    /** Eases the lamps toward on/off (about 0.8 s) and lights them a little while the pointer is over one. */
    tick(dt: number, hovering: boolean) {
      clock += dt;
      let f = 1;
      if (clock >= nextFlick) {
        const k = clock - nextFlick;
        if (k < 0.5) f = Math.sin(k * 40) > 0.15 ? 1 : 0.18;
        else nextFlick = clock + 7 + Math.random() * 7;
      }
      const flickChanged = f !== flick;
      flick = f;
      const target = lampsOn ? 1 : 0;
      const hv = hovering ? 1 : 0;
      if (Math.abs(target - lampC) < 0.002 && Math.abs(hv - lampHover) < 0.01) {
        if (flickChanged) apply();
        return;
      }
      lampC += (target - lampC) * Math.min(1, dt * 4);
      lampHover += (hv - lampHover) * Math.min(1, dt * 10);
      apply();
    },
  };
}


/**
 * Folds the many small, never-moving props that share a look (same material values, same part of the room) into one mesh each.
 * Fewer draw calls is what older laptops need most. Products (anything tagged with userData.part), pick targets, glows, moving
 * or mood-tinted parts are left alone; the originals stay in the scene, only hidden, so cloning for the zoom viewer still works.
 */
function mergeStatic(scene: THREE.Scene, skipObjs: THREE.Object3D[], skipMats: Set<THREE.Material>) {
  scene.updateMatrixWorld(true);
  const tex = (t: THREE.Texture | null | undefined) => (t ? t.uuid : "-");
  const buckets = new Map<string, { mat: THREE.Material; items: THREE.Mesh[] }>();
  const blocked = (o: THREE.Object3D) => {
    for (let p: THREE.Object3D | null = o; p; p = p.parent) {
      if (!p.visible || p.userData.part || p.userData.noMerge || skipObjs.includes(p)) return true;
    }
    return false;
  };
  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || (m as unknown as THREE.InstancedMesh).isInstancedMesh || blocked(m)) return;
    const mat = m.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[];
    if (Array.isArray(mat) || !(mat as THREE.MeshStandardMaterial).isMeshStandardMaterial || skipMats.has(mat) || mat.transparent || !mat.visible) return;
    const g = m.geometry;
    if (!g.attributes.position || !g.attributes.normal || !g.attributes.uv || g.userData.own) return;
    let top: THREE.Object3D = m;
    while (top.parent && top.parent !== scene) top = top.parent;
    const phys = mat as THREE.MeshPhysicalMaterial;
    const key = [
      top.uuid, mat.type, mat.color.getHexString(), mat.roughness, mat.metalness, mat.emissive.getHexString(), mat.emissiveIntensity,
      mat.side, tex(mat.map), tex(mat.normalMap), tex(mat.roughnessMap), tex(mat.envMap), mat.envMapIntensity, mat.normalScale.x,
      phys.clearcoat ?? 0, phys.sheen ?? 0, m.castShadow, m.receiveShadow,
    ].join("|");
    const b = buckets.get(key);
    if (b) b.items.push(m);
    else buckets.set(key, { mat, items: [m] });
  });
  let merged = 0;
  for (const { mat, items } of buckets.values()) {
    if (items.length < 2) continue;
    const geos = items.map((m) => {
      const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
      g.applyMatrix4(m.matrixWorld);
      for (const k of Object.keys(g.attributes)) if (k !== "position" && k !== "normal" && k !== "uv") g.deleteAttribute(k);
      return g;
    });
    const big = mergeGeometries(geos, false);
    geos.forEach((g) => g.dispose());
    if (!big) continue;
    const mesh = new THREE.Mesh(big, mat);
    mesh.castShadow = items[0].castShadow;
    mesh.receiveShadow = items[0].receiveShadow;
    mesh.name = "merged";
    scene.add(mesh);
    for (const m of items) {
      m.visible = false;
      // a hidden original never moves again: keep it out of the per-frame matrix update (thousands of nodes add up on slow laptops)
      m.matrixAutoUpdate = false;
      m.matrixWorldAutoUpdate = false;
    }
    merged += items.length;
  }
  return merged;
}

export function buildRoom(scene: THREE.Scene): Room {
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(o: T): T => {
    disposables.push(o);
    return o;
  };

  const picks: Pick[] = [];
  const balloonPivots: THREE.Group[] = [];
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
  /** A material whose colour map is drawn on a small canvas (paper patterns, labels, icing...). */
  const paint = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, rough = 0.8, metal = 0) => {
    const { c, g } = canvas(w, h);
    draw(g);
    return track(new THREE.MeshStandardMaterial({ map: tex(c), roughness: rough, metalness: metal }));
  };
  /** Turns a height drawing (light = high) into a normal map, so stitching and weave catch the light. */
  const normalFromHeight = (src: HTMLCanvasElement, strength = 2.2) => {
    const w = src.width;
    const h = src.height;
    const d = src.getContext("2d")!.getImageData(0, 0, w, h).data;
    const out = canvas(w, h);
    const img = out.g.createImageData(w, h);
    const H = (x: number, y: number) => d[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = (H(x + 1, y) - H(x - 1, y)) * strength;
        const dy = (H(x, y + 1) - H(x, y - 1)) * strength;
        const l = Math.hypot(dx, dy, 1);
        const i = (y * w + x) * 4;
        img.data[i] = ((-dx / l) * 0.5 + 0.5) * 255;
        img.data[i + 1] = ((dy / l) * 0.5 + 0.5) * 255;
        img.data[i + 2] = ((1 / l) * 0.5 + 0.5) * 255;
        img.data[i + 3] = 255;
      }
    }
    out.g.putImageData(img, 0, 0);
    const t = track(new THREE.CanvasTexture(out.c));
    t.anisotropy = 8;
    return t;
  };
  /** A rounded-rectangle slab (w x d on the ground plane, h tall, bevelled edges), uv spread 0..1 over the top, base sitting on y = 0. */
  const roundedSlab = (w: number, d: number, h: number, r: number, bevel = 0.0014) => {
    const sh = new THREE.Shape();
    const x0 = -w / 2;
    const y0 = -d / 2;
    sh.moveTo(x0 + r, y0);
    sh.lineTo(-x0 - r, y0);
    sh.quadraticCurveTo(-x0, y0, -x0, y0 + r);
    sh.lineTo(-x0, -y0 - r);
    sh.quadraticCurveTo(-x0, -y0, -x0 - r, -y0);
    sh.lineTo(x0 + r, -y0);
    sh.quadraticCurveTo(x0, -y0, x0, -y0 - r);
    sh.lineTo(x0, y0 + r);
    sh.quadraticCurveTo(x0, y0, x0 + r, y0);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: h - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 10 });
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + d / 2) / d);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, bevel, 0);
    geo.computeVertexNormals();
    return geo;
  };

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
  /** Photographic PBR material from /shop3d/mat/{base}_color|normal|rough.jpg (ambientCG, CC0). `rot` turns the grain. */
  const photoMat = (
    base: string,
    o: { repeat?: [number, number]; rot?: number; tint?: THREE.ColorRepresentation; normal?: number; rough?: number; sheen?: string; clearcoat?: number } = {},
  ) => {
    const mk = (suffix: string, srgb: boolean) => {
      const t = track(loader.load(`/shop3d/mat/${base}_${suffix}.jpg`));
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = 8;
      t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      if (o.rot) {
        t.center.set(0.5, 0.5);
        t.rotation = o.rot;
      }
      t.repeat.set(o.repeat?.[0] ?? 1, o.repeat?.[1] ?? 1);
      return t;
    };
    const m = new THREE.MeshPhysicalMaterial({
      map: mk("color", true),
      normalMap: mk("normal", false),
      roughnessMap: mk("rough", false),
      color: o.tint ?? 0xffffff,
      roughness: o.rough ?? 1,
      normalScale: new THREE.Vector2(o.normal ?? 1, o.normal ?? 1),
      clearcoat: o.clearcoat ?? 0,
      clearcoatRoughness: 0.4,
    });
    if (o.sheen) {
      m.sheen = 1;
      m.sheenColor = new THREE.Color(o.sheen);
      m.sheenRoughness = 0.45;
    }
    return track(m);
  };
  /** Rescales a box's UVs to its real size, so a photo keeps the same scale on big and small faces (`tile` = metres per picture). */
  const tileBox = (m: THREE.Mesh, w: number, h: number, d: number, tile: number) => {
    const uv = m.geometry.attributes.uv;
    const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) {
      for (let v = 0; v < 4; v++) {
        const i = f * 4 + v;
        uv.setXY(i, (uv.getX(i) * dims[f][0]) / tile, (uv.getY(i) * dims[f][1]) / tile);
      }
    }
    uv.needsUpdate = true;
    return m;
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
  floor.visible = false; // replaced by the baked wood floor
  box(W * 2 + 0.8, H, 0.2, concrete([2, 1]), 0, H / 2, Z0 - 0.1).visible = false;
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
    // old container wall, rails and posts: hidden, the baked cream walls replace them
    for (const m of [
      box(0.2, H, L + 0.4, corr, sx * (W + 0.1), H / 2, cz),
      box(0.1, 0.16, L, steel, sx * (W - 0.05), H - 0.08, cz),
      box(0.08, 0.14, L, steel, sx * (W - 0.04), 0.07, cz),
      box(0.14, H, 0.14, steel, sx * (W - 0.07), H / 2, Z0 + 0.07),
      box(0.14, H, 0.14, steel, sx * (W - 0.07), H / 2, Z1 - 0.07),
    ])
      m.visible = false;
  }
  box(W * 2 + 0.8, 0.2, L + 0.4, std("#0f0d12", 0.9), 0, H + 0.1, cz).visible = false;
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
    sign.visible = false; // the new back-wall module carries its own neon sign
  }

  const fixtures: THREE.SpotLight[] = [];
  const lensMats: THREE.MeshBasicMaterial[] = [];
  const fixturePos: THREE.Vector3[] = [];
  const fixtureGlow: THREE.Sprite[] = [];
  const fixtureGroups: THREE.Group[] = [];
  const beamMats: THREE.ShaderMaterial[] = [];
  // A visible cone of light from each ceiling spot, so it is obvious the glow comes from there (and that it can be touched).
  const BEAM_L = 4.2;
  const coneGeo = track(new THREE.ConeGeometry(0.95, BEAM_L, 28, 1, true));
  for (const [sx, col] of [[-1, "#f71d64"], [1, "#c14ed4"]] as const) {
    const g = new THREE.Group();
    g.position.set(sx * 3.05, 3.0, -3.6);
    scene.add(g);
    {
      // fixed mount: a rod from the ceiling down to a swivel ball; the can turns about that ball
      const mount = std("#222", 0.5, 0.6);
      cyl(0.014, 0.014, 0.3, mount, sx * 3.05, 3.15, -3.6, scene, 8).castShadow = false;
      add(new THREE.SphereGeometry(0.045, 14, 10), mount, sx * 3.05, 3.0, -3.6, scene, false);
      cyl(0.07, 0.07, 0.012, mount, sx * 3.05, 3.295, -3.6, scene, 16).castShadow = false;
    }
    const can = cyl(0.15, 0.17, 0.4, std("#1a1618", 0.4, 0.5), 0, 0, 0, g, 20);
    const lensMat = track(new THREE.MeshBasicMaterial({ color: col }));
    lensMats.push(lensMat);
    const lens = cyl(0.14, 0.14, 0.02, lensMat, 0, -0.21, 0, g, 20);
    hitBox(0.7, 0.7, 0.7, 0, 0, 0, g, sx < 0 ? "stage-light-0" : "stage-light-1");
    fixtureGlow.push(addGlow(g, 0, -0.1, 0, 1.3));
    fixturePos.push(g.position.clone());
    g.lookAt(0, 0.9, -3.0);
    g.rotateX(-Math.PI / 2);
    can.castShadow = lens.castShadow = false;
    {
      const bm = track(
        new THREE.ShaderMaterial({
          uniforms: { uColor: { value: new THREE.Color(col) }, uI: { value: 0 } },
          vertexShader: `
            varying float vFade;
            varying vec3 vN;
            varying vec3 vP;
            void main() {
              vFade = uv.y;                       // 1 at the lamp, 0 at the far end
              vN = normalize(normalMatrix * normal);
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              vP = -mv.xyz;
              gl_Position = projectionMatrix * mv;
            }`,
          fragmentShader: `
            uniform vec3 uColor;
            uniform float uI;
            varying float vFade;
            varying vec3 vN;
            varying vec3 vP;
            void main() {
              float edge = pow(abs(dot(normalize(vN), normalize(vP))), 0.9);   // soft sides
              float a = pow(vFade, 1.1) * edge * uI * 1.9;
              gl_FragColor = linearToOutputTexel(vec4(uColor, a));
            }`,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide, // only the far inside wall of the cone: half the pixels of drawing both faces
          toneMapped: false,
        }),
      );
      const beam = new THREE.Mesh(coneGeo, bm);
      beam.position.set(0, -0.22 - BEAM_L / 2, 0);
      beam.frustumCulled = false;
      beam.renderOrder = 1;
      g.add(beam);
      beamMats.push(bm);
      fixtureGroups.push(g);
    }
    const spot = new THREE.SpotLight(col, 0, 12, 0.5, 0.65, 1.6);
    spot.position.copy(g.position);
    spot.target.position.set(0, 0.8, -3.0);
    scene.add(spot, spot.target);
    fixtures.push(spot);
  }

  const ball = new THREE.Group();
  ball.position.set(0, 2.9, -3.2);
  ball.scale.setScalar(1.15);
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
  hitBox(1.8, 0.75, 0.25, 0, 2.22, -4.2, scene, "mood"); // the neon sign: click to change the light mood
  const ballGlow = addGlow(ball, 0, 0, -0.25, 1.5);
  (ballGlow.material as THREE.SpriteMaterial).depthTest = true; // halo stays behind the ball
  scene.add(ball);

  // ---------- DJ booth ----------
  const djMats: THREE.MeshStandardMaterial[] = [];
  {
    const g = new THREE.Group();
    g.position.set(0, 0, -3.0);
    const walnut = photoMat("walnut_dark", { rot: Math.PI / 2, rough: 0.95, normal: 1.2 });
    tileBox(box(3.2, 0.92, 0.8, walnut, 0, 0.46, 0, g), 3.2, 0.92, 0.8, 1.7);
    // fluted front: slim vertical slats above the neon strip
    const flute = photoMat("walnut_dark", { rot: Math.PI / 2, tint: "#e8d2c2", rough: 0.85, normal: 1.4, clearcoat: 0.15 });
    for (let i = 0; i < 31; i++) tileBox(box(0.062, 0.66, 0.026, flute, -1.5 + i * 0.1, 0.55, 0.409, g), 0.062, 0.66, 0.026, 1.6);
    tileBox(box(3.28, 0.05, 0.88, photoMat("terrazzo_grey", { rough: 0.7, normal: 0.6, clearcoat: 0.6 }), 0, 0.945, 0, g), 3.28, 0.05, 0.88, 0.45);
    box(3.24, 0.014, 0.84, brass(), 0, 0.915, 0, g);
    box(3.0, 0.016, 0.016, neonMat("#ff3d8a", 1.2), 0, 0.12, 0.405, g).castShadow = false;
    for (const c of g.children) c.visible = false; // old booth: the baked shelf module replaces it, only the controller stays
    const dark = std("#1a1618", 0.4, 0.3);
    // Stand-in controller, replaced by the real model (public/models/dj-controller.glb) as soon as it has loaded.
    const standIn = new THREE.Group();
    standIn.userData.noMerge = true; // it is removed when the real model loads, so it must not be merged into a copy that stays behind
    g.add(standIn);
    rbox(0.78, 0.05, 0.42, 0.012, dark, 0, 1.0, 0.02, standIn);
    for (const x of [-0.22, 0.22]) {
      cyl(0.1, 0.1, 0.018, std("#2c2630", 0.3, 0.6), x, 1.035, 0.03, standIn, 32);
      cyl(0.032, 0.032, 0.02, neonMat("#f71d64", 1), x, 1.04, 0.03, standIn, 20);
    }
    // click target sized to the real model (opened case, scaled up so it reads from across the room)
    const DJ_SCALE = 1.85;
    const SHELF_TOP = 0.78; // top of the baked LP shelf
    const SHELF_Z = -4.0 - g.position.z;
    hitBox(1.17, 0.5, 0.92, 0, SHELF_TOP + 0.25, SHELF_Z, g, "dj-controller");
    new GLTFLoader().setDRACOLoader(new DRACOLoader().setDecoderPath("/draco/")).load("/models/dj-controller-lite.glb", (gltf) => {
      const model = gltf.scene;
      model.scale.setScalar(DJ_SCALE);
      // sits on a baked wooden riser (from the Blender module) that tilts it toward the room, so the decks are not hidden by the case rim
      model.rotation.x = 0.3;
      model.position.set(0, SHELF_TOP + 0.14, SHELF_Z);
      model.userData.part = "dj-controller";
      model.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        m.castShadow = true;
        m.receiveShadow = true;
        const mat = m.material as THREE.MeshStandardMaterial;
        mat.envMap = scene.environment;
        mat.side = THREE.DoubleSide;
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
      rbox(0.55, 1.2, 0.46, 0.025, photoMat("speaker_cloth", { repeat: [1.6, 3.2], tint: "#3a343f", normal: 1.2 }), 0, 0.6, 0, sp);
      for (const [y, r] of [[0.42, 0.17], [0.9, 0.075]] as const) {
        cyl(r + 0.03, r + 0.03, 0.03, std("#0b090c", 0.7), 0, y, 0.235, sp, 36).rotation.x = Math.PI / 2;
        cyl(r, r * 0.8, 0.03, std("#2a252c", 0.4, 0.3), 0, y, 0.245, sp, 36).rotation.x = Math.PI / 2;
        add(new THREE.TorusGeometry(r * 0.8, r * 0.1, 8, 36), std("#0b090c", 0.9), 0, y, 0.262, sp);
        add(new THREE.SphereGeometry(r * 0.34, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), std("#34303a", 0.35, 0.4), 0, y, 0.256, sp).rotation.x = Math.PI / 2;
      }
      sp.visible = false;
      scene.add(sp);
    }
  }

  // ---------- Baked back-wall module (Blender): shelf, speakers, lamps, neon, frames ----------
  const moduleHooks = loadBackModule(scene, track, () => scene.environment);
  // the lamps are switches: a click turns them on or off
  hitBox(0.42, 0.34, 0.42, -1.2, 0.93, -4.0, scene, "lamp"); // dome lamp on the shelf
  hitBox(0.55, 0.5, 0.5, -2.7, 1.62, -3.85, scene, "lamp"); // floor lamp heads
  hitBox(0.4, 0.5, 0.4, 3.5, 1.82, -2.5, scene, "lamp"); // lamp on the right-wall ledge

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
    rug.visible = false; // replaced by the woven wool rug baked in the Blender module
  }

  // ---------- Left wall: sofa with the goods on it ----------
  {
    const g = new THREE.Group();
    g.position.set(-W + 0.7, 0, -1.3);
    g.rotation.y = Math.PI / 2;
    const velvet = photoMat("velvet", { repeat: [3.2, 2], tint: "#6a3fa3", sheen: "#c9a2ee", normal: 1.1 });
    const velvetL = photoMat("velvet", { repeat: [2.6, 2], tint: "#7646b3", sheen: "#d4aef2", normal: 1.1 });
    rbox(2.5, 0.36, 1.0, 0.09, velvet, 0, 0.25, 0, g);
    for (const x of [-0.6, 0.6]) rbox(1.15, 0.22, 0.84, 0.1, velvetL, x, 0.52, 0.06, g);
    for (const x of [-0.6, 0.6]) rbox(1.15, 0.52, 0.28, 0.11, velvetL, x, 0.84, -0.34, g).rotation.x = -0.14;
    for (const x of [-1.24, 1.24]) rbox(0.24, 0.64, 1.0, 0.09, velvet, x, 0.5, 0, g);
    const legWood = photoMat("wood_warm", { rot: Math.PI / 2, rough: 0.8, clearcoat: 0.2 });
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
    for (const c of g.children) c.visible = false; // the baked sofa from the Blender module replaces the body
    // throw pillow against the left arm
    {
      const pil = rbox(0.34, 0.34, 0.12, 0.05, photoMat("velvet", { repeat: [1.4, 1.4], tint: "#ffc9ae", sheen: "#fff0e6", normal: 1.1 }), -0.98, 0.84, -0.1, g);
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
      const twillTex = (() => {
        const { c, g } = canvas(128, 128);
        g.fillStyle = "#ffffff";
        g.fillRect(0, 0, 128, 128);
        g.strokeStyle = "rgba(120,20,60,0.32)";
        g.lineWidth = 2;
        for (let i = -128; i < 256; i += 6) {
          g.beginPath();
          g.moveTo(i, 0);
          g.lineTo(i + 128, 128);
          g.stroke();
        }
        const t = tex(c);
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(9, 9);
        return t;
      })();
      // the crown's pattern is painted, not modelled: twill, six seams with topstitching, four eyelets. u runs round the crown (the front is u = 0.25), v from the rim (0) up to the button (1)
      const crownTex = (() => {
        const W = 1024;
        const H = 512;
        const { c, g } = canvas(W, H);
        g.fillStyle = "#f6196a";
        g.fillRect(0, 0, W, H);
        g.strokeStyle = "rgba(120,20,60,0.28)";
        g.lineWidth = 2;
        for (let i = -H; i < W + H; i += 7) {
          g.beginPath();
          g.moveTo(i, 0);
          g.lineTo(i + H, H);
          g.stroke();
        }
        for (let k = 0; k < 6; k++) {
          const x = (0.25 + k / 6) * W;
          g.fillStyle = "rgba(150,10,60,0.55)";
          g.fillRect(x - 3, 0, 6, H);
          g.fillStyle = "rgba(255,225,235,0.9)";
          for (const d of [-13, 13]) {
            for (let y = 0; y < H; y += 12) g.fillRect(x + d - 1.5, y, 3, 7);
          }
        }
        for (const th of [Math.PI / 2, (5 * Math.PI) / 6, (7 * Math.PI) / 6, (3 * Math.PI) / 2]) {
          const x = (0.25 + th / (2 * Math.PI)) * W;
          const y = (1 - 0.605) * H;
          g.fillStyle = "#a80f47";
          g.beginPath();
          g.ellipse(x, y, 11, 11, 0, 0, 7);
          g.fill();
          g.fillStyle = "#3a0518";
          g.beginPath();
          g.ellipse(x, y, 4, 4, 0, 0, 7);
          g.fill();
        }
        const t = tex(c);
        t.wrapS = THREE.RepeatWrapping;
        return t;
      })();
      const capMat = fabric("#ffffff", [14, 14], 0.78);
      capMat.map = crownTex;
      capMat.normalScale.set(1.25, 1.25);
      const seamMat = std("#d3135a", 0.85);
      const part = <T extends THREE.Object3D>(o: T) => tag(o, "cap");
      // crown: each of the six panels bulges a little, the seams sink in between them
      const crownGeo = new THREE.SphereGeometry(R, 72, 36, 0, Math.PI * 2, 0, Math.PI / 2);
      {
        const cp = crownGeo.attributes.position;
        for (let i = 0; i < cp.count; i++) {
          const x = cp.getX(i);
          const y = cp.getY(i);
          const z = cp.getZ(i);
          const lat = Math.hypot(x, z) / R;
          const th = Math.atan2(x, z);
          const bulge = Math.pow(Math.abs(Math.sin(3 * th)), 0.5);
          const f = 1 - 0.008 * (1 - bulge) * Math.min(1, lat * 2.2);
          cp.setXYZ(i, x * f, y * (0.5 + 0.5 * f), z * f);
        }
        crownGeo.computeVertexNormals();
      }
      part(add(crownGeo, capMat, 0, 0, 0, cg)).scale.set(1, SY, 1);
      // lining and sweatband, seen from below and where the brim lifts
      add(new THREE.SphereGeometry(R * 0.97, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), track(new THREE.MeshStandardMaterial({ color: "#8c0f3a", roughness: 0.95, side: THREE.BackSide })), 0, -0.002, 0, cg, false).scale.set(1, SY, 1);
      part(add(new THREE.CylinderGeometry(R * 0.93, R * 0.93, 0.024, 56, 1, true), track(new THREE.MeshStandardMaterial({ color: "#f3e9df", roughness: 0.9, side: THREE.DoubleSide })), 0, 0.011, 0, cg, false));
      // button
      part(add(new THREE.SphereGeometry(0.0125, 16, 10), capMat, 0, R * SY + 0.0015, 0, cg, false)).scale.y = 0.7;
      // brim: its back edge hugs the crown's bottom circle, the front is a rounded visor, bent down at the sides
      {
        const XE = 0.108;
        const yb = (x: number) => Math.sqrt(Math.max(R * R - x * x, 0)) - 0.014;
        const sh = new THREE.Shape();
        sh.moveTo(-XE, yb(-XE));
        sh.bezierCurveTo(-0.118, 0.175, -0.06, 0.226, 0, 0.226);
        sh.bezierCurveTo(0.06, 0.226, 0.118, 0.175, XE, yb(XE));
        for (let i = 1; i <= 24; i++) {
          const x = XE - (i / 24) * 2 * XE;
          sh.lineTo(x, yb(x));
        }
        const bend = (x: number) => 1.3 * x * x;
        const place = new THREE.Matrix4().makeTranslation(0, 0.012, 0).multiply(new THREE.Matrix4().makeRotationX(0.07));
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
        const topMat = fabric("#f6196a", [6, 6], 0.78);
        topMat.map = twillTex;
        topMat.normalScale.set(1.2, 1.2);
        topMat.side = THREE.DoubleSide;
        const underMat = std("#c4124f", 0.85);
        underMat.side = THREE.DoubleSide;
        part(add(sheet(0), topMat, 0, 0, 0, cg));
        part(add(sheet(-0.0035), underMat, 0, 0, 0, cg, false));
        const edge = sh.getPoints(60).map((p) => new THREE.Vector3(p.x, -bend(p.x) - 0.00175, p.y).applyMatrix4(place));
        part(add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(edge, true), 200, 0.0034, 8, true), seamMat, 0, 0, 0, cg, false));
      }
      // back strap: a thin curved band that follows the crown (it used to be a flat box whose ends hung in the air)
      part(add(new THREE.CylinderGeometry(R * 0.962 * 1.004, R * 0.962 * 1.004, 0.016, 24, 1, true, Math.PI - 0.62, 1.24), std("#e0145f", 0.8), 0, 0.03, 0, cg, false)).material.side = THREE.DoubleSide;
      // front mark on the crown, following its slope: satin-stitch embroidery (diagonal thread, raised outline)
      {
        const cv = canvas(512, 224);
        const hv = canvas(512, 224);
        const draw = () => {
          const g1 = cv.g;
          const g2 = hv.g;
          g1.clearRect(0, 0, 512, 224);
          g2.fillStyle = "#000";
          g2.fillRect(0, 0, 512, 224);
          const txt = (ctx: CanvasRenderingContext2D, stroke: boolean) => {
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = '900 150px "Pretendard Variable", "Arial Black", sans-serif';
            if (stroke) {
              ctx.lineJoin = "round";
              ctx.lineWidth = 12;
              ctx.strokeText("ROOMi", 256, 112);
            } else ctx.fillText("ROOMi", 256, 112);
          };
          g1.save();
          g1.strokeStyle = "#c4124f";
          txt(g1, true);
          g1.fillStyle = "#fff3f7";
          txt(g1, false);
          g1.globalCompositeOperation = "source-atop";
          for (let i = -224; i < 512; i += 5) {
            g1.strokeStyle = (i / 5) % 2 === 0 ? "rgba(255,255,255,0.0)" : "rgba(150,150,170,0.38)";
            g1.lineWidth = 2;
            g1.beginPath();
            g1.moveTo(i, 224);
            g1.lineTo(i + 224, 0);
            g1.stroke();
          }
          g1.restore();
          g2.save();
          g2.fillStyle = "#fff";
          g2.strokeStyle = "#888";
          txt(g2, true);
          txt(g2, false);
          g2.restore();
        };
        draw();
        const tt = tex(cv.c);
        const bump = track(new THREE.CanvasTexture(hv.c));
        document.fonts?.ready.then(() => {
          draw();
          tt.needsUpdate = true;
          bump.needsUpdate = true;
        });
        const ph = 1.12;
        const mark = add(
          new THREE.PlaneGeometry(0.098, 0.0428),
          track(new THREE.MeshStandardMaterial({ map: tt, bumpMap: bump, bumpScale: 2.2, roughness: 0.55, transparent: true, alphaTest: 0.04, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })),
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
          // fit the logo inside the cloth with a margin at both ends (it used to be 420 tall, which pushed the R past the edge)
          const w = 2048 - 2 * 150;
          const h = (w * logo.height) / logo.width;
          cg2.drawImage(logo, 150, 320 - h / 2, w, h);
        }
      };
      paintTowel();
      const tt = tex(c);
      const logoImg = new Image();
      // the back face gets its own copy of the print, flipped across the cloth's width, so the logo reads the right way round from behind
      const ttBack = tt.clone();
      ttBack.repeat.set(1, -1);
      ttBack.offset.set(0, 1);
      ttBack.needsUpdate = true;
      logoImg.onload = () => {
        paintTowel(logoImg);
        tt.needsUpdate = true;
        ttBack.needsUpdate = true;
      };
      logoImg.src = "/shop3d/slogan.png";
      const mat = track(new THREE.MeshStandardMaterial({ map: tt, roughness: 1, normalMap: file("fabric_normal.jpg", false, [6, 3]), normalScale: new THREE.Vector2(0.6, 0.6), side: THREE.FrontSide }));
      const backMat = track(mat.clone());
      backMat.map = ttBack;
      backMat.side = THREE.BackSide;
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
      tag(add(geo, backMat, 0, 0, 0, g, false), "slogan-towel");
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
    g.position.set(-W + 2.4, 0, -1.3);
    g.rotation.y = 0.12;
    // terrazzo top; the side is plain lacquer so the texture does not smear into streaks
    const tableSide = track(new THREE.MeshPhysicalMaterial({ color: "#ece7e2", roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.15 }));
    const tableTop = photoMat("terrazzo_color", { repeat: [2.6, 1.8], rough: 0.8, normal: 0.6, clearcoat: 0.9 });
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
    for (const c of g.children) c.visible = false; // baked table body replaces these
    box(0.42, 0.045, 0.42, photoMat("wood_warm", { repeat: [1.2, 1.2], rough: 0.7 }), -0.45, 0.52, -0.08, g).rotation.y = 0.35;
    {
      // a layer cake on the board: sponge and jam layers, icing with piped rosettes, a cherry and candles
      const cake = new THREE.Group();
      cake.position.set(-0.45, 0.5425, -0.08);
      cake.rotation.y = 0.35;
      g.add(cake);
      const side = paint(512, 64, (c) => {
        const bands: [number, number, string][] = [[0, 70, "#f7e8d4"], [14, 34, "#e9c27a"], [34, 38, "#c7284f"], [38, 56, "#e9c27a"], [56, 60, "#fff3e6"], [60, 64, "#e9c27a"]];
        for (const [y0, y1, col] of bands) {
          c.fillStyle = col;
          c.fillRect(0, y0, 512, y1 - y0);
        }
        c.fillStyle = "#f7e8d4";
        for (let q = 0; q < 512; q += 21) {
          c.beginPath();
          c.arc(q + 8, 14, 9, 0, 7);
          c.fill();
          c.fillRect(q, 0, 17, 14);
        }
      }, 0.55);
      const topM = paint(256, 256, (c) => {
        c.fillStyle = "#f7e8d4";
        c.fillRect(0, 0, 256, 256);
        c.strokeStyle = "rgba(240,200,210,0.8)";
        c.lineWidth = 3;
        for (let r = 30; r < 128; r += 22) {
          c.beginPath();
          c.arc(128, 128, r, 0, 7);
          c.stroke();
        }
      }, 0.5);
      const cm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 40), [side, topM, topM]);
      cm.position.y = 0.04;
      cm.castShadow = cm.receiveShadow = true;
      cake.add(cm);
      const icing = std("#f71d64", 0.4);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        add(new THREE.SphereGeometry(0.0125, 10, 8), icing, Math.cos(a) * 0.092, 0.086, Math.sin(a) * 0.092, cake);
      }
      add(new THREE.SphereGeometry(0.02, 14, 10), track(new THREE.MeshPhysicalMaterial({ color: "#c8102e", roughness: 0.2, clearcoat: 1 })), 0, 0.098, 0, cake);
      const flame = track(new THREE.MeshBasicMaterial({ color: "#ffb347" }));
      for (const [cx2, cz2, col] of [[-0.05, 0.03, "#ffd9e6"], [0.05, 0.02, "#c14ed4"], [0.0, -0.06, "#fff3e6"]] as const) {
        cyl(0.004, 0.004, 0.05, std(col, 0.6), cx2, 0.105, cz2, cake, 8);
        add(new THREE.SphereGeometry(0.0055, 8, 6), flame, cx2, 0.136, cz2, cake, false).scale.y = 1.6;
      }
    }
    const glassM = track(new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.05, transparent: true, opacity: 0.26, clearcoat: 1 }));
    const strawM = paint(16, 64, (c) => {
      c.fillStyle = "#fff";
      c.fillRect(0, 0, 16, 64);
      c.fillStyle = "#f71d64";
      for (let y = 0; y < 64; y += 14) c.fillRect(0, y, 16, 7);
    }, 0.5);
    for (const [c, x, z] of [["#f71d64", -0.05, -0.14], ["#ffb792", 0.08, 0.02], ["#c14ed4", 0.2, -0.1]] as const) {
      cyl(0.045, 0.036, 0.13, glassM, x, 0.565, z, g, 18).castShadow = false;
      cyl(0.04, 0.033, 0.07, track(new THREE.MeshStandardMaterial({ color: c, roughness: 0.2, emissive: c, emissiveIntensity: 0.2 })), x, 0.545, z, g, 18);
      cyl(0.0035, 0.0035, 0.17, strawM, x + 0.012, 0.6, z, g, 6).rotation.z = -0.16;
    }
    const bottleM = track(new THREE.MeshPhysicalMaterial({ color: "#1b5a38", roughness: 0.12, clearcoat: 1 }));
    cyl(0.04, 0.04, 0.26, bottleM, 0.38, 0.62, -0.18, g, 18);
    cyl(0.015, 0.04, 0.07, bottleM, 0.38, 0.79, -0.18, g, 14);
    {
      // paper label, gold foil on the neck
      const labelM = paint(256, 128, (c) => {
        c.fillStyle = "#f4ead2";
        c.fillRect(0, 0, 256, 128);
        c.fillStyle = "#1b5a38";
        c.fillRect(0, 10, 256, 4);
        c.fillRect(0, 114, 256, 4);
        c.font = '900 40px "Pretendard Variable", Arial Black, sans-serif';
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillStyle = "#f71d64";
        c.fillText("ROOMi", 128, 52);
        c.font = '700 16px Arial, sans-serif';
        c.fillStyle = "#1b5a38";
        c.fillText("PARTY SPARKLING", 128, 88);
      }, 0.6);
      const lab = add(new THREE.CylinderGeometry(0.0408, 0.0408, 0.12, 24, 1, true), labelM, 0.38, 0.62, -0.18, g, false);
      lab.rotation.y = -0.5;
      const foil = std("#d9b45a", 0.3, 0.9);
      cyl(0.0185, 0.0285, 0.05, foil, 0.38, 0.81, -0.18, g, 14);
      cyl(0.0195, 0.0195, 0.006, foil, 0.38, 0.838, -0.18, g, 14);
    }

    // ---- mini CD keyrings: a glossy acrylic charm printed with the logo, a holographic mini CD resting on it, a split ring and ball chain
    const holo = (() => {
      const { c, g } = canvas(256, 256);
      const cg2 = (g as unknown as { createConicGradient?: (a: number, x: number, y: number) => CanvasGradient }).createConicGradient;
      if (cg2) {
        const gr = cg2.call(g, 0.4, 128, 128);
        const stops = ["#ff8ad8", "#ffd48a", "#9affc8", "#8ad4ff", "#c79aff", "#ff8ad8"];
        stops.forEach((col, i) => gr.addColorStop(i / (stops.length - 1), col));
        g.fillStyle = gr;
        g.fillRect(0, 0, 256, 256);
      } else {
        g.fillStyle = "#d8c8ff";
        g.fillRect(0, 0, 256, 256);
      }
      const rad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      rad.addColorStop(0, "rgba(255,255,255,0.55)");
      rad.addColorStop(0.3, "rgba(255,255,255,0)");
      rad.addColorStop(1, "rgba(255,255,255,0.25)");
      g.fillStyle = rad;
      g.fillRect(0, 0, 256, 256);
      g.strokeStyle = "rgba(255,255,255,0.2)";
      for (let r = 40; r < 128; r += 6) {
        g.beginPath();
        g.arc(128, 128, r, 0, 7);
        g.stroke();
      }
      return tex(c);
    })();
    const chain = std("#d8d6de", 0.28, 0.95);
    for (const [x, z, col, rot, accent] of [[-0.48, 0.28, "#f71d64", 0.2, "#ffd9e6"], [-0.28, 0.34, "#c14ed4", -0.3, "#f3d9fb"]] as const) {
      const kg = new THREE.Group();
      kg.position.set(x, 0.4975, z);
      kg.rotation.y = rot;
      // the mini CD is printed into the charm itself, so nothing can overhang its edge
      const front = paint(512, 512, (c) => {
        c.scale(2, 2);
        const gr = c.createLinearGradient(0, 0, 256, 256);
        gr.addColorStop(0, col);
        gr.addColorStop(1, accent);
        c.fillStyle = gr;
        c.fillRect(0, 0, 256, 256);
        c.fillStyle = "rgba(255,255,255,0.16)";
        for (let q = 0; q < 256; q += 16) for (let r = 0; r < 256; r += 16) c.fillRect(q + 6, r + 6, 3, 3);
        const cx = 134;
        const cy = 126;
        const R0 = 82;
        c.save();
        c.shadowColor = "rgba(60,0,40,0.35)";
        c.shadowBlur = 8;
        c.shadowOffsetY = 3;
        c.beginPath();
        c.arc(cx, cy, R0, 0, 7);
        c.fillStyle = "#e9dcff";
        c.fill();
        c.restore();
        c.save();
        c.beginPath();
        c.arc(cx, cy, R0 - 1, 0, 7);
        c.clip();
        c.drawImage(holo.image as CanvasImageSource, cx - R0, cy - R0, R0 * 2, R0 * 2);
        c.restore();
        c.strokeStyle = "rgba(255,255,255,0.75)";
        c.lineWidth = 2;
        c.beginPath();
        c.arc(cx, cy, R0 - 1, 0, 7);
        c.stroke();
        c.strokeStyle = "rgba(255,255,255,0.28)";
        c.lineWidth = 1;
        for (const rr of [0.36, 0.5, 0.64, 0.78]) {
          c.beginPath();
          c.arc(cx, cy, R0 * rr, 0, 7);
          c.stroke();
        }
        c.beginPath();
        c.arc(cx, cy, R0 * 0.3, 0, 7);
        c.fillStyle = accent;
        c.globalAlpha = 0.85;
        c.fill();
        c.globalAlpha = 1;
        c.strokeStyle = "rgba(255,255,255,0.9)";
        c.lineWidth = 2;
        c.stroke();
        c.fillStyle = "#fff";
        c.font = '900 38px "Pretendard Variable", Arial Black, sans-serif';
        c.textAlign = "left";
        c.textBaseline = "alphabetic";
        c.fillText("ROOMi", 14, 244);
        c.font = '600 15px Arial, sans-serif';
        c.fillText("MINI DISC", 16, 26);
      }, 0.18);
      const acrylic = track(new THREE.MeshPhysicalMaterial({ map: front.map, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.06, envMap: scene.environment, envMapIntensity: 1.2 }));
      const slab = new THREE.Mesh(roundedSlab(0.13, 0.13, 0.0075, 0.02), acrylic);
      slab.castShadow = true;
      kg.add(slab);
      tag(slab, "mini-cd-keyring");
      // split ring through the corner, then a ball chain trailing off across the table
      const ring = tag(new THREE.Mesh(new THREE.TorusGeometry(0.0125, 0.0013, 8, 28), chain), "mini-cd-keyring");
      ring.rotation.set(Math.PI / 2 - 0.5, 0, 0.3);
      ring.position.set(-0.052, 0.0052, -0.052);
      kg.add(ring);
      for (let k = 0; k < 9; k++) {
        const a2 = k * 0.62;
        const ball = tag(new THREE.Mesh(new THREE.SphereGeometry(0.0021, 8, 6), chain), "mini-cd-keyring");
        ball.position.set(-0.066 - k * 0.0072 + Math.sin(a2) * 0.002, 0.0022, -0.066 - k * 0.0072 + Math.cos(a2) * 0.0035);
        kg.add(ball);
      }
      hitBox(0.3, 0.12, 0.2, 0.0, 0.03, 0, kg, "mini-cd-keyring");
      g.add(kg);
    }
    // ---- embroidered letter patches: twill ground, satin-stitch letter, merrowed (thread-wrapped) border, felt back
    ["R", "O", "M", "i"].forEach((ch, i) => {
      const ground = ["#f2306f", "#b845cf", "#f6b99a", "#efecef"][i];
      const thread = ["#ffe9f0", "#f6e3ff", "#7a2a55", "#c4124f"][i];
      const edge = ["#ffd0e0", "#ecc0fa", "#fffaf2", "#7a2a55"][i];
      const W_ = 256;
      const H_ = 192;
      const col = canvas(W_, H_);
      const hgt = canvas(W_, H_);
      const rr = (ctx: CanvasRenderingContext2D, inset: number, rad: number) => {
        ctx.beginPath();
        ctx.roundRect(inset, inset, W_ - inset * 2, H_ - inset * 2, rad);
      };
      const drawAll = () => {
        const c = col.g;
        const h = hgt.g;
        // 1) the whole patch in border thread, then the stitches marching around the outline
        c.save();
        rr(c, 4, 26);
        c.clip();
        c.fillStyle = edge;
        c.fillRect(0, 0, W_, H_);
        h.save();
        rr(h, 4, 26);
        h.clip();
        h.fillStyle = "#d0d0d0";
        h.fillRect(0, 0, W_, H_);
        const per = 2 * (W_ + H_);
        for (let k = 0; k < per; k += 3) {
          const u = k / per;
          let x: number;
          let y: number;
          let nx: number;
          let ny: number;
          if (u < W_ / per) {
            x = u * per;
            y = 0;
            nx = 0;
            ny = 1;
          } else if (u < (W_ + H_) / per) {
            x = W_;
            y = u * per - W_;
            nx = -1;
            ny = 0;
          } else if (u < (2 * W_ + H_) / per) {
            x = W_ - (u * per - W_ - H_);
            y = H_;
            nx = 0;
            ny = -1;
          } else {
            x = 0;
            y = H_ - (u * per - 2 * W_ - H_);
            nx = 1;
            ny = 0;
          }
          c.strokeStyle = k % 6 === 0 ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.14)";
          c.lineWidth = 1.6;
          c.beginPath();
          c.moveTo(x, y);
          c.lineTo(x + nx * 15, y + ny * 15);
          c.stroke();
          h.strokeStyle = k % 6 === 0 ? "#ffffff" : "#b0b0b0";
          h.lineWidth = 1.6;
          h.beginPath();
          h.moveTo(x, y);
          h.lineTo(x + nx * 15, y + ny * 15);
          h.stroke();
        }
        c.restore();
        h.restore();
        // 2) the coloured twill ground inside the border
        c.save();
        rr(c, 19, 14);
        c.clip();
        c.fillStyle = ground;
        c.fillRect(0, 0, W_, H_);
        c.strokeStyle = "rgba(0,0,0,0.12)";
        c.lineWidth = 1;
        for (let q = -H_; q < W_; q += 4) {
          c.beginPath();
          c.moveTo(q, H_);
          c.lineTo(q + H_, 0);
          c.stroke();
        }
        c.restore();
        h.save();
        rr(h, 19, 14);
        h.clip();
        h.fillStyle = "#505050";
        h.fillRect(0, 0, W_, H_);
        h.restore();
        // inner edge of the border, a little shadow line under the thread
        rr(c, 19, 14);
        c.strokeStyle = "rgba(0,0,0,0.28)";
        c.lineWidth = 3;
        c.stroke();
        rr(h, 19, 14);
        h.strokeStyle = "#202020";
        h.lineWidth = 3;
        h.stroke();
        // the letter: filled with diagonal satin stitches
        const fontPx = ch === "i" ? 150 : 160;
        for (let t = 0; t < 2; t++) {
          const ctx = t === 0 ? c : h;
          ctx.save();
          ctx.font = `900 ${fontPx}px "Pretendard Variable", "Arial Black", sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.lineJoin = "round";
          ctx.lineWidth = 8;
          ctx.strokeStyle = t === 0 ? "rgba(0,0,0,0.30)" : "#101010";
          ctx.strokeText(ch, W_ / 2, H_ / 2 + 8);
          ctx.fillStyle = t === 0 ? thread : "#a0a0a0";
          ctx.fillText(ch, W_ / 2, H_ / 2 + 8);
          ctx.globalCompositeOperation = "source-atop";
          for (let q = -H_; q < W_ + H_; q += 3) {
            const odd = Math.round(q / 3) % 2 === 0;
            ctx.strokeStyle = t === 0 ? (odd ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.16)") : odd ? "#ffffff" : "#8a8a8a";
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(q, H_ * 0.15);
            ctx.lineTo(q + 50, H_ * 0.85);
            ctx.stroke();
          }
          ctx.restore();
        }
      };
      drawAll();
      const mapT = tex(col.c);
      const nrmT = normalFromHeight(hgt.c, 3.2);
      document.fonts?.ready.then(() => {
        col.g.clearRect(0, 0, W_, H_);
        drawAll();
        mapT.needsUpdate = true;
        const t2 = normalFromHeight(hgt.c, 3.2);
        nrmT.image = t2.image;
        nrmT.needsUpdate = true;
      });
      const pm = track(new THREE.MeshStandardMaterial({ map: mapT, normalMap: nrmT, normalScale: new THREE.Vector2(1.1, 1.1), roughness: 0.78 }));
      // the slab has two material groups: caps (top/bottom) take the embroidery, the rim takes plain thread
      const rimMat = track(new THREE.MeshStandardMaterial({ color: edge, roughness: 0.85 }));
      const patch = new THREE.Mesh(roundedSlab(0.12, 0.09, 0.0075, 0.014, 0.0016), [pm, rimMat]);
      patch.position.set(0.02 + i * 0.14, 0.4975, 0.34 - (i % 2) * 0.05);
      patch.castShadow = true;
      patch.receiveShadow = true;
      g.add(patch);
      tag(patch, "letter-patch").rotation.y = 0.2 - i * 0.18;
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
    const frame = photoMat("wood_warm", { rot: Math.PI / 2, tint: "#a98a78", rough: 0.85, clearcoat: 0.2 });
    const cw = 0.54;
    const cols = 3;
    const rows = 2;
    const shelfH = rows * cw + 0.06;
    const y0 = 0.14;
    rbox(cols * cw + 0.06, 0.14, 0.4, 0.01, frame, 0, 0.07, 0, g);
    for (let i = 0; i <= cols; i++) rbox(0.035, shelfH, 0.38, 0.006, frame, -(cols * cw) / 2 + i * cw, y0 + shelfH / 2, 0, g);
    for (let j = 0; j <= rows; j++) rbox(cols * cw + 0.035, 0.035, 0.38, 0.006, frame, 0, y0 + j * cw + 0.017, 0, g);
    box(cols * cw + 0.03, shelfH, 0.01, std("#0e0a10", 0.8), 0, y0 + shelfH / 2, -0.19, g);
    for (const c of g.children) c.visible = false; // the baked shelf frame from the Blender module replaces these

    const mats = ["#f71d64", "#c14ed4", "#ffb792", "#f0f0f0"].map((c) => std(c, 0.55));
    // Each cell holds one calm group: balloons, hats, rolls, gifts, cups, poppers.
    // One painted sheet for every shelf item (hats, rolls, gifts, cups, poppers): one material, so they draw as one mesh.
    const SHEET = 4;
    const sheetC = canvas(512, 512);
    const drawCell = (idx: number, fn: (c: CanvasRenderingContext2D) => void) => {
      const c = sheetC.g;
      c.save();
      c.translate((idx % SHEET) * 128, Math.floor(idx / SHEET) * 128);
      c.beginPath();
      c.rect(0, 0, 128, 128);
      c.clip();
      fn(c);
      c.restore();
    };
    const dots = (base: string, dot: string) => (c: CanvasRenderingContext2D) => {
      c.fillStyle = base;
      c.fillRect(0, 0, 128, 128);
      c.fillStyle = dot;
      for (let r = 0; r < 7; r++) for (let q = 0; q < 8; q++) {
        c.beginPath();
        c.arc(q * 17 + (r % 2) * 8 + 6, r * 19 + 9, 3.4, 0, 7);
        c.fill();
      }
    };
    const rolled = (col: string) => (c: CanvasRenderingContext2D) => {
      c.fillStyle = col;
      c.fillRect(0, 0, 128, 128);
      for (let y = 0; y < 128; y += 4) {
        c.fillStyle = y % 8 === 0 ? "rgba(0,0,0,0.13)" : "rgba(255,255,255,0.12)";
        c.fillRect(0, y, 128, 2);
      }
    };
    const striped = (a: string, b: string) => (c: CanvasRenderingContext2D) => {
      c.fillStyle = a;
      c.fillRect(0, 0, 128, 128);
      c.fillStyle = b;
      for (let q = 0; q < 128; q += 16) c.fillRect(q, 0, 8, 128);
    };
    drawCell(0, dots("#f71d64", "#fff7ee"));
    drawCell(1, dots("#c14ed4", "#ffd9e6"));
    drawCell(2, dots("#ffb792", "#fff7ee"));
    drawCell(3, rolled("#c14ed4"));
    drawCell(4, rolled("#ffb792"));
    drawCell(5, rolled("#f0f0f0"));
    drawCell(6, dots("#f71d64", "#ffe3ee"));
    drawCell(7, (c) => {
      c.fillStyle = "#c14ed4";
      c.fillRect(0, 0, 128, 128);
      c.fillStyle = "#f3d9fb";
      for (let q = -128; q < 256; q += 24) {
        c.save();
        c.translate(q, 0);
        c.rotate(0.6);
        c.fillRect(0, 0, 7, 260);
        c.restore();
      }
    });
    drawCell(8, striped("#f71d64", "#fff7f2"));
    drawCell(9, striped("#f4f1ee", "#f71d64"));
    drawCell(10, striped("#f71d64", "#f6d98a"));
    drawCell(11, striped("#c14ed4", "#f6d98a"));
    drawCell(12, striped("#ffb792", "#f6d98a"));
    const sheetMat = track(new THREE.MeshStandardMaterial({ map: tex(sheetC.c), roughness: 0.65 }));
    const cellUV = <T extends THREE.BufferGeometry>(geo: T, idx: number) => {
      const uv = geo.attributes.uv;
      const u0 = (idx % SHEET) / SHEET;
      const v0 = 1 - (Math.floor(idx / SHEET) + 1) / SHEET;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, u0 + 0.004 + uv.getX(i) * (1 / SHEET - 0.008), v0 + 0.004 + uv.getY(i) * (1 / SHEET - 0.008));
      return geo;
    };
    const cell = (cx: number, cy: number, kind: number) => {
      const by = y0 + cy * cw + 0.03;
      if (kind === 0) {
        for (let i = 0; i < 3; i++) {
          const col = ["#f71d64", "#c14ed4", "#f0f0f0"][i];
          // each balloon hangs from its own pivot at the knot, so it can sway (not merged into the static props)
          const pv = new THREE.Group();
          pv.position.set(cx - 0.12 + i * 0.12, by + 0.09, 0);
          pv.userData.noMerge = true;
          const b = add(new THREE.SphereGeometry(0.085, 20, 16), track(new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.22, clearcoat: 0.6 })), 0, 0.21 + (i % 2) * 0.06, 0, pv);
          b.scale.y = 1.2;
          cyl(0.002, 0.002, 0.2, std("#ddd", 0.9), 0, 0.1, 0, pv, 4);
          g.add(pv);
          balloonPivots.push(pv);
        }
      } else if (kind === 1) {
        // party hats: dotted paper cones with a brim band and a pompom
        for (let i = 0; i < 3; i++) {
          const x = cx - 0.13 + i * 0.13;
          add(cellUV(new THREE.ConeGeometry(0.06, 0.2, 24), i), sheetMat, x, by + 0.1, 0, g);
          cyl(0.064, 0.064, 0.012, std("#fff3e6", 0.8), x, by + 0.006, 0, g, 24);
          add(new THREE.SphereGeometry(0.017, 12, 10), std("#fff3e6", 0.95), x, by + 0.205, 0, g);
        }
      } else if (kind === 2) {
        // rolls of crepe streamer: wound ridges on the side, a dark core on top
        const core = std("#2a1020", 0.9);
        for (let i = 0; i < 3; i++) {
          const x = cx - 0.14 + i * 0.14;
          add(cellUV(new THREE.CylinderGeometry(0.055, 0.055, 0.13, 24), 3 + i), sheetMat, x, by + 0.065, 0, g);
          const hole = add(new THREE.CircleGeometry(0.02, 16), core, x, by + 0.1305, 0, g, false);
          hole.rotation.x = -Math.PI / 2;
        }
      } else if (kind === 3) {
        // wrapped gifts: patterned paper, a ribbon crossing over the top and a bow
        const ribbon = std("#fff0d6", 0.45);
        for (let i = 0; i < 2; i++) {
          const w = 0.16 + i * 0.04;
          const h = w * 0.9;
          const x = cx - 0.1 + i * 0.17;
          const gift = rbox(w, h, w, 0.006, sheetMat, x, by + h / 2, 0, g);
          cellUV(gift.geometry, 6 + i);
          box(0.02, h + 0.004, w + 0.004, ribbon, x, by + h / 2, 0, g);
          box(w + 0.004, h + 0.004, 0.02, ribbon, x, by + h / 2, 0, g);
          for (const sg of [-1, 1]) {
            const loop = add(new THREE.SphereGeometry(0.028, 12, 8), ribbon, x + sg * 0.026, by + h + 0.012, 0, g);
            loop.scale.set(1.3, 0.55, 0.8);
            loop.rotation.z = sg * 0.4;
          }
          add(new THREE.SphereGeometry(0.012, 10, 8), ribbon, x, by + h + 0.008, 0, g);
        }
      } else if (kind === 4) {
        // stacks of striped paper cups, the top one open
        for (let i = 0; i < 2; i++) {
          const x = cx - 0.1 + i * 0.2;
          for (let k = 0; k < 4; k++) add(cellUV(new THREE.CylinderGeometry(0.05, 0.038, 0.055, 24), 8 + i), sheetMat, x, by + 0.03 + k * 0.035, 0, g);
          cyl(0.0505, 0.0505, 0.004, std(i === 0 ? "#ffd9e6" : "#fff", 0.6), x, by + 0.03 + 3 * 0.035 + 0.026, 0, g, 24);
          const inner = add(new THREE.CircleGeometry(0.045, 20), std("#4a0f26", 0.8), x, by + 0.03 + 3 * 0.035 + 0.0275, 0, g, false);
          inner.rotation.x = -Math.PI / 2;
        }
      } else {
        // party poppers: foil stripes, a gold cap and a streamer curl
        const popCols = ["#f71d64", "#c14ed4", "#ffb792"];
        for (let i = 0; i < 3; i++) {
          const pg = new THREE.Group();
          pg.position.set(cx - 0.12 + i * 0.12, by + 0.1, 0);
          pg.rotation.z = 0.2 - i * 0.2;
          g.add(pg);
          add(cellUV(new THREE.ConeGeometry(0.04, 0.2, 18), 10 + i), sheetMat, 0, 0, 0, pg);
          cyl(0.043, 0.043, 0.012, std("#e7c26a", 0.35, 0.8), 0, -0.1, 0, pg, 18);
          const curl = add(new THREE.TorusGeometry(0.016, 0.0022, 6, 14, 4.6), std(popCols[(i + 1) % 3], 0.5), 0.004, 0.104, 0, pg);
          curl.rotation.y = 0.9;
        }
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

  // ---------- Light spots thrown by the disco ball ----------
  // Each mirror tile of a real ball throws a small, soft-edged, slightly rotated square. It stretches into a streak where the beam
  // lands at a slant, gets dimmer with distance, and sparkles. 64 of them are drawn as one instanced mesh.
  const SPOT_N = 64;
  const softSquare = (() => {
    const { c, g } = canvas(64, 64);
    const img = g.createImageData(64, 64);
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const u = (x + 0.5) / 32 - 1;
        const v = (y + 0.5) / 32 - 1;
        const d = Math.pow(Math.pow(Math.abs(u), 4) + Math.pow(Math.abs(v), 4), 0.25); // rounded-square distance
        let a2 = 1 - Math.min(1, Math.max(0, (d - 0.42) / 0.55));
        a2 = a2 * a2 * (3 - 2 * a2);
        a2 = Math.min(1, a2 + 0.2 * Math.exp(-d * d * 2.4)); // faint halo around the core
        const i = (y * 64 + x) * 4;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
        img.data[i + 3] = Math.round(a2 * 255);
      }
    }
    g.putImageData(img, 0, 0);
    return tex(c);
  })();
  const spotMat = track(new THREE.MeshBasicMaterial({ map: softSquare, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, color: "#ffffff" }));
  const spotMesh = new THREE.InstancedMesh(track(new THREE.PlaneGeometry(1, 1)), spotMat, SPOT_N);
  spotMesh.frustumCulled = false;
  spotMesh.renderOrder = 2;
  spotMesh.visible = false;
  spotMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const spotHue = ["#ffffff", "#ffffff", "#ffffff", "#ffd0e4", "#e7c4ff", "#ffe6c8"].map((c) => new THREE.Color(c));
  const spotSeed: { dir: THREE.Vector3; size: number; ang: number; gain: number; ph: number; hue: THREE.Color }[] = [];
  for (let i = 0; i < SPOT_N; i++) {
    const y = 1 - (2 * (i + 0.5)) / SPOT_N;
    const r = Math.sqrt(1 - y * y);
    const phi = i * 2.399963;
    const h1 = ((i * 7919) % 97) / 97;
    const h2 = ((i * 104729) % 89) / 89;
    spotSeed.push({
      dir: new THREE.Vector3(Math.cos(phi) * r, y, Math.sin(phi) * r),
      size: 0.05 + h1 * 0.05,
      ang: h2 * Math.PI,
      gain: 0.55 + 0.45 * h1,
      ph: h2 * 6.28,
      hue: spotHue[i % spotHue.length],
    });
    spotMesh.setColorAt(i, spotHue[i % spotHue.length]);
  }
  scene.add(spotMesh);
  const ballPos = new THREE.Vector3();
  const rot = new THREE.Matrix4();
  const rotX = new THREE.Matrix4();
  const tmp = new THREE.Vector3();
  const sN = new THREE.Vector3();
  const sP = new THREE.Vector3();
  const sQ = new THREE.Vector3();
  const sA = new THREE.Vector3();
  const sB = new THREE.Vector3();
  const sMat = new THREE.Matrix4();
  const sCol = new THREE.Color();
  const throwSpots = (t: number, strength: number) => {
    spotMesh.visible = strength > 0.01;
    if (!spotMesh.visible) return;
    ball.getWorldPosition(ballPos);
    rot.makeRotationY(t * 0.6);
    rotX.makeRotationX(Math.sin(t * 0.13) * 0.1);
    rot.multiply(rotX);
    const lim = [
      [-W, W, "x"],
      [0, H, "y"],
      [Z0, Z1 - 0.05, "z"],
    ] as const;
    for (let i = 0; i < SPOT_N; i++) {
      const sd = spotSeed[i];
      tmp.copy(sd.dir).applyMatrix4(rot);
      let best = Infinity;
      let hitAxis: "x" | "y" | "z" = "y";
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
        sMat.makeScale(0, 0, 0);
        spotMesh.setMatrixAt(i, sMat);
        continue;
      }
      // surface normal pointing into the room
      sN.set(0, 0, 0);
      sN[hitAxis] = -sign;
      const cosI = Math.max(0.12, Math.abs(tmp[hitAxis]));
      const stretch = Math.min(3, 1 / cosI);
      // in-plane axis along the beam's slant
      sP.copy(tmp).addScaledVector(sN, -tmp.dot(sN));
      if (sP.lengthSq() < 1e-6) sP.set(sN.y, sN.z, sN.x);
      sP.normalize();
      sQ.crossVectors(sN, sP);
      const size = sd.size + best * 0.012;
      const ca = Math.cos(sd.ang);
      const sa = Math.sin(sd.ang);
      // square turned by ang inside the plane, then stretched along the slant
      sA.copy(sP).multiplyScalar(ca * stretch).addScaledVector(sQ, sa).multiplyScalar(size);
      sB.copy(sP).multiplyScalar(-sa * stretch).addScaledVector(sQ, ca).multiplyScalar(size);
      sMat.makeBasis(sA, sB, sN);
      sMat.setPosition(ballPos.x + tmp.x * (best - 0.015), ballPos.y + tmp.y * (best - 0.015), ballPos.z + tmp.z * (best - 0.015));
      spotMesh.setMatrixAt(i, sMat);
      const twinkle = 0.72 + 0.28 * Math.sin(t * 3.1 + sd.ph);
      const k = strength * sd.gain * twinkle * Math.sqrt(cosI) / (1 + 0.04 * best * best) * 0.9;
      sCol.copy(sd.hue).multiplyScalar(k);
      spotMesh.setColorAt(i, sCol);
    }
    spotMesh.instanceMatrix.needsUpdate = true;
    if (spotMesh.instanceColor) spotMesh.instanceColor.needsUpdate = true;
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
  let beamTarget = 0.5;
  let beamLevel = 0;
  let stageIntensity = 0;
  const stageOn = [true, true];
  const stageC = [1, 1];
  const hLights = [0, 0];
  const sway = [0, 0];
  let lasers = false;
  let spin = false;
  let dustTarget = 0.45;
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
      day: { sun: 2.4, sunC: "#ffd2ac", hemi: 0.95, env: 0.45, ex: 0.95, stage: 5, neon: 0.7, spots: 0, a: "#ffffff", b: "#ffffff", dust: 0.15, beam: 0.1 },
      house: { sun: 0.2, sunC: "#c14ed4", hemi: 0.3, env: 0.16, ex: 1.05, stage: 95, neon: 1.0, spots: 0.8, a: "#f71d64", b: "#c14ed4", dust: 0.65, beam: 0.5 },
      listening: { sun: 0.25, sunC: "#ffb070", hemi: 0.4, env: 0.2, ex: 1.05, stage: 40, neon: 0.7, spots: 0.15, a: "#ffb36b", b: "#ff9a4d", dust: 0.5, beam: 0.25 },
      dayparty: { sun: 1.6, sunC: "#ffe2b0", hemi: 0.8, env: 0.4, ex: 0.98, stage: 22, neon: 0.7, spots: 0.35, a: "#ffe07a", b: "#ffb86b", dust: 0.3, beam: 0.16 },
      themed: { sun: 0.1, sunC: "#ff8a2a", hemi: 0.25, env: 0.14, ex: 1.05, stage: 100, neon: 1.0, spots: 0.8, a: "#ff7a1a", b: "#30e0a0", dust: 0.6, beam: 0.5 },
      rave: { sun: 0, sunC: "#5a4cff", hemi: 0.1, env: 0.06, ex: 1.05, stage: 75, neon: 1.0, spots: 0.7, a: "#4a6bff", b: "#b13dff", dust: 0.75, beam: 0.42 },
      after: { sun: 0.05, sunC: "#ff7a50", hemi: 0.22, env: 0.1, ex: 1.08, stage: 45, neon: 0.8, spots: 0.25, a: "#ff5a7a", b: "#ff9a5a", dust: 0.55, beam: 0.28 },
    }[m];
    sun.intensity = v.sun;
    sun.color.set(v.sunC);
    hemi.intensity = v.hemi;
    scene.environmentIntensity = v.env;
    fixtures[0].color.set(v.a);
    fixtures[1].color.set(v.b);
    beamMats[0].uniforms.uColor.value.set(v.a);
    beamMats[1].uniforms.uColor.value.set(v.b);
    fixtureGlow[0].material.color.set(v.a);
    fixtureGlow[1].material.color.set(v.b);
    const lensGain = m === "day" ? 1 : 1.1;
    lensBase[0].set(v.a).multiplyScalar(lensGain);
    lensBase[1].set(v.b).multiplyScalar(lensGain);
    lensMats[0].color.copy(lensBase[0]);
    lensMats[1].color.copy(lensBase[1]);
    stageIntensity = v.stage;
    fixtures.forEach((f, i) => (f.intensity = v.stage * stageC[i]));
    for (const n of neons) n.mat.color.copy(n.base).multiplyScalar(n.gain * v.neon);
    spotStrength = v.spots;
    moduleHooks.setMood(m);
    dustTarget = v.dust;
    beamTarget = v.beam; // even in daylight a faint cone shows the spots are on
    lasers = m === "rave";
    for (const b of beams) b.visible = lasers;
    if (lasers) sweep(lastT);
    return v.ex;
  };

  // ---------- Floating dust motes (they catch the light) and a twinkle over every product ----------
  const dustN = 70;
  const dustSeed = Array.from({ length: dustN }, () => ({
    x: (Math.random() - 0.5) * 6.2,
    z: -4 + Math.random() * 4.4,
    y0: 0.2 + Math.random() * 2.8,
    sp: 0.018 + Math.random() * 0.03,
    ph: Math.random() * 6.28,
  }));
  const dustPos = new Float32Array(dustN * 3);
  const dustGeo = track(new THREE.BufferGeometry());
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dotC = canvas(32, 32);
  {
    const gr = dotC.g.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.4, "rgba(255,255,255,0.45)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    dotC.g.fillStyle = gr;
    dotC.g.fillRect(0, 0, 32, 32);
  }
  const dustMat = track(
    new THREE.PointsMaterial({ map: tex(dotC.c), size: 0.05, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: "#ffe2c6", opacity: 0 }),
  );
  const dust = new THREE.Points(dustGeo, dustMat);
  dust.frustumCulled = false;
  scene.add(dust);

  const starC = canvas(64, 64);
  {
    const sg = starC.g;
    const gr = sg.createRadialGradient(32, 32, 0, 32, 32, 14);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    sg.fillStyle = gr;
    sg.fillRect(0, 0, 64, 64);
    for (const [w, h] of [[62, 3], [3, 62]]) {
      const lg = sg.createLinearGradient(32 - w / 2, 32 - h / 2, 32 + w / 2, 32 + h / 2);
      lg.addColorStop(0, "rgba(255,255,255,0)");
      lg.addColorStop(0.5, "rgba(255,255,255,0.95)");
      lg.addColorStop(1, "rgba(255,255,255,0)");
      sg.fillStyle = lg;
      sg.fillRect(32 - w / 2, 32 - h / 2, w, h);
    }
  }
  const starTex = tex(starC.c);
  const twinkles: { mat: THREE.SpriteMaterial; sp: THREE.Sprite; ph: number }[] = [];
  scene.updateMatrixWorld(true);
  for (const id of ["cap", "slogan-towel", "bandana", "mini-cd-keyring", "letter-patch", "laptop", "dj-controller"]) {
    const bb = new THREE.Box3();
    let any = false;
    for (const p of picks) {
      if (p.id !== id) continue;
      bb.expandByObject(p.object);
      any = true;
    }
    if (!any) continue;
    const mat = track(
      new THREE.SpriteMaterial({ map: starTex, color: "#fff0d2", transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }),
    );
    const sp = new THREE.Sprite(mat);
    sp.position.set((bb.min.x + bb.max.x) / 2, bb.max.y + 0.06, (bb.min.z + bb.max.z) / 2);
    sp.scale.setScalar(0.1);
    scene.add(sp);
    twinkles.push({ mat, sp, ph: Math.random() * 6.28 });
  }

  // Fold the static props together (must stay after everything is built, and skip whatever moves or is tinted by mood).
  mergeStatic(
    scene,
    [ball],
    new Set<THREE.Material>([...neons.map((n) => n.mat), ...lensMats, ...djMats, ballMat, lapMat as unknown as THREE.Material]),
  );

  return {
    picks,
    setMood,
    setSpin(on: boolean) {
      spin = on;
    },
    toggleLamps() {
      moduleHooks.toggleLamps();
    },
    toggleStage(i: number) {
      stageOn[i] = !stageOn[i];
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
      for (let i = 0; i < 2; i++) {
        hLights[i] += ((hoverId === `stage-light-${i}` ? 1 : 0) - hLights[i]) * Math.min(1, dt * 10);
        stageC[i] += ((stageOn[i] ? 1 : 0) - stageC[i]) * Math.min(1, dt * 4);
      }
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
      moduleHooks.tick(dt, hoverId === "lamp");
      for (let i = 0; i < balloonPivots.length; i++) {
        balloonPivots[i].rotation.z = Math.sin(t * 0.9 + i * 1.9) * 0.05;
        balloonPivots[i].rotation.x = Math.sin(t * 0.7 + i * 2.3) * 0.03;
      }
      dustMat.opacity += (dustTarget - dustMat.opacity) * Math.min(1, dt * 2);
      for (let i = 0; i < dustN; i++) {
        const d = dustSeed[i];
        dustPos[i * 3] = d.x + Math.sin(t * 0.21 + d.ph) * 0.18;
        dustPos[i * 3 + 1] = 0.2 + ((d.y0 - 0.2 + t * d.sp) % 2.9);
        dustPos[i * 3 + 2] = d.z + Math.cos(t * 0.17 + d.ph) * 0.12;
      }
      dustGeo.attributes.position.needsUpdate = true;
      for (const w of twinkles) {
        const v = Math.pow(0.5 + 0.5 * Math.sin(t * 1.7 + w.ph), 5);
        w.mat.opacity = 0.12 + 0.88 * v;
        w.mat.rotation = t * 0.25 + w.ph;
        w.sp.scale.setScalar(0.06 + 0.1 * v);
      }
      lensMats.forEach((m, i) => m.color.copy(lensBase[i]).multiplyScalar((0.12 + 0.88 * stageC[i]) * (1 + hLights[i] * 1.4)));
      ballMat.emissiveIntensity = hBall * 0.12;
      beamLevel += (beamTarget - beamLevel) * Math.min(1, dt * 2.5);
      fixtureGlow.forEach((f, i) => {
        (f.material as THREE.SpriteMaterial).opacity = Math.min(1, (beamLevel * 1.1) * stageC[i] + hLights[i] * 0.6);
        beamMats[i].uniforms.uI.value = beamLevel * stageC[i] * (0.85 + 0.15 * Math.sin(t * 1.6 + i * 2.1)) + hLights[i] * 0.3;
      });
      (ballGlow.material as THREE.SpriteMaterial).opacity = hBall * 0.5;
      ballMat.envMapIntensity = 3.2 + hBall * 1.8;
      ball.position.y = 2.9 + Math.sin(t * 0.6) * 0.008;
      fixtures.forEach((f, i) => {
        // stage lights sway together with the spinning ball
        f.intensity = stageIntensity * stageC[i];
        // a slow, eased sweep (it used to follow the ball's spin one-to-one, which looked jittery)
        const want = spin ? Math.sin(angle * 0.9 + i * 3) * 0.9 : 0;
        sway[i] += (want - sway[i]) * Math.min(1, dt * 2.2);
        f.target.position.x = sway[i];
        fixtureGroups[i].lookAt(sway[i], 0.9, -3.0);
        fixtureGroups[i].rotateX(-Math.PI / 2);
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
