import React, { useMemo, useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
  Animated,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IconS from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { incrementQuantity, decrementQuantity, addItem } from '../redux/cartSlice';
import CustomToast from '../helperComponent/CustomToast';

const KeevaCartScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const [toastVisible, setToastVisible] = useState(false);
  const [eligibleCoupon, setEligibleCoupon] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchEligibleCoupon();
    fetchSuggestions();
  }, [cartItems]);

  const fetchSuggestions = async () => {
    if (cartItems.length === 0) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch('https://api.keeva.in/products');
      const data = await response.json();
      if (data.ok && data.products) {
        const cartItemIds = new Set(cartItems.map(item => item.id));
        let filteredSuggestions = [];

        if (cartItems.length === 1) {
          // If only one product in cart, display all products of its category
          const cartItem = cartItems[0];
          filteredSuggestions = data.products.filter(p => 
            p.category === cartItem.category && !cartItemIds.has(p._id)
          );
        } else {
          // Get unique sub_categories and categories from cart items
          const cartSubCategories = new Set(cartItems.map(item => item.sub_category).filter(Boolean));
          const cartCategories = new Set(cartItems.map(item => item.category).filter(Boolean));
          
          // Match sub_category if sub_category matches from cart product and product api
          const subCategoryMatches = data.products.filter(p => 
            p.sub_category && cartSubCategories.has(p.sub_category) && !cartItemIds.has(p._id)
          );

          // Group products by category for fallback
          const categoryMap = {};
          data.products.forEach(p => {
            if (!cartItemIds.has(p._id) && p.category && cartCategories.has(p.category)) {
              if (!categoryMap[p.category]) categoryMap[p.category] = [];
              categoryMap[p.category].push(p);
            }
          });

          // Combine results: Start with sub_category matches
          filteredSuggestions = [...subCategoryMatches];

          // If no sub category match for a category in cart, pick 2 products from that category
          cartCategories.forEach(cat => {
            const alreadyAddedFromThisCat = filteredSuggestions.some(p => p.category === cat);
            if (!alreadyAddedFromThisCat && categoryMap[cat]) {
              filteredSuggestions.push(...categoryMap[cat].slice(0, 2));
            }
          });
        }

        setSuggestions(filteredSuggestions.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleAddSuggestion = (product) => {
    dispatch(
      addItem({
        id: product._id,
        name: product.name,
        price: product.price.selling_price,
        originalPrice: product.price.mrp,
        image: { uri: product.images?.[0]?.url || '' },
        category: product.category,
        sub_category: product.sub_category,
        quantity: 1,
      })
    );
  };

  const fetchEligibleCoupon = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await fetch('https://api.keeva.in/coupons/eligible', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.ok && data.eligibleCoupon) {
        setEligibleCoupon(data.eligibleCoupon);
      }
    } catch (error) {
      console.error('Error fetching eligible coupon:', error);
    }
  };

  const handleApplyCoupon = async (code) => {
    if (appliedCoupon) return;
    setIsApplying(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch('https://api.keeva.in/coupons/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });
      const data = await response.json();
      if (data.ok) {
        setAppliedCoupon(data.coupon);
        triggerCelebration();
      } else {
        alert(data.message || 'Failed to apply coupon');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const triggerCelebration = () => {
    setShowCelebration(true);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => setShowCelebration(false));
  };

  const updateQuantity = (id, increment) => {
    if (increment > 0) {
      dispatch(incrementQuantity(id));
    } else {
      dispatch(decrementQuantity(id));
    }
  };

  const calculateTotals = useMemo(() => {
    const itemTotal = cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const originalTotal = cartItems.reduce((sum, item) => {
      const original = item.originalPrice || item.price;
      return sum + (original * item.quantity);
    }, 0);

    let discount = Math.max(0, originalTotal - itemTotal);
    
    // Add coupon discount
    if (appliedCoupon) {
      if (appliedCoupon.type === 'FIXED') {
        discount += appliedCoupon.value;
      } else if (appliedCoupon.type === 'PERCENTAGE') {
        discount += (itemTotal * appliedCoupon.value) / 100;
      }
    }

    const deliveryFee = itemTotal >= 159 ? 0 : 30;
    const handlingFee = 0;
    const finalTotal = Math.max(0, itemTotal + deliveryFee + handlingFee - (appliedCoupon ? (appliedCoupon.type === 'FIXED' ? appliedCoupon.value : (itemTotal * appliedCoupon.value) / 100) : 0));

    return {
      itemTotal: Math.round(itemTotal),
      discount: Math.round(discount),
      deliveryFee,
      handlingFee,
      finalTotal: Math.round(finalTotal),
      totalSavings: Math.round(discount + deliveryFee + handlingFee),
    };
  }, [cartItems, appliedCoupon]);

  const handlePayClick = async () => {
    if (cartItems.length === 0) {
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        setToastVisible(true);
        setTimeout(() => {
          navigation.navigate('Screen1');
        }, 1000);
        return;
      }

      navigation.navigate('CheckoutScreen', {
        itemTotal: calculateTotals.itemTotal,
        discount: calculateTotals.discount,
        deliveryFee: calculateTotals.deliveryFee,
        finalTotal: calculateTotals.finalTotal,
        appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
      });
    } catch (error) {
      console.error('Error checking token:', error);
    }
  };

  const handleBrowseProducts = () => {
    navigation.navigate('AllCategoryPage');
  };

  const itemTotal = calculateTotals.itemTotal;
  const finalTotal = calculateTotals.finalTotal;
  const deliveryFee = calculateTotals.deliveryFee;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header */}
      <View style={styles.header}>
           <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <IconS name="chevron-left" size={24} color="#000" />
                </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
       <View style={styles.headerRight}>
                <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('SearchScreen')}>
                  <Icon name="search" size={24} color="#000" />
                </TouchableOpacity>
              </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Savings Banner */}
     
       
 
        {/* Cart Items */}
        {Array.isArray(cartItems) && cartItems.length > 0 ? (
          <>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('ProductDetailPage', { product: { _id: item.id, ...item } })}
                >
                  <Image 
                    source={item.image} 
                    style={styles.itemImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  <View style={styles.qtyControl}>
                    <TouchableOpacity 
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.id, -1)}
                    >
                      <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity 
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.id, 1)}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.itemPriceBox}>
                  <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                  {item.originalPrice && (
                    <Text style={styles.itemOriginalPrice}>₹{item.originalPrice * item.quantity}</Text>
                  )}
                </View>
              </View>
            ))}

            {/* Coupon Section */}
            {eligibleCoupon && cartItems.length > 0 && (
              <View style={[styles.couponCard, appliedCoupon && styles.couponCardApplied]}>
                <View style={styles.couponLeft}>
                  <Icon 
                    name={appliedCoupon ? "checkmark-circle" : "pricetag"} 
                    size={22} 
                    color={appliedCoupon ? "#0F9D58" : "#7B3FF2"} 
                  />
                  <View style={styles.couponTextBox}>
                    <Text style={styles.couponTitle}>
                      {appliedCoupon ? 'Coupon Applied!' : `Extra ₹20 OFF on your first order`}
                    </Text>
                    <Text style={styles.couponCode}>
                      {appliedCoupon ? `Code: ${appliedCoupon.code} applied` : `Code: ${eligibleCoupon}`}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={[styles.applyBtn, appliedCoupon && styles.removeBtn]} 
                  onPress={() => appliedCoupon ? handleRemoveCoupon() : handleApplyCoupon(eligibleCoupon)}
                  disabled={isApplying}
                >
                  {isApplying ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={[styles.applyText, appliedCoupon && styles.removeText]}>
                      {appliedCoupon ? 'Remove' : 'Apply'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Suggestions Section */}
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
                  {suggestions.map((item) => (
                    <TouchableOpacity 
                      key={item._id} 
                      style={styles.suggestionCard}
                      onPress={() => navigation.navigate('ProductDetailPage', { product: item })}
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
                          <TouchableOpacity 
                            style={styles.addSuggestionBtn}
                            onPress={() => handleAddSuggestion(item)}
                          >
                            <Text style={styles.addSuggestionText}>ADD</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Bill Summary */}
            <View style={styles.billSummary}>
              <View style={styles.billHeader}>
                <Icon name="receipt" size={22} color="#333" />
                <Text style={styles.billTitle}>Bill Summary</Text>
              </View>
              
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item Total</Text>
                <Text style={styles.billPrice}>₹{itemTotal}</Text>
              </View>
              
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery Fee</Text>
                <Text style={styles.billFree}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</Text>
              </View>
              
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Handling Fee</Text>
                <Text style={styles.billFree}>FREE</Text>
              </View>

              {appliedCoupon && (
                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, { color: '#0F9D58', fontWeight: 'bold' }]}>Coupon Discount ({appliedCoupon.code})</Text>
                  <Text style={[styles.billPrice, { color: '#0F9D58', fontWeight: 'bold' }]}>
                    -₹{appliedCoupon.type === 'FIXED' ? appliedCoupon.value : (itemTotal * appliedCoupon.value) / 100}
                  </Text>
                </View>
              )}
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>To Pay</Text>
                <Text style={styles.totalPrice}>₹{finalTotal}</Text>
              </View>
            </View>

            <View style={styles.bottomSpacing} />
          </>
        ) : (
          <View style={styles.emptyCartContainer}>
            <View style={styles.emptyCartContent}>
              <Icon name="cart-outline" size={80} color="#ddd" />
              <Text style={styles.emptyCartText}>Your cart is empty</Text>
              <Text style={styles.emptyCartSubtext}>Add some items to get started</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Button - Pay or Browse Products */}
      {cartItems.length > 0 ? (
        <TouchableOpacity style={styles.payButton} activeOpacity={0.8} onPress={handlePayClick}>
          <Text style={styles.payButtonText}>Proceed to Checkout ₹{finalTotal}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.browseButton} activeOpacity={0.8} onPress={handleBrowseProducts}>
          <Icon name="shopping" size={20} color="#fff" />
          <Text style={styles.browseButtonText}>Browse Products</Text>
        </TouchableOpacity>
      )}

      <CustomToast 
        visible={toastVisible} 
        message="Please Login First than Checkout" 
        duration={1000} 
        type="info"
        onHide={() => setToastVisible(false)}
      />

      {/* Celebration Modal */}
      <Modal
        transparent={true}
        visible={showCelebration}
        animationType="fade"
      >
        <View style={styles.celebrationContainer}>
          <Animated.View style={[styles.celebrationBox, { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }]}>
            <Icon name="star" size={60} color="#FFD700" />
            <Text style={styles.celebrationTitle}>Woohoo!</Text>
            <Text style={styles.celebrationText}>Coupon Applied Successfully</Text>
            <Text style={styles.celebrationSubtext}>You saved extra ₹{appliedCoupon?.value}</Text>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    elevation: 2, 
  },
  backButton: {
    padding: 4,
    marginTop:20
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    
    marginTop:20
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
    flexGrow: 1,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
    paddingVertical: 60,
  },
  emptyCartContent: {
    alignItems: 'center',
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4F4DD',
    padding: 12,
  },
  savingsText: {
    fontSize: 14,
    color: '#0F9D58',
    marginRight: 4,
  },
  savedAmount: {
    fontWeight: 'bold',
  },
  noFeesBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  noFeesLeft: {
    marginRight: 16,
    justifyContent: 'center',
  },
  zeroRupee: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#7B3FF2',
  },
  noFeesRight: {
    flex: 1,
  },
  noFeesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7B3FF2',
    marginBottom: 8,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  feeText: {
    fontSize: 13,
    color: '#333',
    marginLeft: 6,
  },
  offerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  alertIcon: {
    marginRight: 6,
  },
  offerWarning: {
    fontSize: 13,
    color: '#856404',
    flex: 1,
  },
  infoBtn: {
    padding: 4,
  },
  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  couponLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  couponTextBox: {
    marginLeft: 12,
  },
  couponTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  couponCode: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  applyBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    marginBottom:20,
  },
  applyText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  viewCoupons: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  viewCouponsText: {
    fontSize: 14,
    color: '#7B3FF2',
    fontWeight: '600',
  },
  deliveryTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop:10
  },
  deliveryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
    headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  headerIcon: {
    padding: 2,
    marginTop:20
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemUnit: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FFD6E8',
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  qtyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  qtyBtnText: {
    fontSize: 18,
    color: '#FF1744',
    fontWeight: '600',
  },
  qtyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 12,
  },
  itemPriceBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  itemOriginalPrice: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  emptyCart: {
    padding: 20,
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 16,
    color: '#999',
  },
  exclusiveOffer: {
    backgroundColor: '#E3F2FD',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
  },
  exclusiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exclusiveText: {
    fontSize: 13,
    color: '#1976D2',
    fontWeight: '600',
    flex: 1,
    marginLeft: 6,
  },
  offerItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  offerImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
  },
  offerDetails: {
    flex: 1,
    marginLeft: 10,
  },
  offerItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  offerItemUnit: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: '#FF1744',
    borderRadius: 6,
    marginRight: 8,
  },
  addBtnText: {
    fontSize: 13,
    color: '#FF1744',
    fontWeight: 'bold',
  },
  offerPriceBox: {
    alignItems: 'flex-end',
  },
  offerPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  offerOriginalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  addMoreBtn: {
    backgroundColor: '#000',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  addMoreText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  billSummary: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  billHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  billTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  billLabel: {
    fontSize: 14,
    color: '#666',
  },
  billPriceBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  billStrike: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  billPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  billFree: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F9D58',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalPriceBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalStrike: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  totalPrice: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  savingsSummary: {
    backgroundColor: '#D4F4DD',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  savingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  savingsSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  savingsBadge: {
    backgroundColor: '#0F9D58',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  savingsBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  savingsIcon: {
    width: 28,
    height: 28,
    backgroundColor: '#FFF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  savingsLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  savingsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  couponCardApplied: {
    borderColor: '#0F9D58',
    borderWidth: 1,
    backgroundColor: '#F1F8F4',
    marginBottom: 16,
  },
  removeBtn: {
    borderColor: '#FF1744',
    backgroundColor: '#FFF',
  },
  removeText: {
    color: '#FF1744',
  },
  celebrationContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationBox: {
    backgroundColor: '#FFF',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 10,
    width: '80%',
  },
  celebrationTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 10,
  },
  celebrationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  celebrationSubtext: {
    fontSize: 16,
    color: '#0F9D58',
    fontWeight: 'bold',
    marginTop: 5,
  },
  suggestionsContainer: {
    marginVertical: 20,
    backgroundColor: '#fff',
    paddingTop: 8,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 0.3,
  },
  suggestionsList: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 8,
  },
  suggestionCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  suggestionImageContainer: {
    width: '100%',
    height: 110,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  suggestionImage: {
    width: '85%',
    height: '85%',
  },
  miniDiscountBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#2563eb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderBottomRightRadius: 8,
  },
  miniDiscountText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  suggestionInfo: {
    padding: 8,
  },
  suggestionName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    height: 32,
    lineHeight: 16,
  },
  suggestionQty: {
    fontSize: 11,
    color: '#666',
    marginVertical: 4,
  },
  suggestionPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  suggestionPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  suggestionMRP: {
    fontSize: 10,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  addSuggestionBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d91c5c',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: '#d91c5c',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  addSuggestionText: {
    color: '#d91c5c',
    fontSize: 12,
    fontWeight: '800',
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    marginLeft: 6,
    marginRight: 8,
  },
  distance: {
    fontSize: 12,
    color: '#FF9800',
    marginLeft: 4,
    marginRight: 6,
  },
  noBagDelivery: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  noBagText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  bottomSpacing: {
    height: 20,
  },
  payButton: {
    backgroundColor: 'rgb(42,145,52)',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: 'rgb(42,145,52)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  browseButton: {
    backgroundColor: 'rgb(42,145,52)',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: 'rgb(42,145,52)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  browseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default KeevaCartScreen;