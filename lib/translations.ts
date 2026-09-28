import vi from "@/locales/vi.json";
import en from "@/locales/en.json";

export type Locale = "vi" | "en";

const dictionaries: Record<Locale, Record<string, string>> = {
  vi: vi as Record<string, string>,
  en: en as Record<string, string>,
};

export function t(key: string, locale: Locale = "vi") {
  return dictionaries[locale]?.[key] ?? dictionaries.vi[key] ?? key;
}
