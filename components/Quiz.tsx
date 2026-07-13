import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Language } from '../types';
import { QUESTIONS, TRANSLATIONS } from '../constants';
import Button from './Button';
import ProgressBar from './ProgressBar';
import DatePicker from './DatePicker';
import MeasurementPicker from './MeasurementPicker';

interface QuizProps {
  questionIndex: number;
  onAnswer: (qId: number, val: any, label: string) => void;
  onBack: () => void;
  lang: Language;
}

const Quiz: React.FC<QuizProps> = ({
  questionIndex,
  onAnswer,
  onBack,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const question = QUESTIONS[questionIndex];
  const progress = ((questionIndex + 1) / QUESTIONS.length) * 100;

  const [tempValue, setTempValue] = useState<any>(null);

  const handleMeasurementChange = useCallback((val: number, unit: string) => {
    setTempValue({ val, unit });
  }, []);

  const handleDateChange = useCallback((val: string) => {
    setTempValue(val);
  }, []);

  useEffect(() => {
    setTempValue(null);
  }, [questionIndex]);

  const getQuestionText = (key: string) => {
    const map: any = {
      dob: t.dob,
      height: t.height,
      current_weight: t.weight,
      target_weight: t.goalWeight,
      body_type: { en: "Choose Your Body Type", ar: "اختر نوع جسمك" },
      desired_body_type: { en: "Choose Your Desired Body Type", ar: "اختر نوع الجسم المرغوب" },
      target_zone: { en: "Choose Your Target Zone", ar: "اختر المنطقة المستهدفة" },
      main_goal: { en: "Choose Main Goal", ar: "اختر الهدف الرئيسي" },
      training_goal: { en: "Choose Training Goal", ar: "اختر هدف التدريب" },
      motivation: { en: "What Motivates You to Exercise?", ar: "ما الذي يحفزك للتمرين؟" },
      fitness_level: { en: "Choose Fitness Level", ar: "اختر مستوى اللياقة" },
      walking: { en: "How Much Do You Walk Daily?", ar: "كم تمشي يومياً؟" },
      pushups: { en: "How Many Push-ups Can You Do?", ar: "كم عدد تمارين الضغط التي يمكنك القيام بها؟" },
      sedentary: { en: "Do You Live a Sedentary Lifestyle?", ar: "هل تعيش نمط حياة خامل؟" },
      water: { en: "What’s Your Water Consumption Like?", ar: "كيف هو استهلاكك للماء؟" },
      sleep: { en: "How Much Sleep Do You Get?", ar: "كم عدد ساعات نومك؟" },
      between_meals: { en: "How Do You Feel Between Meals?", ar: "كيف تشعر بين الوجبات؟" },
    };

    const entry = map[key];
    if (typeof entry === 'string') return entry;
    if (entry && typeof entry === 'object') return lang === 'ar' ? entry.ar : entry.en;
    return key;
  };

  // Shared Unified Back Button Component
  const UnifiedBackButton = () => (
    <button
      type="button"
      onClick={onBack}
      className="w-full mt-6 py-3 rounded-xl border border-brand-lime/25 text-white/75 hover:text-white hover:border-brand-lime/50 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"
    >
      {lang === 'ar' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      {t.back}
    </button>
  );

  const renderContent = () => {
    switch (question.type) {
      case 'date':
        return (
          <div className="mt-8">
            <DatePicker
              lang={lang}
              onChange={handleDateChange}
            />
            <div className="mt-8">
              <Button onClick={() => tempValue && onAnswer(question.id, tempValue, tempValue)} disabled={!tempValue}>
                {t.continue}
              </Button>
              <UnifiedBackButton />
            </div>
          </div>
        );
      case 'measurement':
        return (
          <div className="mt-8">
            <MeasurementPicker
              key={question.id}
              units={question.units || []}
              defaultUnit={question.defaultUnit || ''}
              min={question.min || 0}
              max={question.max || 100}
              defaultValue={question.defaultValue}
              onChange={handleMeasurementChange}
              lang={lang}
            />
            <div className="mt-12">
              <Button
                onClick={() => tempValue && onAnswer(question.id, tempValue.val, `${tempValue.val} ${tempValue.unit}`)}
                disabled={!tempValue}
              >
                {t.continue}
              </Button>
              <UnifiedBackButton />
            </div>
          </div>
        );
      case 'choice':
        return (
          <div className="mt-8">
            <div className="space-y-3">
              {question.options?.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onAnswer(question.id, opt.value, lang === 'ar' ? opt.labelAr : opt.labelEn)}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-brand-lime/50 hover:bg-white/10 transition-all text-left flex items-center justify-between group"
                >
                  <span className="text-lg font-medium text-gray-200 group-hover:text-white">
                    {lang === 'ar' ? opt.labelAr : opt.labelEn}
                  </span>
                  <ChevronRight className={`text-gray-600 group-hover:text-brand-lime ${lang === 'ar' ? 'rotate-180' : ''}`} />
                </button>
              ))}
            </div>
            <UnifiedBackButton />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Fixed Header Area */}
      <div className="shrink-0 px-6 pt-6 pb-2">
        <div className="relative flex items-center justify-center mb-6 min-h-[40px]">
          <button
            type="button"
            onClick={onBack}
            className={`absolute top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white ${lang === 'ar' ? '-right-2' : '-left-2'}`}
          >
            <ChevronLeft className={lang === 'ar' ? 'rotate-180' : ''} />
          </button>
          <span className="text-sm font-bold text-brand-lime">
            {lang === 'ar' ? `خطوة ${questionIndex + 1} من ${QUESTIONS.length}` : `Step ${questionIndex + 1} of ${QUESTIONS.length}`}
          </span>
        </div>
        <ProgressBar progress={progress} />
      </div>

      {/* Scrollable Content Area */}
      <div className="quizScrollArea flex-1 flex flex-col justify-between mt-4 px-6 min-h-0">
        <h2 className="text-2xl md:text-3xl font-medium my-6 leading-snug shrink-0">
          {getQuestionText(question.key)}
        </h2>
        <div className="flex flex flex-col">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
