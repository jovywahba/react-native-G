// src/components/CategoryList.js
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from 'react-native-paper';
import colors from '../constants/colors';

const CategoryList = ({ selected, setSelected }) => {
  const categories = ['All', 'Chairs', 'Cupboards', 'Tables', 'Lamps'];

  return (
    <View style={{ marginBottom: 16 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 10,
        }}
      >
        {categories.map((cat) => {
          const isSelected = selected === cat;
          return (
            <Button
              key={cat}
              mode={isSelected ? 'contained' : 'outlined'}
              onPress={() => setSelected(cat)}
              textColor={isSelected ? colors.white : colors.text}
              buttonColor={isSelected ? colors.primary : colors.white}
              style={{
                marginRight: 10,
                borderRadius: 22,
                borderColor: colors.primary,
                minWidth: 100,
              }}
              labelStyle={{
                fontSize: 14,
                fontWeight: isSelected ? '600' : '400',
              }}
            >
              {cat}
            </Button>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default CategoryList;
