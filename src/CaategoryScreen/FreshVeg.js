import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const SIDEBAR_WIDTH = 100;
const PRODUCTS_GRID_PADDING = 8;
const CARD_WIDTH_PERCENT = '49%';

const FreshVeg = () => {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [cart, setCart] = useState({});

  const vegetablePlaceholder = require('../images/vegetable.png');

  const categories = [
    { id: 1, name: 'Fresh Veg', image: vegetablePlaceholder },
    { id: 2, name: 'Green Veg', image: vegetablePlaceholder },
    { id: 3, name: 'Fresh Vege', image: vegetablePlaceholder },
    { id: 4, name: 'Healthy Veg', image: vegetablePlaceholder },
    { id: 5, name: 'Season Veg', image: vegetablePlaceholder },
    { id: 6, name: 'Batters & Mixes', image: vegetablePlaceholder }, 
  ];

const categoryProducts = {
  1: [ // Leafy Vegetables
    {
      id: 1,
      name: 'Fresh Spinach Leaves',
      price: 20,
      originalPrice: 25,
      quantity: '250 g',
      rating: 4.7,
      reviews: '1.1K',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 2,
      name: 'Coriander Bunch',
      price: 15,
      originalPrice: null,
      quantity: '1 bunch',
      rating: 4.6,
      reviews: '900',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 3,
      name: 'Fresh Mint Leaves',
      price: 12,
      originalPrice: null,
      quantity: '1 bunch',
      rating: 4.5,
      reviews: '540',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 4,
      name: 'Fenugreek (Methi) Leaves',
      price: 18,
      originalPrice: null,
      quantity: '1 bunch',
      rating: 4.5,
      reviews: '230',
      image: vegetablePlaceholder,
      available: true,
      badge: { pieces: '1', text: 'Bunch', brand: 'Fresh' },
    },
    {
      id: 5,
      name: 'Cabbage (Green)',
      price: 35,
      originalPrice: 40,
      quantity: '1 pc (600–800 g)',
      rating: 4.8,
      reviews: '800',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 6,
      name: 'Lettuce Iceberg',
      price: 60,
      originalPrice: 70,
      quantity: '1 pc',
      rating: 4.6,
      reviews: '400',
      image: vegetablePlaceholder,
      available: true,
    },
  ],

  2: [ // Root Vegetables
    {
      id: 11,
      name: 'Fresh Carrots',
      price: 30,
      originalPrice: 35,
      quantity: '500 g',
      rating: 4.3,
      reviews: '450',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 12,
      name: 'Beetroot',
      price: 28,
      originalPrice: null,
      quantity: '500 g',
      rating: 4.5,
      reviews: '300',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 13,
      name: 'Radish (Mooli)',
      price: 22,
      originalPrice: 25,
      quantity: '500 g',
      rating: 4.4,
      reviews: '210',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 14,
      name: 'Sweet Potato (Shakarkandi)',
      price: 40,
      originalPrice: null,
      quantity: '500 g',
      rating: 4.2,
      reviews: '95',
      image: vegetablePlaceholder,
      available: true,
    },
  ],

  3: [ // Gourds & Melons
    {
      id: 21,
      name: 'Bottle Gourd (Lauki)',
      price: 30,
      originalPrice: null,
      quantity: '1 pc (700–900 g)',
      rating: 4.8,
      reviews: '300',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 22,
      name: 'Ridge Gourd (Tori)',
      price: 35,
      originalPrice: 40,
      quantity: '500 g',
      rating: 4.6,
      reviews: '250',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 23,
      name: 'Bitter Gourd (Karela)',
      price: 45,
      originalPrice: 50,
      quantity: '500 g',
      rating: 4.7,
      reviews: '180',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 24,
      name: 'Cucumber (Kheera)',
      price: 28,
      originalPrice: null,
      quantity: '500 g',
      rating: 4.5,
      reviews: '220',
      image: vegetablePlaceholder,
      available: true,
    },
  ],

  4: [ // Allium Family (Onion, Garlic)
    {
      id: 31,
      name: 'Onion (Red)',
      price: 25,
      originalPrice: null,
      quantity: '1 kg',
      rating: 4.6,
      reviews: '900',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 32,
      name: 'Garlic (Desi)',
      price: 80,
      originalPrice: 90,
      quantity: '250 g',
      rating: 4.5,
      reviews: '700',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 33,
      name: 'Spring Onion Bunch',
      price: 20,
      originalPrice: null,
      quantity: '1 bunch',
      rating: 4.7,
      reviews: '280',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 34,
      name: 'Ginger (Adrak)',
      price: 70,
      originalPrice: 80,
      quantity: '500 g',
      rating: 4.8,
      reviews: '500',
      image: vegetablePlaceholder,
      available: true,
    },
  ],

  5: [ // Peppers & Chilies
    {
      id: 41,
      name: 'Green Capsicum',
      price: 60,
      originalPrice: 70,
      quantity: '500 g',
      rating: 4.7,
      reviews: '600',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 42,
      name: 'Red Bell Pepper',
      price: 90,
      originalPrice: null,
      quantity: '1 pc',
      rating: 4.6,
      reviews: '350',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 43,
      name: 'Yellow Bell Pepper',
      price: 90,
      originalPrice: 110,
      quantity: '1 pc',
      rating: 4.5,
      reviews: '420',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 44,
      name: 'Green Chilies (Hari Mirch)',
      price: 20,
      originalPrice: null,
      quantity: '100 g',
      rating: 4.4,
      reviews: '290',
      image: vegetablePlaceholder,
      available: true,
    },
  ],

  6: [ // Potatoes & Tomatoes
    {
      id: 51,
      name: 'Fresh Potatoes',
      price: 25,
      originalPrice: 30,
      quantity: '1 kg',
      rating: 4.4,
      reviews: '2.3K',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 52,
      name: 'Tomatoes (Hybrid)',
      price: 35,
      originalPrice: null,
      quantity: '1 kg',
      rating: 4.3,
      reviews: '1.1K',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 53,
      name: 'Cherry Tomatoes Box',
      price: 80,
      originalPrice: 90,
      quantity: '200 g',
      rating: 4.5,
      reviews: '300',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 54,
      name: 'Sweet Potato (Shakarkandi)',
      price: 50,
      originalPrice: 55,
      quantity: '500 g',
      rating: 4.2,
      reviews: '140',
      image: vegetablePlaceholder,
      available: true,
    },
  ],

  7: [ // Beans & Okra
    {
      id: 61,
      name: 'Lady Finger (Bhindi)',
      price: 50,
      originalPrice: null,
      quantity: '500 g',
      rating: 4.6,
      reviews: '850',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 62,
      name: 'French Beans',
      price: 70,
      originalPrice: 75,
      quantity: '500 g',
      rating: 4.7,
      reviews: '540',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 63,
      name: 'Cluster Beans (Gawar)',
      price: 45,
      originalPrice: null,
      quantity: '500 g',
      rating: 4.5,
      reviews: '280',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 64,
      name: 'Green Peas (Matar)',
      price: 80,
      originalPrice: 90,
      quantity: '500 g',
      rating: 4.6,
      reviews: '380',
      image: vegetablePlaceholder,
      available: true,
    },
  ],

  8: [ // Exotic Vegetables
    {
      id: 71,
      name: 'Broccoli Fresh',
      price: 120,
      originalPrice: null,
      quantity: '1 pc (300–400 g)',
      rating: 4.5,
      reviews: '420',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 72,
      name: 'Zucchini (Green)',
      price: 90,
      originalPrice: 110,
      quantity: '500 g',
      rating: 4.6,
      reviews: '380',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 73,
      name: 'Baby Corn Pack',
      price: 70,
      originalPrice: null,
      quantity: '200 g',
      rating: 4.7,
      reviews: '520',
      image: vegetablePlaceholder,
      available: true,
    },
    {
      id: 74,
      name: 'Mushrooms Button',
      price: 60,
      originalPrice: 75,
      quantity: '200 g',
      rating: 4.4,
      reviews: '290',
      image: vegetablePlaceholder,
      available: true,
    },
  ],
};


  const currentProducts = categoryProducts[selectedCategory] || [];
  const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name || 'Dairy, Bread & Eggs';

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCart({});
  };

  const addToCart = (productId) => {
    setCart((prev) => ({
      ...prev,
      [productId]: 1,
    }));
  };

  const increaseQuantity = (productId) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const decreaseQuantity = (productId) => {
    setCart((prev) => {
      const currentQty = prev[productId] || 0;
      if (currentQty <= 1) {
        const newCart = { ...prev };
        delete newCart[productId];
        return newCart;
      }
      return {
        ...prev,
        [productId]: currentQty - 1,
      };
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedCategoryName}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('SearchScreen')}>
            <Icon name="search" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.sidebar} showsVerticalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedCategory === category.id && styles.categoryItemActive,
              ]}
              onPress={() => handleCategoryChange(category.id)}
            >
              <View style={[
                styles.categoryIconWrapper,
                selectedCategory === category.id && styles.categoryIconWrapperActive,
              ]}>
                <View style={styles.categoryImagePlaceholder}>
                  <Image source={category.image} style={styles.categoryIcon} />
                </View>
              </View>
              <Text style={styles.categoryName} numberOfLines={2}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          style={styles.productsContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productsScrollContent}
        >
          <View style={styles.productsGrid}>
            {currentProducts.map((product) => {
              const quantity = cart[product.id] || 0;
              const isInCart = quantity > 0;
              const showGreenTag = !!product.originalPrice;

              return (
                <View 
                  key={product.id} 
                  style={styles.productCard}
                >
                  {!product.available && (
                    <View style={styles.soldOutLabelContainer}>
                      <Text style={styles.soldOutLabel}>Sold out</Text>
                    </View>
                  )}

                  <View style={styles.productImageContainer}>
                    <Image source={product.image} style={styles.productImage} />
                    
                    {product.badge && (
                      <View style={styles.badge}>
                        <View style={styles.badgeContent}>
                          <Text style={styles.badgePieces}>{product.badge.pieces}</Text>
                          <Text style={styles.badgeText}>{product.badge.text}</Text>
                        </View>
                      </View>
                    )}
                  </View>

                  <View style={styles.productDetails}>
                    <View style={styles.priceRow}>
                      <View style={[
                        styles.priceTag, 
                        showGreenTag && styles.priceTagGreen, 
                      ]}>
                        <Text style={[
                          styles.priceText,
                          showGreenTag ? { color: '#fff' } : { color: '#000' }
                        ]}>
                          ₹{product.price}
                        </Text>
                      </View>
                      {product.originalPrice && (
                        <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
                      )}
                    </View>

                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={styles.productQuantity}>{product.quantity}</Text>

                    <View style={styles.ratingRow}>
                      <Icon name="star" size={14} color="#16a34a" />
                      <Text style={styles.ratingText}>
                        {product.rating}({product.reviews})
                      </Text>
                    </View>

                    {isInCart ? (
                      <View style={styles.quantityControl}>
                        <TouchableOpacity style={styles.quantityButton} onPress={() => decreaseQuantity(product.id)}>
                          <Icon name="remove" size={20} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{quantity}</Text>
                        <TouchableOpacity style={styles.quantityButton} onPress={() => increaseQuantity(product.id)}>
                          <Icon name="add" size={20} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.addButton} onPress={() => addToCart(product.id)}>
                        <Text style={styles.addButtonText}>ADD</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
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

export default FreshVeg;
