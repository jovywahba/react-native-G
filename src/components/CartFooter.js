import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';

const CartFooter = ({ total, itemCount, onCheckout,title,totaltext,textitem }) => (
  <Surface style={styles.bottomSurface} elevation={4}>
    <View style={styles.totalRow}>
      <Text style={styles.totalLabel}>{totaltext} {itemCount} {textitem}</Text>
      <Text style={styles.totalPrice}>${total}</Text>
    </View>
    <Button
      mode="contained"
      onPress={onCheckout}
      style={styles.checkoutBtn}
      buttonColor="#395457"
      labelStyle={{ color: '#fff', fontWeight: '600', fontSize: 16 }}
      contentStyle={{ height: 50 }}
    >
     {title}
    </Button>
  </Surface>
);

export default CartFooter;

const styles = StyleSheet.create({
  bottomSurface: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 50,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: { fontSize: 15, color: '#777' },
  totalPrice: { fontSize: 20, fontWeight: '700', color: '#517073' },
  checkoutBtn: { borderRadius: 12, paddingVertical: 6 },
});
