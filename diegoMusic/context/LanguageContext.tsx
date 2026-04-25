import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import storage from '@/services/storage';
import en from '@/locales/en';
import es from '@/locales/es';
import ja from '@/locales/ja';
import type { Translations } from '@/interfaces/translations';
import type { LanguageContextValue, Locale, TranslationKey } from '@/interfaces/language';

const LOCALE_KEY = '@app_language';
const locales: Record<Locale, Translations> = { en, es, ja };

const LanguageContext = createContext<LanguageContextValue | null>(null);

function resolve(obj: Record<string, unknown>, path: string): string {
  const value = path.split('.').reduce<unknown>((acc, k) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[k];
    return undefined;
  }, obj);
  return typeof value === 'string' ? value : path;
}

function interpolate(str: string, params?: Record<string, string | number>): string {
  if (!params) return str;
  return Object.entries(params).reduce(
    (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
    str,
  );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es');

  useEffect(() => {
    storage.getItem(LOCALE_KEY).then((saved) => {
      if (saved && saved in locales) setLocaleState(saved as Locale);
    }).catch(() => {});
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    storage.setItem(LOCALE_KEY, next).catch(() => {});
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      const translations = locales[locale] as unknown as Record<string, unknown>;
      const str = resolve(translations, key);
      return interpolate(str, params);
    },
    [locale],
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
