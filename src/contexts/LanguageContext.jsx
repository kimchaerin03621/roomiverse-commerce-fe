import { createContext, useMemo, useState } from 'react';
import { DEFAULT_LOCALE, localeContent } from '../content/locale';

// Context and provider intentionally live together to keep this small setup self-contained.
// oxlint-disable-next-line react/only-export-components
export const LanguageContext = createContext({
  language: DEFAULT_LOCALE,
  setLanguage: () => {},
  content: localeContent[DEFAULT_LOCALE],
});

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(DEFAULT_LOCALE);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      content: localeContent[language] ?? localeContent[DEFAULT_LOCALE],
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
