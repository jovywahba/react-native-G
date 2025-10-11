import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

export const useLanguage = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    (async () => {
      const savedLang = await AsyncStorage.getItem("appLanguage");
      if (savedLang && savedLang !== i18n.language) {
        i18n.changeLanguage(savedLang);
      }
    })();
  }, []);

  const toggleLanguage = async () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
    await AsyncStorage.setItem("appLanguage", newLang);
  };

  return { language: i18n.language, toggleLanguage };
};
