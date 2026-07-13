import React, { useState, useEffect } from 'react';
import { Timer, Lock, Loader2 } from 'lucide-react';
import { UserState, Language } from '../types';
import { QUESTIONS, TRANSLATIONS } from '../constants';
import { Package } from '../api';
import Button from './Button';

interface OfferProps {
  userState: UserState;
  lang: Language;
  packages: Package[];
  isLoadingPackages: boolean;
  onUnlock: (planId: string) => void;
}

const HINTS_EN = [
  "Did you know? Consistent hydration increases metabolic rate by up to 30%.",
  "Tip: Exercising at the same time every day builds stronger habits.",
  "Hint: Most users select the 3-Month plan for the best balance of speed & results.",
  "Tip: Muscle mass weighs more than fat, so focus on how your clothes fit rather than just the scale!",
  "Fun Fact: Getting 7-8 hours of sleep is critical for fat loss and muscle recovery."
];

const HINTS_AR = [
  "هل تعلم؟ الترطيب المستمر يزيد من معدل الأيض بنسبة تصل إلى 30%.",
  "نصيحة: ممارسة الرياضة في نفس الوقت يومياً تبني عادات أقوى.",
  "تلميح: يختار معظم المستخدمين خطة الـ 3 أشهر للحصول على أفضل توازن بين السرعة والنتائج.",
  "نصيحة: تزن الكتلة العضلية أكثر من الدهون، لذا ركز على ملاءمة ملابسك بدلاً من الميزان فقط!",
  "حقيقة ممتعة: الحصول على 7-8 ساعات من النوم أمر بالغ الأهمية لخسارة الدهون واستشفاء العضلات."
];

