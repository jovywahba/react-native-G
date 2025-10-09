import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import colors from "../constants/colors";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Screens
import UserHomeScreen from "../screens/UserHomeScreen";
import CartScreen from "../screens/CartScreen";
import DetailsScreen from "../screens/DetailsScreen";
import WishlistScreen from "../screens/WhishlistScreen";
import ProfileScreen from "../screens/ProfileScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import SuccessOrderScreen from "../screens/SuccessScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

//  Stack خاص بالـ Home + Details
function HomeStack() {
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
        options={{ title: "Product Details" }}
      />
    </Stack.Navigator>
  );
}

function UserTabs() {
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
  const favorites = useSelector(
    (state) => Array.isArray(state.favorites.items) ? state.favorites.items : []
  );

  console.log("💡 Favorites in Tab:", favorites);

  // لو فعلاً في منتجات فقط وقتها نعرض الرقم
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
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home-outline" color={color} size={26} />
          ),
        }}
      />

      <Tab.Screen
        name="Favorites"
        component={WishlistScreen}
        options={{
          tabBarLabel: "Favorites",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="heart-outline" color={color} size={26} />
          ),
          //  الرقم يظهر بس لو فيه عناصر فعلاً
          tabBarBadge: favoritesCount,
        }}
      />

      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: "Cart",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="cart-outline" color={color} size={26} />
          ),
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}
      />


      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-outline" color={color} size={26} />
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
