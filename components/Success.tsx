import React from 'react';
import { Check } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import Button from './Button';

interface SuccessProps {
  lang: Language;
}

const Success: React.FC<SuccessProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="w-20 h-20 bg-brand-lime rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgb(var(--brand-lime)/0.5)]">
        <Check size={40} className="text-brand-dark" strokeWidth={3} />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">{t.successTitle}</h1>
      <p className="text-gray-400 mb-10">{t.successSub}</p>

      <div className="w-full space-y-4">
        <Button variant="primary" onClick={() => window.open('https://onelink.to/fitrow', '_blank')}>{t.download}</Button>
        {/* <Button variant="secondary">{t.goToLogin}</Button> */}
      </div>
    </div>
  );
};

export default Success;
