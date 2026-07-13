import React, { useState, useEffect } from 'react';
import { ChevronLeft, CreditCard, Wallet, Loader2, AlertCircle } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Language, UserState } from '../types';
import { TRANSLATIONS } from '../constants';
import { registerUser, placeOrder, RegisterPayload, OrderPayload, Package, getPaymentMethods, PaymentMethod } from '../api';
import Button from './Button';

interface CheckoutProps {
  lang: Language;
  selectedPlanId: string;
  userState: UserState;
  packages: Package[];
  onBack: () => void;
  /** Called with the auth token once both API calls succeed */
  onSuccess: (token: string) => void;
}

// ─── Utility: map quiz answers → API field values ────────────────────────────

/** Returns a string answer value for a given quiz question key */
function getAnswer(userState: UserState, key: string): string {
  const entry = Object.values(userState.answers).find(
    (a) => {
      // We map by question id via the index position set in constants
      return a.questionId !== undefined;
    }
  );
  // Actually pull by questionId → key mapping declared in constants
  void entry; // suppress unused warning
  return '';
}

/** Map questionId to quiz key (mirrors QUESTIONS array in constants.ts) */
const QUESTION_KEY_MAP: Record<number, string> = {
  1: 'dob',
  2: 'height',
  3: 'current_weight',
  4: 'target_weight',
  5: 'body_type',
  6: 'desired_body_type',
  7: 'target_zone',
  8: 'main_goal',
  9: 'training_goal',
  10: 'motivation',
  11: 'fitness_level',
  12: 'walking',
  13: 'pushups',
  14: 'sedentary',
  15: 'water',
  16: 'sleep',
  17: 'between_meals',
};

function getAnswerByKey(userState: UserState, key: string): string {
  const entry = Object.values(userState.answers).find(
    (a) => QUESTION_KEY_MAP[a.questionId] === key
  );
  return entry ? String(entry.value) : '';
}

/** Extract age in years from a dob string "YYYY-MM-DD" or year string */
function calcAge(dob: string): string {
  if (!dob) return '25';
  try {
    const year = parseInt(dob.slice(0, 4), 10);
    return String(new Date().getFullYear() - year);
  } catch {
    return '25';
  }
}

// ─── Map quiz answers to API-friendly labels ──────────────────────────────────

const BODY_TYPE_MAP: Record<string, string> = {
  skinny: 'THIN',
  regular: 'AVERAGE',
  extra: 'BULK',
};

const MAIN_GOAL_MAP: Record<string, string> = {
  basics: 'Learn the basics',
  lose_weight: 'Lose weight',
  gain_weight: 'Gain weight',
  muscle_mass: 'Gain muscle mass',
  strength: 'Strength builder',
  shredded: 'Get Shredded',
  keep_fit: 'Keep fit',
};

const TRAINING_GOAL_MAP: Record<string, string> = {
  keep_fit: 'Keep fit',
  power: 'Power training',
  resistance: 'Resistance',
};

const MOTIVATION_MAP: Record<string, string> = {
  health: 'IMPROVING HEALTH',
  immune: 'BOOSTING IMMUNE SYSTEM',
  looks: 'LOOKING BETTER',
  strength_endurance: 'BUILDING STRENGTH AND ENDURANCE',
  libido: 'BOOSTING LIBIDO',
};

const FITNESS_LEVEL_MAP: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const WALKING_MAP: Record<string, string> = {
  less_1: 'LESS THAN 1 HOUR',
  '1_2': '1 TO 2 HOURS',
  more_2: 'MORE THAN 2 HOURS',
};

const PUSHUP_MAP: Record<string, string> = {
  less_12: 'LESS THAN 12',
  '13_20': '13 TO 20',
  more_21: 'MORE THAN 21',
  unknown: 'I DONT KNOW',
};

const WATER_MAP: Record<string, string> = {
  tea_coffee: "I ONLY DRINK TEA AND COFFEE",
  less_2: 'FEWER THAN 2 GLASSES OF WATER',
  '2_6': '2 TO 6 GLASSES OF WATER',
  '7_10': '7 TO 10 GLASSES OF WATER',
  more_10: 'MORE THAN 10 GLASSES OF WATER',
};

const SLEEP_MAP: Record<string, string> = {
  less_5: 'FEWER THAN 5 HOURS',
  '5_6': 'BETWEEN 5 AND 6 HOURS',
  '7_8': 'BETWEEN 7 AND 8 HOURS',
  over_8: 'OVER 8 HOURS',
};

