// src/navigation/UserTabNavigator.js
import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import colors from "../constants/colors";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useTranslation } from "react-i18next";

// Screens
import UserHomeScreen from "../screens/UserHomeScreen";
import CartScreen from "../screens/CartScreen";
import DetailsScreen from "../screens/DetailsScreen";
import WishlistScreen from "../screens/WhishlistScreen";
import ProfileScreen from "../screens/ProfileScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import SuccessOrderScreen from "../screens/SuccessScreen";
import UserOrdersScreen from "../screens/UserOrdersScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Stack خاص بالـ Home + Details
function HomeStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="UserHome"
        component={UserHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DetailsScreen"
        component={DetailsScreen}
        options={{ title: t("product_details") }}
      />
    </Stack.Navigator>
  );
}

function UserTabs() {
  const { t } = useTranslation();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const user = getAuth().currentUser;
    if (!user) return;

    const q = query(collection(db, "cart"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCartCount(snapshot.docs.length);
    });

    return () => unsubscribe();
  }, []);

  // تأكيد إن الفيفوريت مصفوفة فعلاً
  const favorites = useSelector((state) =>
    Array.isArray(state.favorites.items) ? state.favorites.items : []
  );

  const favoritesCount =
    favorites && Array.isArray(favorites) && favorites.length > 0
      ? favorites.length
      : undefined;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.lightGray,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          elevation: 5,
          height: 95,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: -4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: t("tabs_home"),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="home-outline"
              color={color}
              size={26}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Favorites"
        component={WishlistScreen}
        options={{
          tabBarLabel: t("tabs_favorites"),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="heart-outline"
              color={color}
              size={26}
            />
          ),
          tabBarBadge: favoritesCount,
        }}
      />

      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: t("tabs_cart"),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="cart-outline"
              color={color}
              size={26}
            />
          ),
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}
      />

      <Tab.Screen
        name="Orders"
        component={UserOrdersScreen}
        options={{
          tabBarLabel: t("tabs_orders"),
          headerTitle: t("tabs_orders"),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t("tabs_profile"),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="account-outline"
              color={color}
              size={26}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function UserTabNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={UserTabs} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Success" component={SuccessOrderScreen} />
    </Stack.Navigator>
  );
}
