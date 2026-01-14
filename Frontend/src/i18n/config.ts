import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import mlTranslations from './locales/ml.json';
import taTranslations from './locales/ta.json';
import hiTranslations from './locales/hi.json';
import teTranslations from './locales/te.json';
import knTranslations from './locales/kn.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      ml: {
        translation: mlTranslations,
      },
      ta: {
        translation: taTranslations,
      },
      hi: {
        translation: hiTranslations,
      },
      te: {
        translation: teTranslations,
      },
      kn: {
        translation: knTranslations,
      },
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
      checkWhitelist: true,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
