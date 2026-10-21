"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/**
 * Close-up viewer for one product: its own small scene and renderer, an auto-turning model the visitor can also
 * drag to rotate. The model is a copy made by the room (see room.cloneProduct).
 */
export default function ProductViewer({ id, make }: { id: string; make: (id: string) => THREE.Group | null }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const model = make(id);
    if (!model) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "none";

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.55;

    // centre the model on its own origin
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const r = Math.max(box.getSize(new THREE.Vector3()).length() / 2, 0.01);
    model.position.sub(center);
    const pivot = new THREE.Group();
    pivot.add(model);
    scene.add(pivot);

    // soft studio light with a pink rim, so it still reads as part of the ROOMi room
    scene.add(new THREE.HemisphereLight(0xffffff, 0x6a5a70, 0.35));
    const key = new THREE.DirectionalLight(0xffffff, 1.7);
    key.position.set(r * 2, r * 3, r * 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xf71d64, 1.6);
    rim.position.set(-r * 3, r * 1.2, -r * 2);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xc14ed4, 0.7);
    fill.position.set(-r * 2, r, r * 2);
    scene.add(fill);

    const camera = new THREE.PerspectiveCamera(30, 1, r * 0.05, r * 40);
    const dist = (r / Math.sin((camera.fov * Math.PI) / 360)) * 0.95;
    const az = 0.45;
    const elev = 0.32;
    camera.position.set(Math.sin(az) * Math.cos(elev) * dist, Math.sin(elev) * dist, Math.cos(az) * Math.cos(elev) * dist);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.enableZoom = false; // drag to rotate only: wheel and pinch do not zoom
    controls.autoRotate = !reduce;
    controls.autoRotateSpeed = 4; // about 15 seconds a turn
    let resume = 0;
    const onStart = () => {
      window.clearTimeout(resume);
      controls.autoRotate = false;
    };
    const onEnd = () => {
      window.clearTimeout(resume);
      if (!reduce) resume = window.setTimeout(() => (controls.autoRotate = true), 2600);
    };
    controls.addEventListener("start", onStart);
    controls.addEventListener("end", onEnd);

    const size = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      // a narrow box needs a wider view to keep the whole product in frame
      camera.fov = w / h < 0.9 ? 40 : 30;
      camera.updateProjectionMatrix();
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      // pass the frame time so the turn takes the same time on slow and fast machines
      controls.update(Math.min((now - last) / 1000, 0.1));
      last = now;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resume);
      ro.disconnect();
      controls.dispose();
      model.traverse((n) => {
        const m = n as THREE.Mesh;
        if (!m.isMesh) return;
        // materials are this viewer's own copies; geometry is shared with the room unless it was made for the viewer
        (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => x.dispose());
        if (m.geometry.userData.own) m.geometry.dispose();
      });
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [id, make]);

  return <div ref={ref} style={{ position: "absolute", inset: 0 }} role="img" aria-label="상품 3D 모델: 드래그해서 돌려 볼 수 있어요" />;
}
