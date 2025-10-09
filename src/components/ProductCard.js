// src/components/ProductCard.js
import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton } from 'react-native-paper';
import colors from '../constants/colors';
export default function ProductCard({ item, onPress, onAddToCart }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card
        style={{
          backgroundColor: colors.white,
          borderRadius: 16,
          marginBottom: 16,
          elevation: 3,
          marginHorizontal: 4,
        }}
      >
        <Card.Content>
          <Image
            source={{ uri: item.imageUrl }}
            style={{
              width: '100%',
              height: 150,
              borderRadius: 12,
              marginBottom: 8,
            }}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="titleMedium" style={{ color: colors.text, fontWeight: '600' }}>
              {item.name}
            </Text>
            <IconButton
              icon="heart-outline"
              size={20}
              iconColor={colors.primary}
              onPress={() => console.log('Add to favorites:', item.name)}
            />
          </View>

          <Text style={{ color: colors.grayText, fontSize: 13 }} numberOfLines={2}>
            {item.description}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <Text
              style={{
                color: colors.accent,
                fontWeight: '700',
                fontSize: 15,
              }}
            >
              ${item.price}
            </Text>

            <IconButton
              icon="cart-plus"
              size={22}
              iconColor={colors.primary}
              onPress={() => onAddToCart?.(item)} 
              style={{
                backgroundColor: colors.background,
                borderRadius: 20,
              }}
            />
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}