const MEAL_MAP: Record<string, string> = {
  sleepy: "I GET SLEEPY WHEN I'M HUNGRY",
  tired_after: 'I AM TIRED AFTER I EAT',
  enough_energy: 'I HAVE ENOUGH ENERGY',
  tired_overeat: 'I FEEL TIRED WHEN I OVEREAT',
  irritable: "I FEEL IRRITABLE WHEN I'M HUNGRY",
};

const TARGET_ZONE_MAP: Record<string, string> = {
  arms: 'ARMS',
  chest: 'CHEST',
  abs: 'ABS',
  legs: 'LEGS',
  full_body: 'FULL BODY',
};

/** Build the full /register payload from collected quiz answers + checkout form */
function buildRegisterPayload(
  userState: UserState,
  name: string,
  fullPhone: string,
  dialCode: string
): RegisterPayload {
  // react-phone-input-2 gives the full number without '+' (e.g. '96560074170')
  // and dialCode without '+' (e.g. '965').
  // Strip the dialCode prefix to get the local number (e.g. '60074170').
  const localPhone = fullPhone.startsWith(dialCode)
    ? fullPhone.slice(dialCode.length)
    : fullPhone;
  const countryCode = `+${dialCode}`;
  const get = (key: string) => getAnswerByKey(userState, key);

  const bodyTypeRaw = get('body_type');
  const mainGoalRaw = get('main_goal');
  const trainingGoalRaw = get('training_goal');
  const motivationRaw = get('motivation');
  const fitnessRaw = get('fitness_level');
  const walkingRaw = get('walking');
  const pushupRaw = get('pushups');
  const sedentaryRaw = get('sedentary');
  const waterRaw = get('water');
  const sleepRaw = get('sleep');
  const mealRaw = get('between_meals');
  const targetZoneRaw = get('target_zone');
  const dob = get('dob');
  const heightRaw = get('height');
  const weightRaw = get('current_weight');
  const goalWeightRaw = get('target_weight');

  return {
    sex: userState.gender === 'female' ? 'woman' : 'man',
    main_goal: MAIN_GOAL_MAP[mainGoalRaw] ?? mainGoalRaw,
    training_goal: TRAINING_GOAL_MAP[trainingGoalRaw] ?? trainingGoalRaw,
    motivates_exercise: MOTIVATION_MAP[motivationRaw] ?? motivationRaw,
    body_type: BODY_TYPE_MAP[bodyTypeRaw] ?? bodyTypeRaw,
    target_zone: TARGET_ZONE_MAP[targetZoneRaw] ?? targetZoneRaw,
    last_happy_body: 'LESS THAN A YEAR AGO',
    fitness_level: FITNESS_LEVEL_MAP[fitnessRaw] ?? fitnessRaw,
    many_push_ups: PUSHUP_MAP[pushupRaw] ?? pushupRaw,
    live_elementary: sedentaryRaw === 'yes' ? 'YES' : 'NO',
    walk_daily: WALKING_MAP[walkingRaw] ?? walkingRaw,
    feel_meals: MEAL_MAP[mealRaw] ?? mealRaw,
    get_sleep: SLEEP_MAP[sleepRaw] ?? sleepRaw,
    water_consumption: WATER_MAP[waterRaw] ?? waterRaw,
    tall: heightRaw || '170',
    weight: weightRaw || '80',
    goal_weight: goalWeightRaw || '70',
    old: calcAge(dob),
    training_location: 'HOME',
    Interested_in: 'BRAIN FUNCTION',
    diet: 'Standerd',
    name,
    phone: localPhone,
    device_token: 'web',
    days_exercise: 'Saturday,Sunday,Monday',
    dite_id: '',
    calories: '',
    country_code: countryCode || '+965',
  };
}

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

// ─── Component ────────────────────────────────────────────────────────────────

