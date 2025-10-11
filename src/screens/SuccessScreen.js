// src/screens/SuccessScreen.js
import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const SuccessOrderScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/successorder.png")}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>{t("order_success_title")}</Text>
      <Text style={styles.subtitle}>{t("order_success_subtitle")}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("MainTabs", { screen: "Home" })}
      >
        <Text style={styles.buttonText}>{t("continue_shopping")}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SuccessOrderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAF9",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#222",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#2F4B4E",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
