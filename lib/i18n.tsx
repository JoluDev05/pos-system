'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import commonEs from '@/public/locales/es/common.json';
import commonEn from '@/public/locales/en/common.json';

type Locale = 'es' | 'en';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, defaultValue?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<Locale, typeof commonEs> = {
  es: commonEs,
  en: commonEn,
};

const getNestedValue = (obj: any, path: string): string | undefined => {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('es');
  const [isClientSide, setIsClientSide] = useState(false);

  useEffect(() => {
    setIsClientSide(true);
    // Get locale from localStorage or browser language
    const savedLocale = localStorage.getItem('locale') as Locale | null;
    if (savedLocale && (savedLocale === 'es' || savedLocale === 'en')) {
      setLocale(savedLocale);
    } else {
      const browserLang = navigator.language.split('-')[0] as Locale;
      const defaultLocale = ['es', 'en'].includes(browserLang) ? (browserLang as Locale) : 'es';
      setLocale(defaultLocale);
    }
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: string, defaultValue: string = key): string => {
    if (!isClientSide) return key;
    const value = getNestedValue(translations[locale], key);
    return value || defaultValue;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