const Checkout: React.FC<CheckoutProps> = ({
  lang,
  selectedPlanId,
  userState,
  packages,
  onBack,
  onSuccess,
}) => {
  const t = TRANSLATIONS[lang];
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [countryCode, setCountryCode] = useState('965');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStep, setApiStep] = useState<'idle' | 'registering' | 'ordering' | 'redirecting'>('idle');
  const [subStep, setSubStep] = useState<'register' | 'payment'>(
    userState.authToken ? 'payment' : 'register'
  );
  const [authToken, setAuthToken] = useState<string>(userState.authToken || '');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('');
  const [isFetchingPayments, setIsFetchingPayments] = useState<boolean>(false);

  useEffect(() => {
    if (authToken) {
      setIsFetchingPayments(true);
      getPaymentMethods(authToken, lang)
        .then((res) => {
          if (res.status) {
            setPaymentMethods(res.data);
            if (res.data.length > 0) {
              setSelectedPaymentId(String(res.data[0].id));
            }
          }
        })
        .catch((err) => {
          console.error('Failed to load payment methods:', err);
        })
        .finally(() => {
          setIsFetchingPayments(false);
        });
    }
  }, [authToken, lang]);

  const selectedPkg = packages.find((p) => String(p.id) === selectedPlanId) ||
    (packages.find(p => p.coach === 1 && p.duration !== '1') as Package) || ({
      id: 50,
      price: '49',
      duration: '91',
      name: '3 Months',
      title: 'Millions of Users’ Choice',
    } as unknown as Package);

  const meta = getPackageMetadata(selectedPkg.duration);
  const planLabel = selectedPkg.name || (lang === 'ar' ? meta.labelAr : meta.labelEn);
  const planTag = selectedPkg.title || (lang === 'ar' ? meta.tagAr : meta.tagEn);

  const DISCOUNT_MAP: Record<string, string> = {
    '29': '19',
    '49': '39',
    '79': '50',
    '99': '79',
  };
  const discountedPrice = DISCOUNT_MAP[selectedPkg.price] || null;
  const finalPrice = discountedPrice || selectedPkg.price;
  const planPriceText = lang === 'ar' ? `${finalPrice}$` : `$${finalPrice}`;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setApiStep('registering');

    try {
      const payload = buildRegisterPayload(userState, formData.name, formData.phone, countryCode);
      const registerResp = await registerUser(payload, lang);
      if (registerResp.status && registerResp.data?.token) {
        const token = registerResp.data.token;
        setAuthToken(token);
        setSubStep('payment');
      } else {
        throw new Error('Registration failed: no token returned.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
    } finally {
      setIsLoading(false);
      setApiStep('idle');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setApiStep('ordering');

    try {
      const orderPayload: OrderPayload = {
        package_id: String(selectedPkg.id),
        payment_id: selectedPaymentId,
        total: finalPrice,
        type: '1',
      };
      const orderResp = await placeOrder(authToken, orderPayload, lang);

      if (orderResp.status && orderResp.data) {
        onSuccess(authToken);
        setApiStep('redirecting');
        await new Promise((r) => setTimeout(r, 400));
        window.open(orderResp.data, '_blank');
      } else {
        throw new Error(orderResp.message ?? 'Order was rejected by the server.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
      setIsLoading(false);
      setApiStep('idle');
    }
  };

  const stepLabel =
    apiStep === 'registering'
      ? lang === 'ar'
        ? 'جاري إنشاء الحساب...'
        : 'Creating account…'
      : apiStep === 'ordering'
        ? lang === 'ar'
          ? 'جاري معالجة طلبك...'
          : 'Processing order…'
        : apiStep === 'redirecting'
          ? lang === 'ar'
            ? 'جاري التوجيه إلى بوابة الدفع...'
            : 'Redirecting to payment gateway…'
          : null;

  return (
    <div
      className="h-full flex flex-col p-6 animate-fade-in overflow-y-auto no-scrollbar"
      style={{ paddingBottom: 'calc(120px + env(safe-area-inset-bottom))' }}
    >
      <h2 className="text-2xl font-bold mb-6 text-center">
        {subStep === 'register'
          ? t.checkoutHeader
          : (lang === 'ar' ? 'إتمام الدفع' : 'Complete Payment')
        }
      </h2>

      {/* Selected Package Summary Card */}
      <div className="mb-6 relative p-4 rounded-xl border border-brand-lime bg-brand-lime/10 flex items-center justify-between">
        <div className="flex flex-col text-start">
          {planTag && (
            <span className="text-[10px] font-bold uppercase text-brand-lime mb-1 leading-none">
              {planTag}
            </span>
          )}
          <span className="font-bold text-white text-lg leading-tight">{planLabel}</span>
          <button
            type="button"
            onClick={subStep === 'payment' && !userState.authToken ? () => setSubStep('register') : onBack}
            disabled={isLoading}
            className={`text-xs text-brand-lime/80 hover:text-brand-lime mt-2 text-start flex items-center gap-1 w-fit transition-colors disabled:opacity-50 ${lang === 'ar' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
          >
            <ChevronLeft size={12} />
            {subStep === 'payment' && !userState.authToken
              ? (lang === 'ar' ? 'تعديل البيانات' : 'Edit details')
              : t.changePackage
            }
          </button>
        </div>
        <div className="flex flex-col items-end shrink-0">
          {discountedPrice && (
            <span className="text-sm text-gray-500 line-through">
              {lang === 'ar' ? `${selectedPkg.price}$` : `$${selectedPkg.price}`}
            </span>
          )}
          <span className="font-black text-white text-xl">{planPriceText}</span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-sm text-red-400 text-start">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={subStep === 'register' ? handleRegisterSubmit : handlePaymentSubmit} className="space-y-4 mb-8">
        {subStep === 'register' ? (
          <>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 text-start">
                {t.firstName}
              </label>
              <input
                required
                type="text"
                disabled={isLoading}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-brand-lime focus:outline-none transition-colors disabled:opacity-50"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 text-start">
                {t.phoneNumber}
              </label>
              <PhoneInput
                country={'kw'}
                value={formData.phone}
                onChange={(value, data: any) => {
                  setFormData({ ...formData, phone: value });
                  if (data?.dialCode) {
                    setCountryCode(data.dialCode);
                  }
                }}
                disabled={isLoading}
                enableSearch
                searchPlaceholder={lang === 'ar' ? 'ابحث عن دولة...' : 'Search country...'}
                inputClass="!w-full !bg-white/5 !border-white/10 !rounded-xl !p-4 !pl-14 !text-white !h-auto !text-base focus:!border-brand-lime !transition-colors disabled:!opacity-50"
                containerClass="!w-full phone-input-dark !dir-ltr"
                containerStyle={{ direction: 'ltr' }}
                buttonClass="!bg-white/5 !border-white/10 !rounded-l-xl hover:!bg-white/10 !h-auto"
                dropdownClass="!bg-black !text-white !border-white/10 !rounded-xl !shadow-2xl"
                searchClass="!bg-white !text-white !border-white/10 !rounded-lg"
              />
            </div>
          </>
        ) : (
          <>
            {isFetchingPayments ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-brand-lime">
                <Loader2 className="animate-spin" size={32} />
                <p className="text-xs text-gray-500">{lang === 'ar' ? 'جاري تحميل طرق الدفع...' : 'Loading payment methods…'}</p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1 text-start">
                  {lang === 'ar' ? 'اختر طريقة الدفع' : 'Select Payment Method'}
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {paymentMethods.map((method) => {
                    const isSelected = selectedPaymentId === String(method.id);
                    return (
                      <div
                        key={method.id}
                        onClick={() => setSelectedPaymentId(String(method.id))}
                        className={`
                          flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all bg-white/5
                          ${isSelected ? 'border-brand-lime bg-brand-lime/10' : 'border-white/10 hover:border-white/20'}
                        `}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-brand-lime' : 'border-gray-500'}`}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand-lime" />}
                        </div>
                        {method.image && (
                          <img src={method.image} alt={method.title} className="h-6 object-contain shrink-0 bg-white/10 rounded px-1 py-0.5" />
                        )}
                        <span className="text-xs font-semibold text-white truncate">{method.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-auto space-y-4 pt-4">
          {subStep === 'payment' && (
            <div className="space-y-2">
              <p className="text-xs text-center text-gray-500 uppercase font-bold">
                {t.paymentMethods}
              </p>
              <div className="flex gap-2 justify-center opacity-60">
                <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center">
                  <CreditCard size={16} />
                </div>
                <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center font-bold text-[10px]">
                  {t.payIcon}
                </div>
                <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center">
                  <Wallet size={16} />
                </div>
              </div>
            </div>
          )}

          {/* Loading step label */}
          {stepLabel && (
            <p className="text-xs text-center text-brand-lime/80 animate-pulse">{stepLabel}</p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || (subStep === 'payment' && paymentMethods.length === 0)}>
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                {stepLabel ?? (lang === 'ar' ? 'جاري المعالجة...' : 'Processing…')}
              </span>
            ) : subStep === 'register' ? (
              lang === 'ar' ? 'متابعة للدفع' : 'Continue to Payment'
            ) : (
              t.payNow
            )}
          </Button>

          <p className="text-[10px] text-center text-gray-600 px-4 leading-relaxed">{t.terms}</p>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
