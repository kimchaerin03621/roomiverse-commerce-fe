import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GNB from './components/GNB';
import Home from './pages/Home';
import { AboutPage, CulturePage, ReservationPage } from './components/Pages';

function App() {
  const [isDarkBackground, setIsDarkBackground] = useState(false);

  return (
    <Router>
      <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-500 selection:text-white">
        {/* Global Navigation Bar - Fixed top with adaptive background contrast */}
        <GNB isDarkBackground={isDarkBackground} />

        {/* Application Routes */}
        <Routes>
          <Route path="/" element={<Home setIsDarkBackground={setIsDarkBackground} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/culture" element={<CulturePage />} />
          <Route path="/reservation" element={<ReservationPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

