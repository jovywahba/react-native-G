import React from "react";
import { ScrollView, View } from "react-native";
import { Button } from "react-native-paper";
import colors from "../constants/colors";
import { useTranslation } from "react-i18next";

const CategoryList = ({ selected, setSelected }) => {
  const { t } = useTranslation();

  const categories = ["All", "Chairs", "Cupboards", "Tables", "Lamps"];

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
          // استخدام المفتاح الصحيح للترجمة
          const label = t(`category_${cat.toLowerCase()}`);

          return (
            <Button
              key={cat}
              mode={isSelected ? "contained" : "outlined"}
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
                fontWeight: isSelected ? "600" : "400",
              }}
            >
              {label}
            </Button>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default CategoryList;
