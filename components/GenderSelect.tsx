import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface GenderSelectProps {
  onSelect: (gender: 'male' | 'female') => void;
  lang: Language;
}

const GenderSelect: React.FC<GenderSelectProps> = ({ onSelect, lang }) => {
  const [selected, setSelected] = useState<'male' | 'female' | null>(null);
  const t = TRANSLATIONS[lang];

  const handleSelect = (gender: 'male' | 'female') => {
    setSelected(gender);
    // Short delay to show visual feedback before auto-advancing
    setTimeout(() => {
      onSelect(gender);
    }, 250);
  };

  return (
    <div className="h-full flex flex-col p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => {}} className="p-2 -ml-2 text-transparent cursor-default">
          <ChevronLeft />
        </button>
      </div>

      <h2 className="text-2xl font-bold text-center mb-10 uppercase">{t.genderSelect}</h2>

      <div className="flex-1 flex flex-col justify-center items-center gap-12">
        {[
          { id: 'male', label: t.man, icon: "https://i.imgur.com/XTPbBTt.png" },
          { id: 'female', label: t.woman, icon: "https://i.imgur.com/a2jFQZF.png" }
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleSelect(opt.id as 'male' | 'female')}
            className={`
                relative flex items-center justify-center transition-all duration-300 rounded-full
                ${selected === opt.id
                ? 'scale-110'
                : 'opacity-60 hover:opacity-90 hover:scale-105'}
            `}
          >
            <div className={`absolute inset-0 bg-brand-lime/30 blur-2xl rounded-full transition-opacity duration-300 ${selected === opt.id ? 'opacity-100' : 'opacity-0'}`}></div>
            <img src={opt.icon} alt={opt.label} className="relative w-44 h-44 object-contain z-10" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenderSelect;
