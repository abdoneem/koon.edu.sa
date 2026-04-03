import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"
import { mergeDeep } from "./mergeDeep"
import { resourcesShell } from "./resourcesShell"
import { siteDocumentAr, siteDocumentEn } from "./siteDocument"

export const resources = {
  en: {
    translation: mergeDeep(
      resourcesShell.en.translation as unknown as Record<string, unknown>,
      siteDocumentEn as unknown as Record<string, unknown>,
    ),
  },
  ar: {
    translation: mergeDeep(
      resourcesShell.ar.translation as unknown as Record<string, unknown>,
      siteDocumentAr as unknown as Record<string, unknown>,
    ),
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "ar",
    lng: "ar",
    supportedLngs: ["ar", "en"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  })

export default i18n
