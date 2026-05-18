import { TranslationLanguage } from "@/interfaces/translations";

const AZURE_ENDPOINT = process.env.EXPO_PUBLIC_AZURE_TRANSLATOR_ENDPOINT ?? 'https://api.cognitive.microsofttranslator.com';
const AZURE_KEY = process.env.EXPO_PUBLIC_AZURE_TRANSLATOR_KEY ?? '';
const AZURE_REGION = process.env.EXPO_PUBLIC_AZURE_TRANSLATOR_REGION ?? '';

export const SUPPORTED_LANGUAGES: TranslationLanguage[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'zh-Hans', name: '中文(简体)' },
  { code: 'ru', name: 'Русский' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
];

const DEFAULT_FROM = 'en';
const DEFAULT_TO = 'es';

export async function translateText(
  texts: string[],
  from: string = DEFAULT_FROM,
  to: string = DEFAULT_TO,
): Promise<string[]> {

  if (!AZURE_KEY) {
    console.warn('[AzureTranslator] Missing EXPO_PUBLIC_AZURE_TRANSLATOR_KEY');
    return texts;
  }

  if (!texts.length) return [];
  const url = `${AZURE_ENDPOINT}/translate?api-version=3.0&from=${from}&to=${to}`;
  const body = texts.map((t) => ({ Text: t }));
  const headers: Record<string, string> = {
    'Ocp-Apim-Subscription-Key': AZURE_KEY,
    'Content-Type': 'application/json',
  };

  if (AZURE_REGION) headers['Ocp-Apim-Subscription-Region'] = AZURE_REGION;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error('[AzureTranslator] Translation failed:', res.status, await res.text());
    return texts;
  }

  const data = await res.json();
  return data.map((item: { translations: { text: string }[] }) => item.translations[0].text);
}

export const DEFAULT_TRANSLATION = { from: DEFAULT_FROM, to: DEFAULT_TO };
