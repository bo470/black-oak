
import { useAuth } from "../features/auth/AuthContext";
import { translations, TranslationStrings, LanguageCode } from "../lib/translations";

export function useTranslation() {
  const { profile } = useAuth();
  
  // Default to 'en-US' if profile or language is not defined
  const language: LanguageCode = (profile?.language as LanguageCode) || 'en-US';
  
  const t = translations[language] || translations['en-US'];

  return {
    t,
    language,
    // Add a helper for raw translation if needed
    translate: (key: keyof TranslationStrings) => t[key]
  };
}
