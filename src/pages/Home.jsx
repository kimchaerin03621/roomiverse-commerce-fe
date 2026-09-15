import React, { useState } from 'react';
import ParallaxIntro from '../components/ParallaxIntro';
import PartyRoom3D from '../components/PartyRoom3D';
import ProductModal from '../components/ProductModal';

export default function Home({ setIsDarkBackground }) {
  const [phase, setPhase] = useState(1); // 1: Parallax Intro, 2: Zoom-in Transition, 3: 3D Shop Scene Active
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Trigger Phase 1 -> Phase 2 zoom in transition
  const handleContainerClick = () => {
    setPhase(2);
    // After zoom animation completes, switch to Spline 3D Scene phase 3
    setTimeout(() => {
      setPhase(3);
      if (setIsDarkBackground) setIsDarkBackground(true);
    }, 1200);
  };

  const handleBackToIntro = () => {
    setPhase(1);
    if (setIsDarkBackground) setIsDarkBackground(false);
    setSelectedProduct(null);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950">
      {/* PHASE 1 & PHASE 2 (Zoom Animation wrapper) */}
      {phase !== 3 && (
        <div
          className={`w-full h-full transition-all duration-1000 ease-in-out transform ${
            phase === 2 ? 'scale-[2.8] opacity-0 blur-md pointer-events-none' : 'scale-100 opacity-100'
          }`}
        >
          <ParallaxIntro onContainerClick={handleContainerClick} />
        </div>
      )}

      {/* PHASE 3 (Spline 3D Interactive Shop Space) */}
      {phase === 3 && (
        <div className="w-full h-full animate-fade-in">
          <PartyRoom3D
            onSelectProduct={(product) => setSelectedProduct(product)}
            onBackToIntro={handleBackToIntro}
          />
        </div>
      )}

      {/* PHASE 3 PRODUCT MODAL (Cafe24 Iframe Popup) */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
