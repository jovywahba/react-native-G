import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { Text, Card, IconButton } from "react-native-paper";
import colors from "../constants/colors";
import { useDispatch } from "react-redux";
import { toggleFavoriteLocal, toggleFavoriteInFirebase } from "../favoritesSlice";

export default function ProductCard({ item, onPress, favorites }) {
  const dispatch = useDispatch();
  const isFav = favorites.includes(item.id);

  const handleFavorite = () => {
    // تحديث محلي فوراً
    dispatch(toggleFavoriteLocal(item.id));
    // تحديث Firebase في الخلفية
    dispatch(toggleFavoriteInFirebase(item.id));
  };

  return (
    <Card
      style={{
        backgroundColor: colors.white,
        borderRadius: 16,
        marginBottom: 16,
        elevation: 3,
        marginHorizontal: 4,
      }}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Card.Content>
          <Image
            source={{ uri: item.imageUrl }}
            style={{
              width: "100%",
              height: 150,
              borderRadius: 12,
              marginBottom: 8,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text variant="titleMedium" style={{ color: colors.text, fontWeight: "600" }}>
              {item.name}
            </Text>

            <IconButton
              icon={isFav ? "heart" : "heart-outline"}
              size={20}
              iconColor={isFav ? "red" : colors.primary}
              onPress={handleFavorite}
            />
          </View>

          <Text style={{ color: colors.grayText, fontSize: 13 }} numberOfLines={2}>
            {item.description}
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 15 }}>
              ${item.price}
            </Text>
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );
}
