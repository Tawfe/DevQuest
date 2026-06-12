import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';

/**
 * All user-facing copy lives in the JSON resource files — never hardcoded
 * in components. Additional languages = additional resource files here
 * (Brazil and SEA are priority Roblox markets for later).
 */
export const resources = {
  en: { translation: en },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    // React already escapes output.
    escapeValue: false,
  },
});

export default i18n;
