import type { Translations } from '@/interfaces/translations';

export type Locale = 'en' | 'es' | 'ja';

export type DotKeys<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : `${K}.${DotKeys<T[K]>}`;
}[keyof T & string];

export type TranslationKey = DotKeys<Translations>;

export interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}
