import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

export default function CartButton() {
  const navigation = useNavigation();
  const cartItems = useSelector((state) => state.cart.items);
  const itemCount = cartItems.length;

  return (
    <TouchableOpacity
      style={styles.cartButton}
      onPress={() => navigation.navigate('KeevaCart')}
      activeOpacity={0.8}
    >
      <View style={styles.cartContent}>
        <View style={styles.cartIconContainer}>
          <Icon name="cart" size={28} color="#FFFFFF" />
          <View style={styles.badge}>
            <Icon name="star" size={12} color="#FF0066" />
          </View>
        </View>

        <View style={styles.cartTextContainer}>
          <Text style={styles.cartTitle}>Cart</Text>
          <Text style={styles.cartSubtitle}>
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cartButton: {
    position: 'absolute',
    bottom: 2,
    right: 3,
    backgroundColor: '#FF0066',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 9999,
  },
  cartContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartTextContainer: {
    justifyContent: 'center',
  },
  cartTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartSubtitle: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
  },
});
