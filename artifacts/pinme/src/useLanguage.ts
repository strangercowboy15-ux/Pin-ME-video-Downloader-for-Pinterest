import { useMemo } from 'react';
import {
  translations,
  type Language,
  type TranslationKey,
} from './translations';

const SUPPORTED: Language[] = ['en', 'zh', 'ja', 'es', 'pt', 'bg', 'de'];

// Detect the browser's preferred language.
// Falls back to English if the detected language is not supported.
function detectLanguage(): Language {
  if (typeof navigator === 'undefined') {
    return 'en';
  }

  const raw =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages[0]
      : navigator.language;

  if (!raw) {
    return 'en';
  }

  // Normalize: 'zh-CN' → 'zh', 'pt-BR' → 'pt', etc.
  const primary = raw.toLowerCase().split('-')[0] as Language;

  return SUPPORTED.includes(primary) ? primary : 'en';
}

export function useLanguage() {
  const language = useMemo(detectLanguage, []);

  const t = useMemo(() => {
    const dict = translations[language];

    return (key: TranslationKey): string => dict[key] ?? translations.en[key];
  }, [language]);

  return { language, t };
}