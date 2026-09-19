import React, { useState } from 'react';
import Spline from '@splinetool/react-spline';
import { Disc, Package, Sparkles, Box, ExternalLink } from 'lucide-react';

export default function PartyRoom3D({ onSelectProduct, onBackToIntro }) {
  const [splineLoaded, setSplineLoaded] = useState(false);

  // Interactive 3D Goods List (Used for Spline fallback or overlay interactive triggers)
  const interactiveGoods = [
    {
      id: 'dj-controller-pro',
      name: 'Pioneer DJ-Delivery Master System',
      price: '₩1,890,000',
      category: 'HIGH-END HARDWARE',
      desc: '팝업 전용 커스텀 무선 DJ 콘솔. 스피커 세트 포함 당일 특송 서비스 제공.',
      cafe24Url: 'https://cafe24.com/sample-product/dj-controller',
      icon: Disc,
      color: 'from-purple-600 to-indigo-600',
      tag: 'BEST SELLER'
    },
    {
      id: 'party-goods-kit',
      name: 'Cyberpunk Neon Party Package',
      price: '₩129,000',
      category: 'LIMITED MERCH',
      desc: '네온 무드등, 커스텀 칵테일 잔, LED 파티 글래스 & 아티스트 믹스셋 USB.',
      cafe24Url: 'https://cafe24.com/sample-product/party-kit',
      icon: Package,
      color: 'from-pink-600 to-purple-600',
      tag: 'LIMITED'
    },
    {
      id: 'sound-bar-deluxe',
      name: 'Spatial Boom Sound System',
      price: '₩450,000',
      category: 'AUDIO SYSTEM',
      desc: '360도 써라운드 하이파이 우퍼 파티 룸 배달 전용 스피커 패키지.',
      cafe24Url: 'https://cafe24.com/sample-product/sound-bar',
      icon: Box,
      color: 'from-cyan-500 to-blue-600',
      tag: 'POPULAR'
    }
  ];

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden flex flex-col justify-between">
      {/* Background Spline 3D Scene / 3D Canvas Interactive Room */}
      <div className="absolute inset-0 z-0">
        <Spline
          scene="https://prod.spline.design/6W5187hV4-f5M315/scene.splinecode"
          onLoad={() => setSplineLoaded(true)}
          className="w-full h-full object-cover"
        />
        
        {/* Loading Indicator for 3D Scene */}
        {!splineLoaded && (
          <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-4 z-10">
            <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
            <p className="mono-font text-sm text-purple-300 tracking-widest animate-pulse">
              INITIALIZING 3D PARTY ROOM SCENE...
            </p>
          </div>
        )}
      </div>

      {/* 3D Scene Overlay Controls - Header Bar */}
      <div className="relative z-10 p-6 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto glass-panel p-4 rounded-2xl border border-white/10 max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="mono-font text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Interactive 3D Main Shop
            </span>
            <button
              onClick={onBackToIntro}
              className="text-[10px] text-slate-400 hover:text-white underline font-mono"
            >
              ← Back to Intro
            </button>
          </div>
          <h3 className="brand-font text-lg font-bold text-white">
            3D Spatial Party Goods & DJ Setup
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            공간 속 오브젝트를 직접 클릭하시거나 아래 하이라이트 굿즈를 선택하여 Cafe24 모달로 주문할 수 있습니다.
          </p>
        </div>

        {/* Cafe24 Integration Badge */}
        <div className="pointer-events-auto glass-panel px-4 py-2 rounded-full border border-purple-500/40 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400 animate-spin-slow" />
          <span className="mono-font text-xs text-purple-200">CAFE24 SHOPPING IFRAME MODAL</span>
        </div>
      </div>

      {/* Bottom Floating Goods Carousel/Triggers for Direct Modal Launch */}
      <div className="relative z-10 p-6 pointer-events-none">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {interactiveGoods.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onSelectProduct(item)}
                className="pointer-events-auto cursor-pointer group glass-panel-glow p-4 rounded-2xl border border-white/10 hover:border-purple-500/60 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono border border-purple-500/30">
                    {item.tag}
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                </div>

                <div className="flex items-center gap-3 my-2">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="mono-font text-xs font-semibold text-cyan-400">
                      {item.price}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {item.desc}
                </p>

                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-purple-300 group-hover:text-white">
                  <span>CLICK OBJECT / MODAL</span>
                  <span>CAFE24 ORDER →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
