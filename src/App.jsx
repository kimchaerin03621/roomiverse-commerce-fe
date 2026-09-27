import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GNB from './components/GNB';
import Home from './pages/Home';
import About from './pages/About';
import Culture from './pages/Culture';
import CultureDetail from './pages/CultureDetail';
import Reservation from './pages/Reservation';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  const [, setIsDarkBackground] = useState(false);

  return (
    <LanguageProvider>
      <Router>
        <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-500 selection:text-white">
          {/* Global Navigation Bar - Fixed top with adaptive background contrast */}
          <Routes>
            <Route path="/" element={<GNB />} />
            <Route path="*" element={null} />
          </Routes>

          {/* Application Routes */}
          <Routes>
            <Route path="/" element={<Home setIsDarkBackground={setIsDarkBackground} />} />
            <Route path="/about" element={<About />} />
            <Route path="/culture" element={<Culture />} />
            <Route path="/culture/:sceneId" element={<CultureDetail />} />
            <Route path="/reservation" element={<Reservation />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
