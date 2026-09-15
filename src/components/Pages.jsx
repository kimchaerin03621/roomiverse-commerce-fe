import React from 'react';
import { Link } from 'react-router-dom';

/* ABOUT PAGE: Exact Wireframe Layout matching user screenshot */
export function AboutPage() {
  const sections = [
    { title: 'Mission & Vision' },
    { title: 'Brand Story' },
    { title: 'Core Value' },
    { title: 'What We Do' },
  ];

  return (
    <div className="page-container bg-white text-black pb-28 select-none">
      <div className="w-full flex flex-col">
        {sections.map((sec, idx) => (
          <div
            key={idx}
            className="w-full flex flex-col"
            style={idx > 0 ? { marginTop: '100px' } : {}}
          >
            <h2 className="text-sm font-bold text-black tracking-tight mb-3">{sec.title}</h2>
            {/* Wireframe Placeholder Box with X Diagonals (Exact Full Width) */}
            <div className="relative w-full h-[320px] sm:h-[420px] bg-[#e2e2e2] border border-neutral-300 overflow-hidden">
              <svg className="w-full h-full stroke-neutral-400 stroke-[0.75]" viewBox="0 0 1000 500" preserveAspectRatio="none">
                <line x1="0" y1="0" x2="1000" y2="500" />
                <line x1="1000" y1="0" x2="0" y2="500" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* CULTURE PAGE: Wireframe Clean Canvas Layout */
export function CulturePage() {
  return (
    <div className="w-full min-h-screen bg-white text-black pt-24 pb-20 px-8 flex items-center justify-center">
      <div className="max-w-6xl w-full h-[600px] border border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center text-neutral-400 space-y-2">
        <span className="text-xs font-mono">CULTURE WIREFRAME CANVAS</span>
      </div>
    </div>
  );
}

/* RESERVATION PAGE: Wireframe Clean Canvas Layout */
export function ReservationPage() {
  return (
    <div className="w-full min-h-screen bg-white text-black pt-24 pb-20 px-8 flex items-center justify-center">
      <div className="max-w-6xl w-full h-[600px] border border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center text-neutral-400 space-y-2">
        <span className="text-xs font-mono">RESERVATION WIREFRAME CANVAS</span>
      </div>
    </div>
  );
}

