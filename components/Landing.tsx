import React from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import Button from './Button';

interface LandingProps {
  onNext: () => void;
  lang: Language;
}

const Landing: React.FC<LandingProps> = ({ onNext, lang }) => {
  const t = TRANSLATIONS[lang];
  const bullets = [
    t.landingBullet1,
    t.landingBullet2,
    t.landingBullet3,
    t.landingBullet4,
    t.landingBullet5,
  ];

  return (
    <div className="h-full flex flex-col p-6 animate-fade-in justify-between">
      <div className="flex-1 flex flex-col justify-center items-center text-center">
        <div className="relative w-20 h-20 mb-6 rounded-2xl border border-white/10 flex items-center justify-center">
          {/* Outer large soft glowing layer with breathing + drift */}
          <div className="absolute top-1/2 left-1/2 w-36 h-36 animate-outer-drift">
            <div className="w-full h-full bg-brand-lime/25 rounded-full animate-outer-glow"></div>
          </div>
          {/* Inner bright tight glowing layer with high intensity */}
          <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-brand-lime/50 rounded-full animate-inner-glow"></div>

          <img
            src="https://raiyansoft.com/wp-content/uploads/2026/01/App-icon-s.png"
            alt="FitRow Logo"
            className="relative w-full h-full object-contain rounded-2xl z-10"
          />
        </div>
        <h1 className="text-lg md:text-xl font-medium mb-5 leading-normal max-w-sm px-2">
          {t.landingHeadline.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < t.landingHeadline.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </h1>
        <div className="space-y-2 w-full max-w-xs">
          {bullets.map((text, i) => (
            <div key={i} className="flex items-center gap-3 py-2 px-3.5 rounded-lg bg-white/5 border border-white/5 w-full">
              <div className="w-6 h-6 rounded-full bg-brand-lime/20 flex items-center justify-center shrink-0">
                <Check size={14} className="text-brand-lime" />
              </div>
              <span className="text-gray-200 font-medium text-xs md:text-sm text-start leading-tight w-full">
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-1">
          <ShieldCheck size={12} /> {t.landingTrust}
        </p>
        <Button onClick={onNext} className="animate-pulse-fast">{t.ctaStart}</Button>
      </div>
    </div>
  );
};

export default Landing;
