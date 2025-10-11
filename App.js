// App.js
import React from "react";
import { View } from "react-native";
import { Provider as PaperProvider, MD3LightTheme } from "react-native-paper";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "./src/store";
import AuthProvider from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import colors from "./src/constants/colors";
import "./src/localization/i18n";
import LanguageSwitcher from "./src/components/LanguageSwitcher"; // ✅ أضفنا الزرار هنا

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.white,
    text: colors.text,
    outline: colors.grayText,
    onSurface: colors.text,
  },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <ReduxProvider store={store}>
        <AuthProvider>
          <View style={{ flex: 1 }}>
            <LanguageSwitcher />
            <RootNavigator />
          </View>
        </AuthProvider>
      </ReduxProvider>
    </PaperProvider>
  );
}
