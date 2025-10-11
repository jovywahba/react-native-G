import React, { useState } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { Text, Card, IconButton } from "react-native-paper";
import colors from "../constants/colors";
import { useDispatch } from "react-redux";
import { toggleFavoriteInFirebase } from "../favoritesSlice";
import { useTranslation } from "react-i18next";

export default function ProductCard({
  item,
  onPress,
  onAddToCart,
  onRemoveFromCart,
  favorites = [],
}) {
  const dispatch = useDispatch();
  const isFav = favorites.includes(item.id);
  const [isInCart, setIsInCart] = useState(false);
  const { t } = useTranslation();

  const handleFavorite = () => {
    dispatch(toggleFavoriteInFirebase(item.id));
  };

  const handleCartPress = () => {
    if (isInCart) {
      onRemoveFromCart && onRemoveFromCart(item);
      setIsInCart(false);
    } else {
      onAddToCart && onAddToCart(item);
      setIsInCart(true);
    }
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
            <Text
              variant="titleMedium"
              style={{ color: colors.text, fontWeight: "600" }}
            >
              {item.name}
            </Text>

            <IconButton
              icon={isFav ? "heart" : "heart-outline"}
              size={20}
              iconColor={isFav ? "red" : colors.primary}
              onPress={handleFavorite}
            />
          </View>

          <Text
            style={{ color: colors.grayText, fontSize: 13 }}
            numberOfLines={2}
          >
            {t(item.description)}
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <Text
              style={{
                color: colors.accent,
                fontWeight: "700",
                fontSize: 15,
              }}
            >
              ${item.price}
            </Text>

            {onAddToCart && (
              <IconButton
                icon={isInCart ? "cart" : "cart-outline"}
                size={22}
                iconColor={isInCart ? colors.accent : colors.primary}
                onPress={handleCartPress}
              />
            )}
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );
}
