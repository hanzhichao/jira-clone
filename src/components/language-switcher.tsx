'use client';

import { Languages } from 'lucide-react';
import { useI18n, type Locale } from '@/i18n';

const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  zh: '🇨🇳',
};

const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
};

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'zh' : 'en');
  };

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700"
      title={t('common.switchLanguage')}
    >
      <Languages className="size-4" />
      <span>{localeFlags[locale]}</span>
    </button>
  );
}