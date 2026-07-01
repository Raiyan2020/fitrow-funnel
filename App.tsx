import React, { useState, useEffect } from 'react';
import { Step, Language, UserState } from './types';
import { QUESTIONS } from './constants';
import Splash from './components/Splash';
import Landing from './components/Landing';
import GenderSelect from './components/GenderSelect';
import Quiz from './components/Quiz';
import LoadingBuilder from './components/LoadingBuilder';
import Offer from './components/Offer';
import Checkout from './components/Checkout';
import Success from './components/Success';
import { trackEvent } from './utils/analytics';
import { getPackages, Package } from './api';

// --- Main App Component ---

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [step, setStep] = useState<Step>(Step.SPLASH);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState('50');
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);

  useEffect(() => {
    let active = true;
    getPackages(1, lang)
      .then((res) => {
        if (active && res.status) {
          setPackages(res.data);
          const list = res.data.filter(p => p.coach === 1 && p.duration !== '1');
          const threeMonthPlan = list.find(p => p.duration === '91' || p.duration === '90');
          if (threeMonthPlan) {
            setSelectedPlanId(String(threeMonthPlan.id));
          } else if (list.length > 0) {
            setSelectedPlanId(String(list[0].id));
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load packages:', err);
      })
      .finally(() => {
        if (active) {
          setIsLoadingPackages(false);
        }
      });
    return () => {
      active = false;
    };
  }, [lang]);
  
  // Initialize state with persistence
  const [userState, setUserState] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem('fitrow_user_state');
      return saved ? JSON.parse(saved) : {
        answers: {},
        gender: null,
        name: '',
        phone: ''
      };
    } catch {
      return { answers: {}, gender: null, name: '', phone: '' };
    }
  });

  // Persist state updates
  useEffect(() => {
    localStorage.setItem('fitrow_user_state', JSON.stringify(userState));
  }, [userState]);

  // Dynamic Theme Switching based on Gender
  useEffect(() => {
    const root = document.documentElement;
    if (userState.gender === 'female') {
      // Pink Theme (#FFC8FD -> 255 200 253)
      root.style.setProperty('--brand-lime', '255 200 253');
      root.style.setProperty('--brand-lime-hover', '250 167 248'); 
    } else {
      // Lime Theme (#d0fd7c -> 208 253 124)
      root.style.setProperty('--brand-lime', '208 253 124');
      root.style.setProperty('--brand-lime-hover', '180 230 110');
    }
  }, [userState.gender]);

  // Analytics helper
  const nextStep = (next: Step) => {
    trackEvent('view_step', { step: next });
    setStep(next);
  };

  // Handlers
  const handleGenderSelect = (gender: 'male' | 'female') => {
    setUserState(prev => ({ ...prev, gender }));
    nextStep(Step.QUIZ);
  };

  const handleQuizAnswer = (questionId: number, value: any, label: string) => {
    trackEvent('quiz_answer', { questionId, value });
    setUserState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: { questionId, value, label } }
    }));

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      nextStep(Step.LOADING);
    }
  };

  const handleQuizBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      setStep(Step.GENDER);
    }
  };

  return (
    <div 
      className={`h-full min-h-[100dvh] w-full flex justify-center items-center bg-zinc-950 text-white ${lang === 'ar' ? 'font-alexandria' : 'font-sans'}`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{ minHeight: '-webkit-fill-available' }}
    >
      {/* Mobile Wrapper */}
      <div className="w-full max-w-[430px] h-full md:h-[850px] md:max-h-[90vh] bg-brand-dark md:rounded-[3rem] md:border-[8px] md:border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* Top Bar (Language & Logo) */}
        {step > Step.SPLASH && step < Step.SUCCESS && (
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 pointer-events-none">
             <div className="pointer-events-auto opacity-100 transition-opacity duration-500">
               <img src="https://raiyansoft.com/wp-content/uploads/2026/01/App-icon-s.png" alt="FitRow" className="w-10 h-10 rounded-xl shadow-lg border border-white/10" />
             </div>
             <button 
               onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')}
               className="pointer-events-auto px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase hover:bg-white/10 transition-colors backdrop-blur-md"
             >
               {lang === 'en' ? 'AR' : 'EN'}
             </button>
          </div>
        )}

        {/* Dynamic Step Content */}
        <div className="flex-1 relative min-h-0 overflow-hidden">
          {step === Step.SPLASH && <Splash lang={lang} onComplete={() => nextStep(Step.LANDING)} />}
          {step === Step.LANDING && <Landing lang={lang} onNext={() => nextStep(Step.GENDER)} />}
          {step === Step.GENDER && <GenderSelect lang={lang} onSelect={handleGenderSelect} />}
          {step === Step.QUIZ && (
            <Quiz 
              lang={lang} 
              questionIndex={currentQuestionIndex} 
              onAnswer={handleQuizAnswer} 
              onBack={handleQuizBack} 
            />
          )}
          {step === Step.LOADING && <LoadingBuilder lang={lang} onComplete={() => nextStep(Step.OFFER)} />}
          {step === Step.OFFER && (
            <Offer
              lang={lang}
              userState={userState}
              packages={packages}
              isLoadingPackages={isLoadingPackages}
              onUnlock={(planId) => {
                setSelectedPlanId(planId);
                nextStep(Step.CHECKOUT);
              }}
            />
          )}
          {step === Step.CHECKOUT && (
            <Checkout
              lang={lang}
              selectedPlanId={selectedPlanId}
              userState={userState}
              packages={packages}
              onBack={() => nextStep(Step.OFFER)}
              onSuccess={(token) => {
                setUserState(prev => ({ ...prev, authToken: token }));
                trackEvent('purchase_success');
                nextStep(Step.SUCCESS);
              }}
            />
          )}
          {step === Step.SUCCESS && <Success lang={lang} />}
        </div>
        
      </div>
    </div>
  );
};

export default App;