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
      
      {/* LAYER 1: 가장 뒤 배경 (01_background.webp) - 가장 작은 변위 */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out pointer-events-none scale-115"
        style={{
          transform: `translate3d(${mousePos.x * -8}px, ${mousePos.y * -8}px, 0)`,
        }}
      >
        <img
          src="/01_background.webp"
          alt="Background Layer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* LAYER 2: 중경 요소들 (02_Mid.webp) */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out pointer-events-none scale-115"
        style={{
          transform: `translate3d(${mousePos.x * -20}px, ${mousePos.y * -20}px, 0)`,
        }}
      >
        <img
          src="/02_Mid.webp"
          alt="Midground Layer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* LAYER 3: 인터랙션 타겟 메인 타겟/보라색 컨테이너 (03_Target.webp + 03_Real Target.webp) */}
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
          {/* Base Target Image */}
          <img
            src="/03_Target.webp"
            alt="Target Layer"
            className="w-full h-full object-cover"
          />

          {/* Exact Purple Container Cutout Layer - Glows on hover */}
          <img
            src="/03_Real Target.webp"
            alt="Real Target Layer"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 pointer-events-none ${
              hoveredTarget
                ? 'opacity-100 filter drop-shadow-[0_0_20px_rgba(168,85,247,0.95)] brightness-125'
                : 'opacity-0'
            }`}
          />
        </div>
      </div>

      {/* LAYER 4: 가장 앞 전경 요소들 (04_Foreground.webp) - 가장 큰 변위 */}
      <div
        className="absolute inset-0 z-30 transition-transform duration-200 ease-out pointer-events-none scale-120"
        style={{
          transform: `translate3d(${mousePos.x * -55}px, ${mousePos.y * -55}px, 0)`,
        }}
      >
        <img
          src="/04_Foreground.webp"
          alt="Foreground Layer"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
