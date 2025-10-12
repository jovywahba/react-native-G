import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { Text, Card, IconButton } from "react-native-paper";
import colors from "../constants/colors";

export default function AdminProductCard({ item, onEdit, onDelete, onPress }) {
  return (
    <Card
      style={{
        backgroundColor: colors.white,
        borderRadius: 16,
        marginBottom: 16,
        elevation: 3,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        <Image
          source={{ uri: item.imageUrl }}
          resizeMode="cover"
          style={{ width: "100%", height: 160 }}
        />
        <View style={{ padding: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <Text
              variant="titleMedium"
              style={{ color: colors.text, fontWeight: "600", flex: 1, marginRight: 8 }}
              numberOfLines={1}
            >
              {item.name}
            </Text>

            <View style={{ flexDirection: "row" }}>
              <IconButton
                icon="pencil"
                size={20}
                style={{
                  backgroundColor: "rgba(0,0,0,0.04)",
                  margin: 0,
                  marginRight: 6,
                  borderRadius: 10,
                }}
                onPress={() => onEdit?.(item)}
                accessibilityLabel="Edit"
              />
              <IconButton
                icon="delete-outline"
                size={20}
                style={{
                  backgroundColor: "rgba(255,0,0,0.06)",
                  margin: 0,
                  borderRadius: 10,
                }}
                onPress={() => onDelete?.(item)}
                accessibilityLabel="Delete"
              />
            </View>
          </View>

          {!!item.category && (
            <Text style={{ color: colors.grayText, marginBottom: 6 }} numberOfLines={1}>
              {item.category}
            </Text>
          )}

          {!!item.description && (
            <Text style={{ color: colors.grayText }} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <Text style={{ color: "#FF6A00", fontWeight: "800", marginTop: 8 }}>
            ${item.price}
          </Text>
        </View>
      </TouchableOpacity>
    </Card>
  );
}
