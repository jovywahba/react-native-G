// App.js
import React from "react";
import { Provider as PaperProvider, MD3LightTheme } from "react-native-paper";
import AuthProvider from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#3f51b5",   // Indigo
    secondary: "#f50057", // Pink
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
