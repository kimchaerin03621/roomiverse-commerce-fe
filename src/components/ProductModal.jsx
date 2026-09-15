import React, { useState } from 'react';
import { X, ShoppingBag, CreditCard, Lock, Sparkles, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProductModal({ product, onClose }) {
  const [activeTab, setActiveTab] = useState('iframe'); // 'iframe' | 'details'
  const [orderSuccess, setOrderSuccess] = useState(false);

  if (!product) return null;

  const handleSimulatedCheckout = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    setOrderSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-fade-in">
      {/* Background Dim Backdrop Click to Close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Basement.studio style Floating Modal Container */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-slate-950 border border-purple-500/40 rounded-3xl shadow-[0_0_80px_rgba(112,0,255,0.4)] flex flex-col overflow-hidden animate-scale-up">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-400 flex items-center justify-center text-purple-300">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="mono-font text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                  CAFE24 E-COMMERCE MODAL
                </span>
                <span className="px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-mono">
                  HTTPS ENCRYPTED
                </span>
              </div>
              <h3 className="brand-font text-base font-bold text-white leading-tight">
                {product.name}
              </h3>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cafe24 Tab Bar Controls */}
        <div className="px-6 py-2 bg-slate-950 border-b border-white/5 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('iframe')}
              className={`px-4 py-1.5 rounded-lg transition-colors ${
                activeTab === 'iframe'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cafe24 Web View (<iframe />)
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-1.5 rounded-lg transition-colors ${
                activeTab === 'details'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Product Spec & Shipping
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-500">
            <Lock className="w-3.5 h-3.5 text-green-400" />
            <span>CAFE24 PG API Connected</span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[400px]">
          {orderSuccess ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-green-400 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="brand-font text-2xl font-bold text-white">
                파티 배달 주문 접수가 완료되었습니다!
              </h3>
              <p className="text-sm text-slate-300 max-w-md">
                카페24 결제 인프라를 통해 안전하게 결제가 처리되었습니다. 지정하신 파티 장소로 전문 기사님이 신속 배송해 드립니다.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs tracking-wider uppercase hover:opacity-90 transition-opacity"
              >
                닫기 및 쇼핑 계속하기
              </button>
            </div>
          ) : activeTab === 'iframe' ? (
            <div className="w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-white/10 bg-slate-900/50 flex flex-col">
              {/* Simulated Cafe24 Iframe Wrapper with Live Interactivity */}
              <div className="p-3 bg-slate-900 border-b border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="truncate max-w-md text-cyan-300">
                  https://mall.cafe24.com/product/detail.html?product_no=10294
                </span>
                <span className="flex items-center gap-1 text-purple-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Cafe24 PG Safe
                </span>
              </div>

              {/* Iframe Viewport Area */}
              <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div className="w-full h-56 rounded-2xl bg-gradient-to-tr from-purple-900/40 via-indigo-900/30 to-slate-900 border border-purple-500/30 flex items-center justify-center p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-2xl animate-float">
                      {React.createElement(product.icon || ShoppingBag, { className: "w-12 h-12" })}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>CATEGORY: {product.category}</span>
                    <span>DELIVERY: 당일 특송</span>
                  </div>
                </div>

                <div className="space-y-4 text-left">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 text-[10px] font-mono">
                      {product.tag}
                    </span>
                    <h2 className="brand-font text-2xl font-bold text-white mt-1">
                      {product.name}
                    </h2>
                    <p className="mono-font text-xl font-bold text-cyan-400 mt-2">
                      {product.price}
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {product.desc}
                  </p>

                  <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>카페24 장바구니 연동</span>
                      <span className="text-green-400 font-mono">정상 작동 중</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>파티 장소 배송</span>
                      <span className="text-cyan-400 font-mono">실시간 위치 추적</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleSimulatedCheckout}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-900/50 hover:brightness-110 transition-all flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      카페24 주문/결제하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-left p-4">
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <h4 className="brand-font text-lg font-bold text-cyan-300">
                  하이엔드 파티 배달 서비스 안내
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  본 서비스는 2.5D/3D 프론트엔드 공간 인터랙션을 거쳐 구매 의사 결정 후, 주문 및 결제 단계에서 카페24의 검증된 PG 결제 시스템으로 이관되는 하이브리드 커머스 아키텍처로 구현되었습니다.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-slate-400">
                  <div className="p-3 bg-white/5 rounded-xl">
                    <span className="text-purple-300 block mb-1">보안 프로세스</span>
                    Cross-Origin Cookie & SSL 연동 검증 완료
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <span className="text-cyan-300 block mb-1">배송 옵션</span>
                    당일 2시간 이내 팝업 딜리버리
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-900/80 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="mono-font text-[10px]">Google Antigravity x Cafe24 Hybrid Commerce</span>
          <button
            onClick={onClose}
            className="text-xs text-purple-300 hover:text-white underline font-mono"
          >
            Close Modal [ESC]
          </button>
        </div>

      </div>
    </div>
  );
}
