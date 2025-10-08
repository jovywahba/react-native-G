// App.js
import React from "react";
import { Provider as PaperProvider, MD3LightTheme } from "react-native-paper";
import AuthProvider from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import colors from "./src/constants/colors";

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
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}
