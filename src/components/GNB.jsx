import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { NAV_ITEMS } from '../content/locale';
import { LanguageContext } from '../contexts/LanguageContext';

export default function GNB() {
  const location = useLocation();
  const { content } = useContext(LanguageContext);

  // Check route path: white wireframe pages vs dark intro
  const isWhitePage = location.pathname !== '/';

  return (
    <header 
      className="fixed top-0 left-0 w-full z-50 transition-all duration-300 pointer-events-none bg-transparent"
      style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '16px' }}
    >
      <div className="w-full grid grid-cols-3 items-center">
        {/* Left Navigation Links: About, Culture, Reservation */}
        <nav className="pointer-events-auto flex items-center gap-8 justify-start">
          {NAV_ITEMS.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-sans tracking-tight transition-colors duration-300 font-semibold ${
                  isWhitePage
                    ? isActive
                      ? 'text-black border-b-2 border-black pb-0.5'
                      : 'text-black/70 hover:text-black'
                    : isActive
                      ? 'text-white border-b-2 border-white pb-0.5'
                      : 'text-white/90 hover:text-white'
                }`}
              >
                {content.nav[link.key]}
              </Link>
            );
          })}
        </nav>

        {/* Center Brand Logo: ROOMIROOMI */}
        <div className="flex justify-center items-center">
          <Link
            to="/"
            className="pointer-events-auto inline-flex items-center justify-center cursor-pointer"
          >
            <img
              src="/logo1.png"
              alt="ROOMIROOMI"
              style={{ width: '180px', height: '27px' }}
              className={`object-contain transition-all duration-300 ${
                isWhitePage ? '' : 'brightness-0 invert'
              }`}
            />
          </Link>
        </div>

        {/* Right Shopping Cart Icon Slot */}
        <div className="flex items-center justify-end pointer-events-auto">
          <button
            className={`p-2 rounded-full transition-colors duration-300 ${
              isWhitePage ? 'text-black hover:bg-neutral-100' : 'text-white hover:bg-white/10'
            }`}
            title={content.nav.cart}
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
