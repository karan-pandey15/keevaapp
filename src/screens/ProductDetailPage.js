import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { addItem, incrementQuantity, decrementQuantity } from '../redux/cartSlice';

const ProductDetailPage = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  if (!route?.params?.product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorView}>
          <Icon name="alert-circle" size={60} color="#E57373" />
          <Text style={styles.errorText}>Product data not found</Text>
          <TouchableOpacity
            style={styles.backButtonError}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonErrorText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const product = route.params.product || {};

  const safeProduct = {
    _id: product._id || '',
    name: product.name || 'Unknown Product',
    category: product.category || 'Uncategorized',
    description: product.description || 'No description available',
    brand: product.brand || '',
    sub_category: product.sub_category || '',
    images: product.images || [{ url: '' }],
    price: {
      selling_price: product.price?.selling_price || 0,
      mrp: product.price?.mrp || 0,
      discount_percent: product.price?.discount_percent || 0,
    },
    quantity_info: {
      size: product.quantity_info?.size || '1',
      unit: product.quantity_info?.unit || 'piece',
    },
    inventory: {
      stock_available: product.inventory?.stock_available !== false,
    },
    averageRating: product.averageRating || 0,
  };

  const getTotalCartQuantity = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartQuantity = () => {
    const item = cartItems.find((i) => i.id === safeProduct._id);
    return item ? item.quantity : 0;
  };

  const currentQuantity = getCartQuantity();
  const totalCartQuantity = getTotalCartQuantity();

  const handleAddToCart = () => {
    if (!safeProduct._id) {
      Alert.alert('Error', 'Product ID is missing');
      return;
    }

    try {
      dispatch(
        addItem({
          id: safeProduct._id,
          name: safeProduct.name,
          price: safeProduct.price.selling_price,
          originalPrice: safeProduct.price.mrp,
          image: { uri: safeProduct.images?.[0]?.url || '' },
          quantity: 1,
        })
      );
    } catch (err) {
      console.error('Add to cart error:', err);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const handleIncreaseQty = () => {
    dispatch(incrementQuantity(safeProduct._id));
  };

  const handleDecreaseQty = () => {
    dispatch(decrementQuantity(safeProduct._id));
  };

  const showDiscount =
    safeProduct.price.mrp > safeProduct.price.selling_price;
  const discountPercent = safeProduct.price.discount_percent || 0;
  const imageUrl = safeProduct.images?.[0]?.url;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* PRODUCT IMAGE */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.productImage}
              resizeMode="contain"
              onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
            />
          ) : (
            <View style={[styles.productImage, styles.placeholderImage]}>
              <Icon name="image" size={80} color="#CCC" />
            </View>
          )}
          {showDiscount && discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPercent}% OFF</Text>
            </View>
          )}
        </View>

        {/* PRODUCT INFO */}
        <View style={styles.infoContainer}>
          {/* PRICE SECTION */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <View
                style={[
                  styles.priceTag,
                  showDiscount && styles.priceTagGreen,
                ]}
              >
                <Text
                  style={[
                    styles.priceText,
                    showDiscount && styles.priceLightText,
                  ]}
                >
                  ₹{safeProduct.price.selling_price}
                </Text>
              </View>
              {showDiscount && (
                <Text style={styles.originalPrice}>
                  ₹{safeProduct.price.mrp}
                </Text>
              )}
            </View>
          </View>

          {/* PRODUCT NAME */}
          <Text style={styles.productName}>{safeProduct.name}</Text>

          {/* PRODUCT QUANTITY INFO */}
          <View style={styles.quantityInfoRow}>
            <Text style={styles.quantityInfo}>
              {safeProduct.quantity_info.size} {safeProduct.quantity_info.unit}
            </Text>
            {safeProduct.inventory?.stock_available && (
              <Text style={styles.inStockText}>In Stock</Text>
            )}
          </View>

          {/* PRODUCT DESCRIPTION */}
          {safeProduct.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{safeProduct.description}</Text>
            </View>
          )}

          {/* PRODUCT HIGHLIGHTS */}
          {safeProduct.brand && (
            <View style={styles.highlightSection}>
              <Text style={styles.highlightTitle}>Brand</Text>
              <Text style={styles.highlightValue}>{safeProduct.brand}</Text>
            </View>
          )}

          {safeProduct.category && (
            <View style={styles.highlightSection}>
              <Text style={styles.highlightTitle}>Category</Text>
              <Text style={styles.highlightValue}>{safeProduct.category}</Text>
            </View>
          )}

          {safeProduct.sub_category && (
            <View style={styles.highlightSection}>
              <Text style={styles.highlightTitle}>Sub Category</Text>
              <Text style={styles.highlightValue}>{safeProduct.sub_category}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FOOTER BUTTON SECTION */}
      <View style={styles.footerContainer}>
        {/* LEFT SIDE - CART ICON */}
        <TouchableOpacity
          style={styles.cartIconContainer}
          onPress={() => navigation.navigate('KeevaCart')}
        >
          <Icon name="cart" size={28} color="#000" />
          {totalCartQuantity > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalCartQuantity}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* RIGHT SIDE - ADD TO CART / QUANTITY BUTTONS */}
        {currentQuantity > 0 ? (
          <View style={styles.quantityControlContainer}>
            <TouchableOpacity
              style={styles.quantityButtonSmall}
              onPress={handleDecreaseQty}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantityDisplayText}>{currentQuantity}</Text>
            <TouchableOpacity
              style={styles.quantityButtonSmall}
              onPress={handleIncreaseQty}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <Text style={styles.addToCartText}>Add to cart</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#E57373',
    textAlign: 'center',
    fontWeight: '500',
  },
  backButtonError: {
    marginTop: 20,
    backgroundColor: '#6A1B9A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonErrorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fff',
    marginTop:20
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 24,
  },
  scrollContent: {
    flex: 1,
    backgroundColor: '#f5f3ff',
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  imageContainer: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 300,
  },
  productImage: {
    width: '100%',
    height: 280,
    resizeMode: 'contain',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  discountBadge: {
    position: 'absolute',
    top: 20,
    right: 16,
    backgroundColor: '#d91c5c',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  discountText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  infoContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  priceSection: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceTag: {
    backgroundColor: '#2d8659',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  priceTagGreen: {
    backgroundColor: '#2d8659',
  },
  priceText: {
    color: '#2d8659',
    fontSize: 16,
    fontWeight: '700',
  },
  priceLightText: {
    color: '#fff',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#999',
    fontSize: 14,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 24,
  },
  quantityInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  quantityInfo: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  inStockText: {
    fontSize: 12,
    color: '#2d8659',
    fontWeight: '600',
    backgroundColor: '#e6f7f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  descriptionSection: {
    marginTop: 12,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  highlightSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  highlightTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  highlightValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  footerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cartIconContainer: {
    position: 'relative',
    padding: 10,
    marginRight: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: 0,
    backgroundColor: '#d91c5c',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#d91c5c',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  quantityControlContainer: {
    flex: 1,
    backgroundColor: '#d91c5c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    minHeight: 48,
  },
  quantityButtonSmall: {
    width: 38,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  quantityDisplayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    minWidth: 35,
    textAlign: 'center',
  },
});

export default ProductDetailPage;
