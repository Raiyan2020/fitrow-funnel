import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { trackEvent } from '../utils/analytics';

interface DatePickerProps {
  lang: Language;
  onChange: (val: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ lang, onChange }) => {
  const t = TRANSLATIONS[lang];

  const monthsList = lang === 'ar'
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const currentYear = new Date().getFullYear();
  const yearsList = Array.from({ length: 100 }, (_, i) => currentYear - 14 - i);

  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [activePicker, setActivePicker] = useState<'month' | 'year' | null>(null);

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      onChange(`${selectedYear}-${selectedMonth.padStart(2, '0')}`);
    }
  }, [selectedMonth, selectedYear, onChange]);

  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll selected element to center when opening picker
  useEffect(() => {
    if (activePicker) {
      setTimeout(() => {
        if (listRef.current) {
          const selectedEl = listRef.current.querySelector('[data-selected="true"]');
          if (selectedEl) {
            selectedEl.scrollIntoView({ block: 'center', behavior: 'auto' });
          }
        }
      }, 50);
    }
  }, [activePicker]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePicker(null);
    };
    if (activePicker) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePicker]);

  return (
    <div className="flex flex-col gap-5 w-full max-w-sm mx-auto" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="grid grid-cols-2 gap-4">
        {/* Month Picker Trigger */}
        <button
          type="button"
          onClick={() => setActivePicker('month')}
          className={`flex items-center justify-between w-full p-4 rounded-2xl border transition-all duration-300
            ${activePicker === 'month' ? 'border-brand-lime bg-white/10' : 'border-white/10 bg-white/5'} hover:bg-white/10`}
        >
          <span className={`text-sm md:text-base font-alexandria font-medium truncate ${selectedMonth ? 'text-white' : 'text-gray-400'}`}>
            {selectedMonth ? monthsList[parseInt(selectedMonth) - 1] : t.month}
          </span>
          <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${activePicker === 'month' ? 'rotate-180 text-brand-lime' : 'text-gray-400'}`} />
        </button>

        {/* Year Picker Trigger */}
        <button
          type="button"
          onClick={() => setActivePicker('year')}
          className={`flex items-center justify-between w-full p-4 rounded-2xl border transition-all duration-300
            ${activePicker === 'year' ? 'border-brand-lime bg-white/10' : 'border-white/10 bg-white/5'} hover:bg-white/10`}
        >
          <span className={`text-sm md:text-base font-alexandria font-medium truncate ${selectedYear ? 'text-white' : 'text-gray-400'}`}>
            {selectedYear ? selectedYear : t.year}
          </span>
          <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${activePicker === 'year' ? 'rotate-180 text-brand-lime' : 'text-gray-400'}`} />
        </button>
      </div>

      {activePicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setActivePicker(null)}
          />

          {/* Modal/Bottom Sheet */}
          <div className="relative w-full max-w-sm sm:max-h-[60vh] h-[55vh] flex flex-col bg-[#0a0a0a] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up sm:animate-fade-in overflow-hidden glass-panel">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 shrink-0 z-20">
              <span className="font-alexandria font-bold text-white tracking-wider px-2">
                {activePicker === 'month' ? t.month : t.year}
              </span>
              <button
                type="button"
                onClick={() => setActivePicker(null)}
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="relative flex-1 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#0a0a0a] to-transparent pointer-events-none z-10" />
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none z-10" />

              <div ref={listRef} className="h-full overflow-y-auto no-scrollbar py-6 px-4 pb-20">
                <div className="space-y-2">
                  {activePicker === 'month' && monthsList.map((monthName, idx) => {
                    const monthVal = String(idx + 1);
                    const isSelected = selectedMonth === monthVal;
                    return (
                      <button
                        key={monthVal}
                        type="button"
                        data-selected={isSelected}
                        onClick={() => {
                          setSelectedMonth(monthVal);
                          setActivePicker(null);
                          trackEvent('dob_month_select', { monthVal });
                        }}
                        className={`w-full flex items-center justify-center p-4 rounded-xl transition-all duration-300
                          ${isSelected
                            ? 'bg-brand-lime text-brand-dark font-black scale-[1.02] shadow-[0_0_15px_rgb(var(--brand-lime)/0.3)]'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
                          }
                        `}
                      >
                        <div className="inline-flex items-center justify-center gap-2">
                          <span className="font-alexandria text-sm">{monthName}</span>
                          <span className="opacity-50 text-xs">{idx + 1}</span>
                        </div>
                      </button>
                    );
                  })}

                  {activePicker === 'year' && yearsList.map((y) => {
                    const yearVal = String(y);
                    const isSelected = selectedYear === yearVal;
                    return (
                      <button
                        key={yearVal}
                        type="button"
                        data-selected={isSelected}
                        onClick={() => {
                          setSelectedYear(yearVal);
                          setActivePicker(null);
                          trackEvent('dob_year_select', { yearVal });
                        }}
                        className={`w-full py-4 text-center font-alexandria text-sm rounded-xl transition-all duration-300
                          ${isSelected
                            ? 'bg-brand-lime text-brand-dark font-black scale-[1.02] shadow-[0_0_15px_rgb(var(--brand-lime)/0.3)]'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
                          }
                        `}
                      >
                        {yearVal}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected DOB helper badge */}
      {(selectedYear && selectedMonth) && (
        <div className="text-center mt-2 text-xs text-gray-400 select-none animate-fade-in">
          {lang === 'ar' ? (
            <span>تاريخ الميلاد المختار: <strong className="text-brand-lime font-alexandria text-sm mx-1">{selectedYear}/{selectedMonth.padStart(2, '0')}</strong></span>
          ) : (
            <span>Selected Date: <strong className="text-brand-lime text-sm mx-1">{selectedMonth.padStart(2, '0')}/{selectedYear}</strong></span>
          )}
        </div>
      )}
    </div>
  );
};

export default DatePicker;
