import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { clearCart } from '../redux/cartSlice';
import { createPayment, verifyPayment, getProfile, getAddresses } from '../api';
import { initiateRazorpayPayment } from '../services/razorpayService';
import CustomToast from '../helperComponent/CustomToast';

const CheckoutScreen = ({ navigation }) => {
  const route = useRoute();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const { itemTotal, finalTotal, discount, deliveryFee } = route.params || {
    itemTotal: 0,
    finalTotal: 0,
    discount: 0,
    deliveryFee: 0,
  };

  useEffect(() => {
    const initData = async () => {
      try {
        setInitializing(true);
        await Promise.all([
          fetchProfile(),
          fetchAddresses(),
        ]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        Alert.alert('Error', 'Failed to load user data. Please try again.');
      } finally {
        setInitializing(false);
      }
    };

    // Initial load
    initData();

    // Refresh data when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      initData();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      if (data.ok && data.user) {
        setProfile(data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const data = await getAddresses();
      const addressList = data.addresses || [];
      setAddresses(addressList);
      
      if (addressList.length === 0) {
        setToastMessage('Please Fill Address to Checkout');
        setToastType('info');
        setShowToast(true);
        setTimeout(() => {
          navigation.navigate('AddressPage');
        }, 1000);
        return;
      }

      const defaultAddress = addressList.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
      } else if (addressList.length > 0) {
        setSelectedAddressId(addressList[0]._id);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const computeExpectedTime = () => {
    const base = new Date();
    const expectedTime = new Date(base.getTime() + 24 * 60 * 60 * 1000);
    return expectedTime.toISOString();
  };

  const getSelectedAddress = () => {
    if (!selectedAddressId) return null;
    return addresses.find((addr) => addr._id === selectedAddressId);
  };

  const buildOrderPayload = (paymentMethod) => {
    const selectedAddress = getSelectedAddress();

    const sanitizedItems = cartItems.map((item) => ({
      productId: item.id || item._id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      discount: Math.max(0, (item.originalPrice || item.price) - item.price),
      finalPrice: item.price,
      image: item.image?.uri || "",
    }));

    const addressPayload = selectedAddress ? {
      ...selectedAddress,
      contactName: profile?.name || selectedAddress?.label || '',
      contactPhone: profile?.phone || '',
    } : null;

    const pricingPayload = {
      subtotal: itemTotal,
      deliveryFee: deliveryFee,
      couponDiscount: discount,
      tax: 0,
      grandTotal: finalTotal,
    };

    const deliveryPayload = {
      type: 'Standard',
      expectedTime: computeExpectedTime(),
      instructions: '',
    };

    return {
      items: sanitizedItems,
      pricing: pricingPayload,
      delivery: deliveryPayload,
      address: addressPayload,
      addressId: selectedAddressId,
      couponCode: null,
      payment: {
        method: paymentMethod,
      },
    };
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    if (selectedPayment === 'cod') {
      await handleCODOrder();
    } else {
      await handleOnlinePayment();
    }
  };

  const handleCODOrder = async () => {
    setLoading(true);
    try {
      const payload = buildOrderPayload('cod');
      const response = await createPayment(payload);

      if (response.ok) {
        dispatch(clearCart());
        setToastMessage('Order successfully placed!');
        setShowToast(true);
        
        setTimeout(() => {
          navigation.replace('YourOrders');
        }, 500);
      } else {
        Alert.alert('Error', response.message || 'Failed to place order');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong');
      console.error('COD Order Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePayment = async () => {
    setLoading(true);
    try {
      const payload = buildOrderPayload('online');
      const response = await createPayment(payload);

      if (!response.ok) {
        throw new Error(response.message || 'Failed to create payment order');
      }

      const createdOrder = response.order;
      if (!createdOrder) {
        throw new Error('No order created');
      }

      const { razorpayOrder, razorpayKeyId } = createdOrder;

      if (!razorpayOrder || !razorpayKeyId) {
        throw new Error('Razorpay order details not available');
      }

      const paymentResult = await initiateRazorpayPayment({
        ...razorpayOrder,
        key: razorpayKeyId,
      });

      if (paymentResult.success) {
        const verifyResponse = await verifyPayment({
          razorpay_order_id: paymentResult.razorpay_order_id,
          razorpay_payment_id: paymentResult.razorpay_payment_id,
          razorpay_signature: paymentResult.razorpay_signature,
        });

        if (verifyResponse.ok) {
          dispatch(clearCart());
          setToastMessage('Payment verified successfully!');
          setShowToast(true);
          
          setTimeout(() => {
            navigation.replace('YourOrders');
          }, 500);
        } else {
          Alert.alert('Error', verifyResponse.message || 'Payment verification failed');
        }
      } else {
        throw paymentResult;
      }
    } catch (error) {
      if (error.success === false) {
        Alert.alert('Payment Cancelled', error.error || 'Payment was cancelled');
      } else {
        Alert.alert('Error', error.message || 'Payment failed');
        console.error('Online Payment Error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="rgb(42,145,52)" />
          <Text style={{ marginTop: 10, color: '#666' }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedAddress = getSelectedAddress();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      <CustomToast 
        visible={showToast} 
        message={toastMessage}
        duration={1000}
        onHide={() => setShowToast(false)}
        type={toastType}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Delivery Address Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Delivery Address</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AddressPage')}>
                <Text style={styles.addNewText}>+ Add New</Text>
              </TouchableOpacity>
            </View>
            
            {addresses.map((address) => (
              <TouchableOpacity
                key={address._id}
                style={[
                  styles.addressCard,
                  selectedAddressId === address._id && styles.addressCardActive,
                ]}
                onPress={() => setSelectedAddressId(address._id)}
              >
                <View style={styles.addressCardContent}>
                  <View
                    style={[
                      styles.radioButton,
                      selectedAddressId === address._id && styles.radioButtonActive,
                    ]}
                  >
                    {selectedAddressId === address._id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <View style={styles.addressInfo}>
                    <View style={styles.addressLabelRow}>
                      <Text style={styles.addressLabel}>{address.label || 'Home'}</Text>
                      {address.isDefault && <Text style={styles.defaultBadge}>Default</Text>}
                    </View>
                    <Text style={styles.addressText} numberOfLines={2}>
                      {`${address.houseNo}, ${address.street}, ${address.landmark ? address.landmark + ', ' : ''}${address.city}, ${address.state} - ${address.pincode}`}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Payment Method Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Payment Method</Text>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPayment === 'cod' && styles.paymentOptionActive,
              ]}
              onPress={() => setSelectedPayment('cod')}
            >
              <View style={styles.optionLeft}>
                <Icon name="cash-outline" size={24} color="rgb(42,145,52)" />
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Cash on Delivery</Text>
                  <Text style={styles.optionSubtitle}>Pay when you receive the order</Text>
                </View>
              </View>
              <View
                style={[
                  styles.radioButton,
                  selectedPayment === 'cod' && styles.radioButtonActive,
                ]}
              >
                {selectedPayment === 'cod' && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPayment === 'online' && styles.paymentOptionActive,
              ]}
              onPress={() => setSelectedPayment('online')}
            >
              <View style={styles.optionLeft}>
                <Icon name="card-outline" size={24} color="rgb(42,145,52)" />
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Pay Online</Text>
                  <Text style={styles.optionSubtitle}>Secure payment via Razorpay</Text>
                </View>
              </View>
              <View
                style={[
                  styles.radioButton,
                  selectedPayment === 'online' && styles.radioButtonActive,
                ]}
              >
                {selectedPayment === 'online' && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>
          </View>

          {/* Order Summary */}
          <View style={styles.billSummary}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Item Total</Text>
              <Text style={styles.summaryValue}>₹{itemTotal}</Text>
            </View>
            {discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={[styles.summaryValue, { color: '#0F9D58' }]}>-₹{discount}</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{finalTotal}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.checkoutButton, (loading || !selectedAddressId) && styles.checkoutButtonDisabled]}
        onPress={handleCheckout}
        disabled={loading || !selectedAddressId}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.checkoutButtonText}>
            Proceed to Pay ₹{finalTotal}
          </Text>
        )}
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginTop :20
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  scrollContent: {
    padding: 0,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom:10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addNewText: {
    fontSize: 14,
    color: 'rgb(42,145,52)',
    fontWeight: '600',
  },
  addressCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addressCardActive: {
    borderColor: 'rgb(42,145,52)',
    backgroundColor: '#F9FFF9',
    elevation: 3,
  },
  addressCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  defaultBadge: {
    fontSize: 10,
    color: 'rgb(42,145,52)',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
    fontWeight: '600',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgb(42,145,52)',
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  addressInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#EEE',
    borderStyle: 'dashed',
  },
  addAddressText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgb(42,145,52)',
    marginLeft: 8,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#EEE',
  },
  paymentOptionActive: {
    borderColor:  'rgb(42,145,52)',
    backgroundColor: "#fff"
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    marginLeft: 16,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor:'rgb(42,145,52)',
    backgroundColor: '#fff',
  },
  billSummary: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    marginBottom: 100,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTopY: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgb(42,145,52)',
  },
  checkoutButton: {
    backgroundColor: 'rgb(42,145,52)',
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  checkoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CheckoutScreen;
