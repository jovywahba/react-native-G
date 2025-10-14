import React from "react";
import { TouchableOpacity, I18nManager, View } from "react-native";
import { useTranslation } from "react-i18next";
import * as Updates from "expo-updates";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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
    <View
      style={{
        position: "absolute",
        top: 80,
        right: 18,
        zIndex: 1000,
        elevation: 5,
      }}
    >
      <TouchableOpacity
        onPress={toggleLanguage}
        activeOpacity={0.85}
        style={{
          borderRadius: 30,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.15,
          shadowRadius: 5,
          elevation: 4,
        }}
      >
        <LinearGradient
          colors={["#FFFFFF", "#F5F7FA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            padding: 10,
            borderRadius: 30,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "#E2E8F0",
          }}
        >
          <MaterialCommunityIcons
            name="translate"
            size={22}
            color={i18n.language === "ar" ? "#2563EB" : "#16A34A"}
          />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default LanguageSwitcher;
