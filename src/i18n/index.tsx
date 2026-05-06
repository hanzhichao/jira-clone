'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from './locales/en.json';
import zh from './locales/zh.json';

type Locale = 'en' | 'zh';

type TranslationKeys = typeof en;

const translations: Record<Locale, TranslationKeys> = {
  en,
  zh,
};

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}` | K
          : K
        : never;
    }[keyof T]
  : never;

type TranslationPath = NestedKeyOf<TranslationKeys>;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'jira-clone-locale';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY) as Locale | null;
    if (stored && (stored === 'en' || stored === 'zh')) {
      setLocaleState(stored);
    } else {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('zh')) {
        setLocaleState('zh');
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCAL_STORAGE_KEY, newLocale);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations[locale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        // Fallback to English
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = (value as Record<string, unknown>)[fallbackKey];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

const defaultTranslations = {
  t: (key: string) => key,
  locale: 'en' as Locale,
  setLocale: () => {},
};

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    return defaultTranslations;
  }
  return context;
}

export type { Locale, TranslationPath };