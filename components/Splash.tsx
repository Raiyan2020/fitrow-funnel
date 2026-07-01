import React, { useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface SplashProps {
  onComplete: () => void;
  lang: Language;
}

const Splash: React.FC<SplashProps> = ({ onComplete, lang }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 animate-fade-in text-center">
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 bg-brand-lime/20 blur-2xl rounded-full"></div>
        <img
          src="https://raiyansoft.com/wp-content/uploads/2026/01/App-icon-s.png"
          alt="FitRow Logo"
          className="relative w-full h-full object-contain rounded-3xl shadow-[0_0_30px_rgb(var(--brand-lime)/0.3)]"
        />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">FITROW</h1>
      <p className="text-gray-400 text-lg">{TRANSLATIONS[lang].splashTagline}</p>
    </div>
  );
};

export default Splash;
