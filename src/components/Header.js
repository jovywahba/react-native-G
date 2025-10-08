import React from 'react';
import { View } from 'react-native';
import { Avatar, Text } from 'react-native-paper';
import colors from '../constants/colors';

const Header = () => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
      }}
    >
      <Avatar.Image
        size={45}
        source={{ uri: 'https://via.placeholder.com/100' }}
      />
      <View style={{ marginLeft: 10 }}>
        <Text variant="titleMedium" style={{ color: colors.text }}>
          Discover the Best
        </Text>
        <Text variant="titleMedium" style={{ color: colors.primary }}>
          Furniture
        </Text>
      </View>
    </View>
  );
};

export default Header;
