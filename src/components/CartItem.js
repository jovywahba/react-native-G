import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text, Card, IconButton, Checkbox } from 'react-native-paper';

const CartItem = ({ item, onQtyChange, onCheck, readonly = false }) => {
  const [qty, setQty] = useState(Number(item.quantity) || 1);
  useEffect(() => {
    setQty(Number(item.quantity) || 1);
  }, [item.quantity]);
  const handleChange = (delta) => {
    const newQty = qty + delta;
    if (newQty < 1) return; 
    setQty(newQty); 
    onQtyChange(item.id, delta); 
  };

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        {!readonly && (
          <Checkbox.Android
            status={item.checked ? 'checked' : 'unchecked'}
            onPress={onCheck}
            color="#517073"
            uncheckedColor="#ccc"
          />
        )}

        <Image source={{ uri: item.imageUrl }} style={styles.image} />

        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.desc}>{item.description}</Text>
          <Text style={styles.price}>${item.price}</Text>
        </View>

        {!readonly && (
          <View style={styles.qtyContainer}>
            <IconButton
              icon="minus"
              size={16}
              onPress={() => handleChange(-1)}
            />
            <Text style={styles.qtyText}>{qty}</Text>
            <IconButton
              icon="plus"
              size={16}
              onPress={() => handleChange(+1)}
            />
          </View>
        )}
      </View>
    </Card>
  );
};

export default CartItem;

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 65,
    height: 65,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontWeight: '700',
    fontSize: 15,
    color: '#395457',
  },
  desc: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
  },
  price: {
    fontWeight: '600',
    fontSize: 14,
    color: '#395457',
    marginTop: 4,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F3F2',
    borderRadius: 12,
    paddingHorizontal: 2,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#395457',
  },
});
