import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../content/locale';
import { LanguageContext } from '../contexts/LanguageContext';
import './GNB.css';

export default function GNB() {
  const location = useLocation();
  const { content } = useContext(LanguageContext);

  const isHome = location.pathname === '/';
  return (
    <header 
      className={`gnb ${isHome ? 'gnb--home' : 'gnb--page'}`}
    >
      <div className="gnb__inner">
        <nav className="gnb__nav">
          {NAV_ITEMS.map((link) => {
            return (
              <Link
                key={link.path}
                to={link.path}
                className="gnb__link"
              >
                {content.nav[link.key]}
              </Link>
            );
          })}
        </nav>

        <Link
          to="/"
          className="gnb__logo"
        >
          <img
            src="/logo1.png"
            alt="ROOMIROOMI"
            className="gnb__logo-image"
          />
        </Link>
      </div>
    </header>
  );
}