const Offer: React.FC<OfferProps> = ({
  userState,
  lang,
  packages,
  isLoadingPackages,
  onUnlock,
}) => {
  const t = TRANSLATIONS[lang];
  const [selectedPlan, setSelectedPlan] = useState('50');
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [hint, setHint] = useState('');

  useEffect(() => {
    const list = lang === 'ar' ? HINTS_AR : HINTS_EN;
    const randomIndex = Math.floor(Math.random() * list.length);
    setHint(list[randomIndex]);
  }, [lang]);

  useEffect(() => {
    if (packages.length > 0) {
      const threeMonthPlan = packages.find(p => p.id === 50 || p.id === 49);
      if (threeMonthPlan) {
        setSelectedPlan(String(threeMonthPlan.id));
      } else {
        setSelectedPlan(String(packages[0].id));
      }
    }
  }, [packages]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getOptionLabel = (qId: number, value: any, fallback: string) => {
    const q = QUESTIONS.find((q) => q.id === qId);
    if (!q?.options) return fallback;
    const opt = q.options.find((o) => o.value === value);
    if (!opt) return fallback;
    return lang === 'en' ? opt.labelEn : opt.labelAr;
  };

  const goalValue = userState.answers[8]?.value || 'lose_weight';
  const goalLabel = getOptionLabel(8, goalValue, lang === 'en' ? 'Lose Weight' : 'إنقاص الوزن');

  const bodyTypeValue = userState.answers[5]?.value || 'regular';
  const bodyTypeLabel = getOptionLabel(5, bodyTypeValue, lang === 'en' ? 'Regular' : 'عادي');

  const h = (userState.answers[2]?.value as number || 170) / 100;
  const w = userState.answers[3]?.value as number || 70;
  const bmiVal = w / (h * h);
  const bmi = bmiVal.toFixed(1);
  const displayBmi = isNaN(parseFloat(bmi)) ? '24.5' : bmi;

  const getBmiStatus = () => {
    const val = parseFloat(displayBmi);
    if (val < 18.5) return t.underweight;
    if (val < 25) return t.normal;
    if (val < 30) return t.overweight;
    return t.obese;
  };

  const getPackageMetadata = (duration: string) => {
    switch (duration) {
      case '30':
        return {
          labelEn: 'Monthly',
          labelAr: 'شهري',
          tagEn: '',
          tagAr: '',
        };
      case '91':
      case '90':
        return {
          labelEn: '3 Months',
          labelAr: '3 أشهر',
          tagEn: 'Most Popular',
          tagAr: 'الأكثر شيوعاً',
        };
      case '182':
      case '180':
        return {
          labelEn: '6 Months',
          labelAr: '6 أشهر',
          tagEn: 'Save More',
          tagAr: 'وفر أكثر',
        };
      case '365':
        return {
          labelEn: 'Yearly',
          labelAr: 'سنوي',
          tagEn: 'Best Deal',
          tagAr: 'أفضل عرض',
        };
      default:
        return {
          labelEn: `${duration} Days`,
          labelAr: `${duration} يوم`,
          tagEn: '',
          tagAr: '',
        };
    }
  };

  const displayPackages = packages;

  return (
    <div className="h-full flex flex-col animate-fade-in relative">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-48 h-48 opacity-[0.04] pointer-events-none z-0">
        <img src="https://raiyansoft.com/wp-content/uploads/2026/01/App-icon-s.png" className="w-full h-full object-contain" alt="" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 relative z-10 pt-8" style={{ paddingBottom: 'calc(120px + env(safe-area-inset-bottom))' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-1">{t.planReady}</h1>
          <p className="text-gray-400 text-sm">{t.successSub}</p>

          {/* Enhanced Urgency Section */}
          <div className="mt-5 flex items-center justify-center animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-lime blur-xl opacity-20 animate-pulse"></div>
              <div className="relative flex items-center gap-3 text-brand-lime drop-shadow-[0_0_8px_rgb(var(--brand-lime)/0.4)]">
                <Timer size={26} strokeWidth={2.5} className="animate-pulse" />
                <span className="text-lg md:text-xl font-bold tracking-tight">
                  {t.offerTimer} <span className="text-2xl md:text-3xl font-black tabular-nums">{formatTime(timeLeft)}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border-l-4 border-l-brand-lime shadow-[0_0_20px_rgb(var(--brand-lime)/0.4)]">
          <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-4 font-bold">{t.planSummary}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs">{t.goalLabel}</p>
              <p className="font-semibold text-white line-clamp-1">{goalLabel}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">{t.bodyTypeLabel}</p>
              <p className="font-semibold text-white">{bodyTypeLabel}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">{t.bmi}</p>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-brand-lime">{displayBmi}</p>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 whitespace-nowrap">{getBmiStatus()}</span>
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-xs">{t.successRate}</p>
              <p className="font-semibold text-white">89%</p>
            </div>
          </div>
        </div>

        {hint && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3 text-xs leading-relaxed text-gray-400 text-start">
            <span className="text-brand-lime font-bold uppercase shrink-0">💡 {lang === 'ar' ? 'نصيحة اليوم:' : 'Daily Tip:'}</span>
            <span>{hint}</span>
          </div>
        )}

        {isLoadingPackages ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-brand-lime">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-xs text-gray-500">{lang === 'ar' ? 'جاري تحميل الباقات...' : 'Loading packages…'}</p>
          </div>
        ) : (
          <div className="space-y-3 pb-24">
            {displayPackages.map(pkg => {
              const isSelected = selectedPlan === String(pkg.id);
              const meta = getPackageMetadata(pkg.duration);
              const labelText = pkg.name || (lang === 'ar' ? meta.labelAr : meta.labelEn);
              const dailyCostText = pkg.details || (lang === 'ar' ? `تكلفة اليوم الواحد ${(parseFloat(pkg.price) / (parseInt(pkg.duration) || 30)).toFixed(2)}$` : `$${(parseFloat(pkg.price) / (parseInt(pkg.duration) || 30)).toFixed(2)} per day`);
              const tagText = pkg.title || (lang === 'ar' ? meta.tagAr : meta.tagEn);
              const originalPrice = lang === 'ar' ? `${pkg.price}$` : `$${pkg.price}`;
              const discountedPrice = pkg.discount != null ? (lang === 'ar' ? `${pkg.discount}$` : `$${pkg.discount}`) : null;

              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPlan(String(pkg.id))}
                  className={`
                      relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between
                      ${isSelected
                      ? 'bg-brand-lime/10 border-brand-lime'
                      : 'bg-white/5 border-transparent opacity-80 hover:opacity-100'}
                   `}
                >
                  {tagText && (
                    <div className="absolute -top-3 right-4 bg-brand-lime text-brand-dark text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider shadow-lg">
                      {tagText}
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-brand-lime' : 'border-gray-500'}`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand-lime" />}
                    </div>
                    {pkg.image && (
                      <img src={pkg.image} alt={labelText} className="w-10 h-10 object-contain rounded bg-white/10 p-0.5 shrink-0" />
                    )}
                    <div className="text-start">
                      <p className={`font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>{labelText}</p>
                      <p className={`text-xs mt-0.5 ${isSelected ? 'text-brand-lime' : 'text-gray-500'}`}>{dailyCostText}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {discountedPrice ? (
                      <>
                        <p className="text-sm font-semibold text-gray-500 line-through">{originalPrice}</p>
                        <p className="text-xl font-bold text-white">{discountedPrice}</p>
                      </>
                    ) : (
                      <p className="text-xl font-bold text-white">{originalPrice}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-brand-dark via-brand-dark/95 to-transparent z-20 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <Button onClick={() => onUnlock(selectedPlan)} className="w-full text-xl shadow-[0_0_20px_rgb(var(--brand-lime)/0.4)] animate-pulse-fast">
          {t.unlockPlan}
        </Button>
        <div className="flex justify-center items-center gap-2 text-xs text-gray-500 mt-4">
          <Lock size={12} /> {t.paymentSecure}
        </div>
      </div>
    </div>
  );
};

export default Offer;
