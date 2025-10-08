import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { AuthContext } from "../context/AuthContext";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import AdminHomeScreen from "../screens/AdminHomeScreen";
import AddProductScreen from "../screens/AddProductScreen"; // 👈 جديد

const Stack = createStackNavigator();
const AdminStack = createStackNavigator();

function AdminNavigator() {
  return (
    <AdminStack.Navigator>
      <AdminStack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: "Dashboard" }} />
      <AdminStack.Screen name="AddProduct" component={AddProductScreen} options={{ title: "Add Product" }} />
    </AdminStack.Navigator>
  );
}

export default function RootNavigator() {
  const { user, profile, loading } = useContext(AuthContext);
  if (loading) return null;

  if (user && profile) {
    const isAdmin = profile.userType === "admin";
    return (
      <NavigationContainer>
        {isAdmin ? (
          <AdminNavigator />
        ) : (
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Register" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
