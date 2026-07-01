export type Language = 'en' | 'ar';

export enum Step {
  SPLASH = 0,
  LANDING = 1,
  GENDER = 2,
  QUIZ = 3,
  LOADING = 4,
  OFFER = 5,
  CHECKOUT = 6,
  SUCCESS = 7
}

export interface QuizAnswer {
  questionId: number;
  value: string | number;
  unit?: string;
  label?: string;
}

export interface UserState {
  answers: Record<number, QuizAnswer>;
  gender: 'male' | 'female' | null;
  name: string;
  phone: string;
  /** Auth token returned from POST /register — stored here for the /orders call */
  authToken?: string;
}

export type QuestionType = 'choice' | 'date' | 'measurement';

export interface QuestionOption {
  value: string | number;
  labelEn: string;
  labelAr: string;
}

export interface Question {
  id: number;
  key: string;
  type: QuestionType;
  units?: { label: string; value: string }[]; // e.g., [{label:'cm', value:'cm'}, {label:'ft', value:'ft'}]
  options?: QuestionOption[]; // Only for 'choice' type
  min?: number; // For slider/picker
  max?: number;
  step?: number;
  defaultUnit?: string;
  defaultValue?: number;
}

export interface PricingPlan {
  id: string;
  durationMonths: number;
  price: string;
  labelEn: string;
  labelAr: string;
  tagEn?: string;
  tagAr?: string;
  isBestValue?: boolean;
}