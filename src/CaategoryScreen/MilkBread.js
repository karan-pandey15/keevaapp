import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import CartButton from '../helperComponent/CartButton';
import { addItem, incrementQuantity, decrementQuantity } from '../redux/cartSlice';

const SIDEBAR_WIDTH = 100;
const PRODUCTS_GRID_PADDING = 8;
const CARD_WIDTH_PERCENT = '49%';

const API_URL = 'https://api.keeva.in/products/category/MilkBread';

const MilkBread  = () => {
  // ✅ ALL HOOKS AT TOP (VERY IMPORTANT)
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  const [loading, setLoading] = useState(true);
  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  // 🔹 API CALL
  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      try {
        const res = await fetch(API_URL);
        const json = await res.json();

        if (mounted && json.ok) {
          const list = json.products;

          const subs = [...new Set(list.map(p => p.sub_category))];

          setSubCategories(subs);
          setSelectedSubCategory(subs[0]);
          setProducts(list);
        }
      } catch (e) {
        console.log('API Error:', e);
      } finally {
        mounted && setLoading(false);
      }
    };

    fetchProducts();
    return () => (mounted = false);
  }, []);

  const filteredProducts = selectedSubCategory
    ? products.filter(p => p.sub_category === selectedSubCategory)
    : [];

  const getItemQuantity = (productId) => {
    const item = cartItems.find(i => i.id === productId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (product) => {
    dispatch(addItem({
      id: product._id,
      name: product.name,
      price: product.price.selling_price,
      originalPrice: product.price.mrp,
      image: { uri: product.images?.[0]?.url },
      category: product.category,
      sub_category: product.sub_category,
      quantity: 1,
    }));
  };

  const handleIncreaseQty = (productId) => {
    dispatch(incrementQuantity(productId));
  };

  const handleDecreaseQty = (productId) => {
    dispatch(decrementQuantity(productId));
  };

  const getSubCategoryImage = (subCategory) => {
    const product = products.find(p => p.sub_category === subCategory);
    return product?.images?.[0]?.url;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Milk & Breads</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('SearchScreen')}>
          <Icon name="search" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* LOADER (NO EARLY RETURN ❗) */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#9333ea" />
        </View>
      ) : (
        <View style={styles.content}>
          {/* SIDEBAR */}
          <View style={styles.sidebar} showsVerticalScrollIndicator={false}>
            {subCategories.map((sub, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.categoryItem,
                  selectedSubCategory === sub && styles.categoryItemActive,
                ]}
                onPress={() => {
                  setSelectedSubCategory(sub);
                }}
              >
                <View style={styles.categoryImagePlaceholder}>
                  {getSubCategoryImage(sub) ? (
                    <Image 
                      source={{ uri: getSubCategoryImage(sub) }} 
                      style={styles.categoryIcon} 
                    />
                  ) : (
                    <Text style={{ fontSize: 12, color: '#999' }}>No Image</Text>
                  )}
                </View>
                <Text style={styles.categoryName} numberOfLines={2}>
                  {sub}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* PRODUCTS */}
          <ScrollView
            style={styles.productsContainer}
            contentContainerStyle={styles.productsScrollContent}
          >
            <View style={styles.productsGrid}>
              {filteredProducts.map(item => {
                const qty = getItemQuantity(item._id);
                const showDiscount =
                  item.price.mrp > item.price.selling_price;

                return (
                  <TouchableOpacity
                    key={item._id}
                    style={styles.productCard}
                    onPress={() =>
                      navigation.navigate('ProductDetailPage', { product: item })
                    }
                    activeOpacity={0.7}
                  >
                    <View style={styles.productImageContainer}>
                      <Image
                        source={{ uri: item.images?.[0]?.url }}
                        style={styles.productImage}
                      />
                    </View>

                    <View style={styles.productDetails}>
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
                              showDiscount && { color: '#fff' },
                            ]}
                          >
                            ₹{item.price.selling_price}
                          </Text>
                        </View>
                        {showDiscount && (
                          <Text style={styles.originalPrice}>
                            ₹{item.price.mrp}
                          </Text>
                        )}
                      </View>

                      <Text style={styles.productName} numberOfLines={2}>
                        {item.name}
                      </Text>

                      <Text style={styles.productQuantity}>
                        {item.quantity_info.size} {item.quantity_info.unit}
                      </Text>

                      {qty > 0 ? (
                        <View style={styles.quantityControl}>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleDecreaseQty(item._id)}
                          >
                            <Icon name="remove" size={20} color="#fff" />
                          </TouchableOpacity>
                          <Text style={styles.quantityText}>{qty}</Text>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleIncreaseQty(item._id)}
                          >
                            <Icon name="add" size={20} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.addButton}
                          onPress={() => handleAddToCart(item)}
                        >
                          <Text style={styles.addButtonText}>ADD</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}
      <CartButton />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginTop: 34,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  headerIcon: {
    padding: 2,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },

  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#f3f4f6',
  },
  categoryItem: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: SIDEBAR_WIDTH,
  },
  categoryItemActive: {
    backgroundColor: '#f5f3ff',
  },
  categoryIconWrapper: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderRadius: 8,
  },
  categoryIconWrapperActive: {
    backgroundColor: '#f5f3ff',
  },
  categoryImagePlaceholder: {
    width: 70,
    height: 70,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  categoryName: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
    color: '#1f2937',
    lineHeight: 14,
    width: SIDEBAR_WIDTH - 4,
  },

  productsContainer: {
    flex: 1,
    backgroundColor: '#f5f3ff',
  },
  productsScrollContent: {
    paddingHorizontal: PRODUCTS_GRID_PADDING,
    paddingVertical: PRODUCTS_GRID_PADDING,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  productCard: {
    width: CARD_WIDTH_PERCENT,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  soldOutLabelContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 8,
  },
  soldOutLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
  },

  productImageContainer: {
    backgroundColor: '#fff',
    aspectRatio: 1 / 1.05,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  productImage: {
    width: '85%',
    height: '85%',
    resizeMode: 'contain',
  },

  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContent: {
    width: '90%',
    height: '90%',
    backgroundColor: '#9333ea',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  badgePieces: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    lineHeight: 8,
    textTransform: 'uppercase',
  },

  productDetails: {
    padding: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
    minHeight: 20,
  },
  priceTag: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 0,
  },
  priceTagGreen: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 11,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  productName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
    lineHeight: 16,
    minHeight: 32,
  },
  productQuantity: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1f2937',
  },

  addButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ec4899',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ec4899',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quantityControl: {
    backgroundColor: '#ec4899',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 4,
    height: 36,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: '#ec4899',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
});


export default MilkBread ;
