import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { messages, type Locale } from "./messages";

const STORAGE_KEY = "feuille-consommation-locale";

export function readLocale(): Locale {
  if (typeof window === "undefined") return "fr";
  try {
    return localStorage.getItem(STORAGE_KEY) === "ar" ? "ar" : "fr";
  } catch {
    return "fr";
  }
}

function applyDocumentLocale(locale: Locale) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale === "ar" ? "ar" : "fr";
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
}

type Ctx = {
  locale: Locale;
  t: (typeof messages)[Locale];
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<Ctx | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    const next = readLocale();
    setLocaleState(next);
    applyDocumentLocale(next);
  }, []);

  const value = useMemo<Ctx>(() => {
    return {
      locale,
      t: messages[locale],
      setLocale: (next) => {
        setLocaleState(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* ignore */
        }
        applyDocumentLocale(next);
      },
    };
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useI18n must be used inside LocaleProvider");
  return ctx;
}
