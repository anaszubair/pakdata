import en from './en.json';
import ur from './ur.json';
import ar from './ar.json';

export const languages = {
  en: 'English',
  ur: 'اردو',
  ar: 'العربية',
};

export const defaultLang = 'en';

export const ui = {
  en,
  ur,
  ar,
} as const;
