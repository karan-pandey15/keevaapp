import React, { useState, useEffect } from 'react';
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
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { addItem, incrementQuantity, decrementQuantity } from '../redux/cartSlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ProductDetailPage = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const [product, setProduct] = useState(route.params?.product || {});
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [suggestions, setSuggestions] = useState([]);

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveIndex(index);
  };

  useEffect(() => {
    if (route.params?.product && !route.params.product.description) {
      fetchProductDetails(route.params.product._id || route.params.product.id);
    }
    fetchSuggestions();
  }, [route.params?.product, cartItems]);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('https://api.keeva.in/products');
      const data = await response.json();
      if (data.ok && data.products) {
        const currentProductId = product._id || product.id || route.params?.product?._id || route.params?.product?.id;
        const cartItemIds = new Set(cartItems.map(item => item.id));
        
        // Exclude current product and products already in cart
        const excludeIds = new Set([...cartItemIds, currentProductId]);
        
        let filteredSuggestions = [];

        // Logic adapted from KeevaCart.js
        if (cartItems.length > 0) {
          const cartSubCategories = new Set(cartItems.map(item => item.sub_category).filter(Boolean));
          const cartCategories = new Set(cartItems.map(item => item.category).filter(Boolean));
          
          // Match sub_category
          const subCategoryMatches = data.products.filter(p => 
            p.sub_category && cartSubCategories.has(p.sub_category) && !excludeIds.has(p._id)
          );

          // Group by category for fallback
          const categoryMap = {};
          data.products.forEach(p => {
            if (!excludeIds.has(p._id) && p.category && cartCategories.has(p.category)) {
              if (!categoryMap[p.category]) categoryMap[p.category] = [];
              categoryMap[p.category].push(p);
            }
          });

          filteredSuggestions = [...subCategoryMatches];

          cartCategories.forEach(cat => {
            const alreadyAddedFromThisCat = filteredSuggestions.some(p => p.category === cat);
            if (!alreadyAddedFromThisCat && categoryMap[cat]) {
              filteredSuggestions.push(...categoryMap[cat].slice(0, 3));
            }
          });
        }

        // Add similar products based on current product if suggestions are low
        if (filteredSuggestions.length < 5 && product.category) {
          const similarProducts = data.products.filter(p => 
            p.category === product.category && 
            !excludeIds.has(p._id) && 
            !filteredSuggestions.some(fs => fs._id === p._id)
          );
          filteredSuggestions = [...filteredSuggestions, ...similarProducts];
        }

        setSuggestions(filteredSuggestions.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const fetchProductDetails = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await fetch('https://api.keeva.in/products');
      const data = await response.json();
      if (data.ok && data.products) {
        const found = data.products.find(p => p._id === id || p.id === id);
        if (found) {
          setProduct(found);
        }
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorView}>
          <ActivityIndicator size="large" color="#d91c5c" />
          <Text style={[styles.errorText, { color: '#666' }]}>Loading product details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product || Object.keys(product).length === 0) {
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

  const safeProduct = {
    _id: product._id || product.id || '',
    name: product.name || 'Unknown Product',
    category: product.category || 'Uncategorized',
    description: product.description || 'No description available',
    brand: product.brand || '',
    sub_category: product.sub_category || '',
    images: product.images || (product.image ? [product.image] : [{ url: '' }]),
    price: {
      selling_price: product.price?.selling_price || product.price || 0,
      mrp: product.price?.mrp || product.originalPrice || product.price || 0,
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

  const getSuggestionItemQuantity = (id) => {
    const item = cartItems.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  const handleAddSuggestion = (item) => {
    dispatch(
      addItem({
        id: item._id,
        name: item.name,
        price: item.price.selling_price,
        originalPrice: item.price.mrp,
        image: { uri: item.images?.[0]?.url || '' },
        category: item.category,
        sub_category: item.sub_category,
        quantity: 1,
      })
    );
  };

  const handleIncreaseSuggestionQty = (id) => {
    dispatch(incrementQuantity(id));
  };

  const handleDecreaseSuggestionQty = (id) => {
    dispatch(decrementQuantity(id));
  };

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
          category: safeProduct.category,
          sub_category: safeProduct.sub_category,
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
        <TouchableOpacity 
          style={styles.headerRightButton} 
          onPress={() => navigation.navigate('SearchScreen')}
        >
          <Icon name="search" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* PRODUCT IMAGE CAROUSEL */}
        <View style={styles.imageContainer}>
          {safeProduct.images && safeProduct.images.length > 0 ? (
            <>
              <FlatList
                data={safeProduct.images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={{ width: SCREEN_WIDTH, alignItems: 'center', justifyContent: 'center' }}>
                    <Image
                      source={{ uri: item.url }}
                      style={styles.productImage}
                      resizeMode="contain"
                      onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                    />
                  </View>
                )}
              />
              
              {/* Pagination Dots */}
              {safeProduct.images.length > 1 && (
                <View style={styles.paginationContainer}>
                  {safeProduct.images.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.paginationDot,
                        activeIndex === index ? styles.paginationDotActive : styles.paginationDotInactive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
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

          {/* SUGGESTIONS SECTION */}
          {suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <View style={styles.suggestionsHeader}>
                <Text style={styles.suggestionsTitle}>Suggestion items</Text>
                <Icon name="sparkles" size={18} color="#FFD700" style={{ marginLeft: 6 }} />
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestionsList}
              >
                {suggestions.map((item) => {
                  const suggestionQty = getSuggestionItemQuantity(item._id);
                  return (
                    <TouchableOpacity 
                      key={item._id} 
                      style={styles.suggestionCard}
                      onPress={() => navigation.push('ProductDetailPage', { product: item })}
                      activeOpacity={0.9}
                    >
                      <View style={styles.suggestionImageContainer}>
                        <Image 
                          source={{ uri: item.images?.[0]?.url }} 
                          style={styles.suggestionImage}
                          resizeMode="contain"
                        />
                        {item.price.mrp > item.price.selling_price && (
                          <View style={styles.miniDiscountBadge}>
                            <Text style={styles.miniDiscountText}>
                              {Math.round(((item.price.mrp - item.price.selling_price) / item.price.mrp) * 100)}% OFF
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.suggestionInfo}>
                        <Text style={styles.suggestionName} numberOfLines={2}>{item.name}</Text>
                        <Text style={styles.suggestionQty}>{item.quantity_info?.size} {item.quantity_info?.unit}</Text>
                        <View style={styles.suggestionPriceRow}>
                          <View>
                            <Text style={styles.suggestionPrice}>₹{item.price.selling_price}</Text>
                            {item.price.mrp > item.price.selling_price && (
                              <Text style={styles.suggestionMRP}>₹{item.price.mrp}</Text>
                            )}
                          </View>
                        </View>
                      </View>
                      
                      {/* Suggestion Add/Quantity Control */}
                      <View style={styles.suggestionActionContainer}>
                        {suggestionQty > 0 ? (
                          <View style={styles.suggestionQtyControl}>
                            <TouchableOpacity 
                              style={styles.suggestionQtyBtn}
                              onPress={() => handleDecreaseSuggestionQty(item._id)}
                            >
                              <Text style={styles.suggestionQtyBtnText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.suggestionQtyText}>{suggestionQty}</Text>
                            <TouchableOpacity 
                              style={styles.suggestionQtyBtn}
                              onPress={() => handleIncreaseSuggestionQty(item._id)}
                            >
                              <Text style={styles.suggestionQtyBtnText}>+</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity 
                            style={styles.suggestionAddBtn}
                            onPress={() => handleAddSuggestion(item)}
                          >
                            <Text style={styles.suggestionAddBtnText}>Add</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
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
  headerRightButton: {
    padding: 8,
  },
  scrollContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  imageContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 320,
  },
  productImage: {
    width: SCREEN_WIDTH * 0.9,
    height: 300,
  },
  paginationContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#d91c5c',
    width: 20,
  },
  paginationDotInactive: {
    backgroundColor: '#E0E0E0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
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
  suggestionsContainer: {
    marginTop: 20,
    paddingTop: 15,
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  suggestionsList: {
    paddingRight: 16,
    paddingBottom: 10,
  },
  suggestionCard: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
    paddingBottom: 8,
  },
  suggestionImageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionImage: {
    width: '80%',
    height: '80%',
  },
  miniDiscountBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#d91c5c',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniDiscountText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  suggestionInfo: {
    padding: 8,
    minHeight: 100,
  },
  suggestionName: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    height: 34,
    marginBottom: 4,
  },
  suggestionQty: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  suggestionPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  suggestionPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  suggestionMRP: {
    fontSize: 10,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  suggestionActionContainer: {
    paddingHorizontal: 8,
    marginTop: 4,
  },
  suggestionAddBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d91c5c',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionAddBtnText: {
    color: '#d91c5c',
    fontSize: 12,
    fontWeight: '700',
  },
  suggestionQtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#d91c5c',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  suggestionQtyBtn: {
    padding: 4,
  },
  suggestionQtyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  suggestionQtyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
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
    paddingBottom: 14,
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
