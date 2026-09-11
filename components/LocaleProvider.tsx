"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { translations, locales, type Locale, type TranslationKey } from "@/lib/i18n";

interface LocaleContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
  tArr: (key: TranslationKey) => string[];
}

const LocaleContext = createContext<LocaleContextType>({
  locale: "da",
  setLocale: () => {},
  t: (k) => k,
  tArr: () => [],
});

export function useLocale() { return useContext(LocaleContext); }

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("da");

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved && locales.find(l => l.code === saved)) setLocaleState(saved);
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem("locale", l);
  }

  function t(key: TranslationKey): string {
    const val = translations[locale][key];
    return Array.isArray(val) ? val.join(", ") : (val as string);
  }

  function tArr(key: TranslationKey): string[] {
    const val = translations[locale][key];
    return Array.isArray(val) ? val : [val as string];
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, tArr }}>
      {children}
    </LocaleContext.Provider>
  );
}
