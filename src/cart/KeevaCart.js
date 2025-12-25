import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  SafeAreaView,
  StatusBar
} from 'react-native';
import IconS from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { incrementQuantity, decrementQuantity } from '../redux/cartSlice';

const KeevaCartScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

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

    const discount = Math.max(0, originalTotal - itemTotal);
    const deliveryFee = itemTotal >= 159 ? 0 : 30;
    const handlingFee = 0;
    const finalTotal = itemTotal + deliveryFee + handlingFee;

    return {
      itemTotal: Math.round(itemTotal),
      discount: Math.round(discount),
      deliveryFee,
      handlingFee,
      finalTotal: Math.round(finalTotal),
      totalSavings: Math.round(discount + deliveryFee + handlingFee),
    };
  }, [cartItems]);

  const handlePayClick = () => {
    if (cartItems.length === 0) {
      return;
    }

    navigation.navigate('CheckoutScreen', {
      itemTotal: calculateTotals.itemTotal,
      discount: calculateTotals.discount,
      deliveryFee: calculateTotals.deliveryFee,
      finalTotal: calculateTotals.finalTotal,
    });
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
     
       
 
        {/* Coupon Section
        <View style={styles.couponCard}>
          <View style={styles.couponLeft}>
            <Icon name="percent" size={22} color="#0F9D58" />
            <View style={styles.couponTextBox}>
              <Text style={styles.couponTitle}>Get extra ₹30 OFF</Text>
              <Text style={styles.couponCode}>Code: SAVE30NOW</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.applyBtn}>
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        </View> */}

        {/* <TouchableOpacity style={styles.viewCoupons}>
          <Text style={styles.viewCouponsText}>View all coupons ›</Text>
        </TouchableOpacity> */}

        {/* Delivery Time */}
        {cartItems.length > 0 && (
          <View style={styles.deliveryTime}>
            <Icon name="flash" size={20} color="#FFA000" />
            <Text style={styles.deliveryText}>Delivery in 30 mins</Text>
          </View>
        )}

        {/* Cart Items */}
        {Array.isArray(cartItems) && cartItems.length > 0 ? (
          <>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Image 
                  source={item.image} 
                  style={styles.itemImage}
                  resizeMode="contain"
                />
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
    marginVertical: 12,
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
    marginVertical: 12,
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