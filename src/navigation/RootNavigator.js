// src/navigation/RootNavigator.js
import React, { useContext } from "react";
import { View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { AuthContext } from "../context/AuthContext";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import AdminHomeScreen from "../screens/AdminHomeScreen";
import AddProductScreen from "../screens/AddProductScreen";
import UserTabNavigator from "../navigation/UserTabNavigator"; // 👈 الهوم بتاعة اليوزر

const Stack = createStackNavigator();
const AdminStack = createStackNavigator();

function AdminNavigator() {
  return (
    <AdminStack.Navigator>
      <AdminStack.Screen
        name="AdminHome"
        component={AdminHomeScreen}
        options={{ title: "Dashboard" }}
      />
      <AdminStack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={{ title: "Add Product" }}
      />
    </AdminStack.Navigator>
  );
}

export default function RootNavigator() {
  const { user, profile, loading } = useContext(AuthContext);

  // ✅ أول حاجة: لو لسه بيحمّل أو بيجيب البروفايل من Firestore
  if (loading || (user && !profile)) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#2F4B4E" />
        <Text style={{ marginTop: 10, color: "#2F4B4E" }}>
          Loading your profile...
        </Text>
      </View>
    );
  }

  // ✅ بعد ما يجهز، نقرر يروح فين
  if (user && profile) {
    const isAdmin = profile.userType === "admin";

    return (
      <NavigationContainer>
        {isAdmin ? (
          <AdminNavigator />
        ) : (
          <Stack.Navigator>
            <Stack.Screen
              name="UserTabs"
              component={UserTabNavigator}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    );
  }

  // ✅ لو مفيش يوزر (لسه داخل لأول مرة)
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Login" }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: "Register" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
