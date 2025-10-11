import React from "react";
import { View, I18nManager } from "react-native";
import { Avatar, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import colors from "../constants/colors";

const Header = () => {
  const { t, i18n } = useTranslation();

  const isRTL = i18n.language === "ar";

  return (
    <View
      style={{
        flexDirection: isRTL ? "row-reverse" : "row",
        alignItems: "center",
        marginBottom: 20,
        marginTop: 50,
      }}
    >
      <Avatar.Image
        size={45}
        source={{ uri: "https://via.placeholder.com/100" }}
      />

      <View style={{ marginHorizontal: 10 }}>
        <Text
          variant="titleMedium"
          style={{
            color: colors.text,
            textAlign: isRTL ? "right" : "left",
          }}
        >
          {t("discover_the_best")}
        </Text>

        <Text
          variant="titleMedium"
          style={{
            color: colors.primary,
            textAlign: isRTL ? "right" : "left",
          }}
        >
          {t("furniture")}
        </Text>
      </View>
    </View>
  );
};

export default Header;
