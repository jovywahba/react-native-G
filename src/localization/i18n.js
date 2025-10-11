// src/locales/i18n.js
import i18n from "i18next";
import * as Localization from "expo-localization";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import ar from "./ar.json";

const deviceLocale = (
  Localization?.getLocales?.()[0]?.languageCode ||
  Localization?.locale?.split("-")[0] ||
  "en"
).toLowerCase();

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  lng: deviceLocale.startsWith("ar") ? "ar" : "en",
  fallbackLng: "en",
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
