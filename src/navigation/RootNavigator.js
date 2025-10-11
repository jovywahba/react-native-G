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
import UserTabNavigator from "../navigation/UserTabNavigator";

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
        options={{ title: "Add Product" }}
      />
      {/* controle screen*/}
      <AdminStack.Screen
        name="AdminOrders"
        component={AdminOrdersScreen}
        options={{ title: "Manage Orders" }}
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
