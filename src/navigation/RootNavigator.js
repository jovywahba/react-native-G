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
import EditProductScreen from "../screens/EditProductScreen";
import AdminProfileScreen from "../screens/AdminProfileScreen";
import UserTabNavigator from "./UserTabNavigator";
import AdminOrdersScreen from "../screens/AdminOrdersScreen";

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
        options={{
          title: "Add Product",
          headerShown: true,
          headerBackTitleVisible: false,
        }}
      />
      <AdminStack.Screen
        name="EditProduct"
        component={EditProductScreen}
        options={{
          title: "Edit Product",
          headerShown: true,
          headerBackTitleVisible: false,
        }}
      />
      <AdminStack.Screen
        name="AdminOrders"
        component={AdminOrdersScreen}
        options={{ title: "Manage Orders" }}
      />
      <AdminStack.Screen
        name="AdminProfile"
        component={AdminProfileScreen}
        options={{ title: "Profile" }}
      />
    </AdminStack.Navigator>
  );
}

export default function RootNavigator() {
  const { user, profile, loading } = useContext(AuthContext);

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

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* 🔹 شاشات تسجيل الدخول */}
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : profile?.userType === "admin" ? (
          // 🔹 الأدمن
          <Stack.Screen name="AdminStack" component={AdminNavigator} />
        ) : (
          // 🔹 المستخدم العادي
          <Stack.Screen name="UserTabs" component={UserTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
