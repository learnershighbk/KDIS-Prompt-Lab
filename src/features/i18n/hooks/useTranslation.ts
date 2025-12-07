'use client';

import { useLocaleStore } from '../stores/locale.store';
import koTranslations from '../locales/ko.json';
import enTranslations from '../locales/en.json';

type TranslationKey = string;
type Translations = typeof koTranslations;

const translations: Record<'ko' | 'en', Translations> = {
  ko: koTranslations,
  en: enTranslations,
};

function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return path;
    }
  }
  return typeof value === 'string' ? value : path;
}

export function useTranslation() {
  const locale = useLocaleStore((state) => state.locale);
  const currentTranslations = translations[locale];

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let translation = getNestedValue(currentTranslations, key);
    
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{${paramKey}}`, String(paramValue));
      });
    }
    
    return translation;
  };

  return { t, locale };
}

