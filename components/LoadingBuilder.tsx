import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface LoadingBuilderProps {
  onComplete: () => void;
  lang: Language;
}

const LoadingBuilder: React.FC<LoadingBuilderProps> = ({ onComplete, lang }) => {
  const t = TRANSLATIONS[lang];
  const [text, setText] = useState(t.loading1);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => { setText(t.loading2); setPercent(45); }, 2000);
    const t2 = setTimeout(() => { setText(t.loading3); setPercent(80); }, 4500);
    const t3 = setTimeout(() => { setPercent(100); onComplete(); }, 6500);

    const interval = setInterval(() => {
      setPercent(p => Math.min(p + 1, 99));
    }, 60);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
    };
  }, [onComplete, t]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 animate-fade-in text-center">
      <div className="relative w-40 h-40 mb-10">
        <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-brand-lime rounded-full animate-spin"></div>
        <div className="absolute inset-4 bg-brand-lime/10 rounded-full animate-pulse flex items-center justify-center">
          <span className="text-2xl font-bold text-brand-lime">{Math.floor(percent)}%</span>
        </div>
      </div>

      <h2 className="text-xl font-medium mb-2 animate-pulse">{text}</h2>
      <p className="text-gray-500 text-sm">{t.aiProcessing}</p>
    </div>
  );
};

export default LoadingBuilder;
