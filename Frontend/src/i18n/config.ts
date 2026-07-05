import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Direct imports — works with Vite bundling (no HTTP backend needed)
import en from './locales/en.json';
import hi from './locales/hi.json';
import ml from './locales/ml.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import kn from './locales/kn.json';
import bn from './locales/bn.json';
import mr from './locales/mr.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      ml: { translation: ml },
      ta: { translation: ta },
      te: { translation: te },
      kn: { translation: kn },
      bn: { translation: bn },
      mr: { translation: mr },
    },
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    react: {
      // false because resources are bundled directly — no async loading
      useSuspense: false,
    },
  });

export default i18n;
