import React from "react";
import { TouchableOpacity, I18nManager } from "react-native";
import { useTranslation } from "react-i18next";
import * as Updates from "expo-updates";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = async () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    await i18n.changeLanguage(newLang);

    if (newLang === "ar") {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
    } else {
      I18nManager.allowRTL(false);
      I18nManager.forceRTL(false);
    }

    await Updates.reloadAsync();
  };

  return (
    <TouchableOpacity
      onPress={toggleLanguage}
      style={{
        position: "absolute",
        top: 60,
        right: 20,
        zIndex: 999,
        backgroundColor: "white",
        borderRadius: 50,
        padding: 8,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      }}
    >
      <MaterialCommunityIcons
        name={i18n.language === "ar" ? "flag-outline" : "flag"}
        size={24}
        color={i18n.language === "ar" ? "#007bff" : "#d32f2f"}
      />
    </TouchableOpacity>
  );
};

export default LanguageSwitcher;
