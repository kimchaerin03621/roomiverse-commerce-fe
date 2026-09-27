import React, { useState, useEffect } from 'react';

export default function ParallaxIntro({ onContainerClick }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredTarget, setHoveredTarget] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      // -1 ~ 1 범위로 정규화
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = (e.clientY / innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 select-none flex items-center justify-center">
      
      {/* LAYER 1: v2 background with weathered port apron */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out pointer-events-none scale-115"
        style={{
          transform: `translate3d(${mousePos.x * -8}px, ${mousePos.y * -8}px, 0)`,
        }}
      >
        <img
          src="/01_background_v2_textured.png"
          alt="Background Layer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* A single light direction, horizon haze, and subtle floor lines add depth without new objects. */}
      <div className="port-sun-glow absolute z-10 pointer-events-none" aria-hidden="true" />
      <div className="port-cinematic-light absolute inset-0 z-10 pointer-events-none" aria-hidden="true" />
      <div className="port-horizon-haze absolute inset-x-0 z-10 pointer-events-none" aria-hidden="true" />
      <div className="port-ground-guides absolute inset-x-0 bottom-0 z-10 pointer-events-none" aria-hidden="true" />

      {/* LAYER 2: v2 midground with port-textured container assets */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out pointer-events-none scale-115"
        style={{
          transform: `translate3d(${mousePos.x * -20}px, ${mousePos.y * -20}px, 0)`,
        }}
      >
        <img
          src="/02_Mid_v2_textured.png"
          alt="Midground Layer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* LAYER 3: v2 composition with port-textured container assets */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out flex items-center justify-center pointer-events-none scale-115 z-20"
        style={{
          transform: `translate3d(${mousePos.x * -35}px, ${mousePos.y * -35}px, 0)`,
        }}
      >
        <div
          onClick={onContainerClick}
          onMouseEnter={() => setHoveredTarget(true)}
          onMouseLeave={() => setHoveredTarget(false)}
          className="w-full h-full relative cursor-pointer pointer-events-auto group"
        >
          <img
            src="/03_Target_v2_textured.png"
            alt="Target Layer"
            className="w-full h-full object-cover"
          />

          <img
            src="/03_Real_Target_Graffiti.webp"
            alt="Target Container"
            style={{ transform: 'translate(2.2%, 5.6%) scale(.46)' }}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 pointer-events-none ${
              hoveredTarget ? 'brightness-110' : ''
            }`}
          />
        </div>
      </div>

      {/* LAYER 4: 가장 앞 전경 요소들 (04_Foreground_v2.webp) - 가장 큰 변위 */}
      <div
        className="absolute inset-0 z-30 transition-transform duration-200 ease-out pointer-events-none scale-120"
        style={{
          transform: `translate3d(${mousePos.x * -55}px, ${mousePos.y * -55}px, 0)`,
        }}
      >
        <img
          src="/04_Foreground_v2.webp"
          alt="Foreground Layer"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="port-vignette absolute inset-0 z-40 pointer-events-none" aria-hidden="true" />
    </div>
  );
}
