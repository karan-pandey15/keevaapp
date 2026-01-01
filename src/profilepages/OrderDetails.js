
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomToast from '../helperComponent/CustomToast';

const OrderDetails = ({ route, navigation }) => {
  const { order: initialOrder } = route.params;
  const [order, setOrder] = useState(initialOrder);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  if (!order) return null;

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`https://api.keeva.in/orders/${order._id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Cancelled' }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Invalid server response');
      }

      if (response.ok && data.ok) {
        setOrder(data.order);
        setCancelModalVisible(false);
        setToast({
          visible: true,
          message: 'Order Cancelled SuccessFully',
          type: 'cancelled'
        });
      } else {
        setCancelModalVisible(false);
        setToast({
          visible: true,
          message: data.message || 'Failed to cancel order',
          type: 'info'
        });
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      setCancelModalVisible(false);
      setToast({
        visible: true,
        message: error.message || 'Something went wrong while cancelling the order',
        type: 'info'
      });
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return '#00A86B';
      case 'cancelled':
        return '#FF4D4D';
      case 'pending':
        return '#FFB300';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'checkmark-circle';
      case 'cancelled':
        return 'close-circle';
      case 'pending':
        return 'time';
      default:
        return 'information-circle';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <CustomToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Order #{order.orderId}</Text>
          <Text style={styles.headerSubtitle}>{order.items?.length} items</Text>
        </View>
        <TouchableOpacity 
          style={styles.helpButton}
          onPress={() => navigation.navigate('HelpSupport')}
        >
          <Icon name="chatbubble-ellipses-outline" size={20} color="#d91c5c" />
          <Text style={styles.helpText}>Get Help</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Status Section */}
        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '15' }]}>
            <Icon name={getStatusIcon(order.status)} size={24} color={getStatusColor(order.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
          </View>
          {order.status === 'Delivered' && (
            <View style={styles.arrivalBadge}>
              <Icon name="flash" size={14} color="#6A1B9A" />
              <Text style={styles.arrivalText}>Arrived in 15 MINS</Text>
            </View>
          )}
        </View>

        {/* Items Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{order.items?.length} items in order</Text>
          {order.items?.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.itemRow}
              onPress={() => navigation.navigate('ProductDetailPage', { product: { _id: item.productId } })}
            >
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemQty}>1 unit</Text>
              </View>
              <View style={styles.itemPriceContainer}>
                <Text style={styles.itemPrice}>₹{item.finalPrice}</Text>
                {item.discount > 0 && (
                  <Text style={styles.itemOldPrice}>₹{item.unitPrice}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bill Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcon name="receipt" size={20} color="#000" />
            <Text style={styles.sectionTitleText}>Bill Summary</Text>
          </View>
          
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total & GST</Text>
            <View style={styles.billValueRow}>
              {order.pricing?.couponDiscount > 0 && (
                 <Text style={styles.billOldValue}>₹{(order.pricing?.subtotal + order.pricing?.couponDiscount).toFixed(2)}</Text>
              )}
              <Text style={styles.billValue}>₹{order.pricing?.subtotal}</Text>
            </View>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <View style={styles.billValueRow}>
              {order.pricing?.deliveryFee > 0 ? (
                <Text style={styles.billValue}>₹{order.pricing?.deliveryFee}</Text>
              ) : (
                <>
                  <Text style={styles.billOldValue}>₹49</Text>
                  <Text style={[styles.billValue, { color: '#00A86B' }]}>Free</Text>
                </>
              )}
            </View>
          </View>

          {order.pricing?.couponDiscount > 0 && (
            <Text style={styles.promoText}>Promo Voucher Applied (incl. free delivery)</Text>
          )}

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Total Bill</Text>
              <Text style={styles.totalSubtext}>Incl. all taxes and charges</Text>
            </View>
            <View style={styles.totalValueContainer}>
              <Text style={styles.totalValue}>₹{order.pricing?.grandTotal}</Text>
              <View style={styles.savedBadge}>
                <Text style={styles.savedText}>SAVED ₹{order.pricing?.couponDiscount || 0}</Text>
              </View>
            </View>
          </View>

        
        </View>

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.orderSectionTitle}>Order Details</Text>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Order ID</Text>
            <View style={styles.detailValueRow}>
              <Text style={styles.detailValue}>#{order.orderId}</Text>
              <Icon name="copy-outline" size={16} color="#999" style={{ marginLeft: 6 }} />
            </View>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Receiver Details</Text>
            <Text style={styles.detailValue}>{order.address?.contactName}, +91 {order.address?.contactPhone}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Delivery Address</Text>
            <Text style={styles.detailValue}>{order.address?.houseNo}, {order.address?.street}, {order.address?.city}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Order Placed at</Text>
            <Text style={styles.detailValue}>{formatDate(order.createdAt)}</Text>
          </View>

         
        </View>

        {/* Support Section */}
        <TouchableOpacity 
          style={styles.supportCard}
          onPress={() => navigation.navigate('HelpSupport')}
        >
          <View style={styles.supportIconBg}>
            <Icon name="chatbubble-ellipses" size={24} color="#d91c5c" />
          </View>
          <View style={styles.supportTextContainer}>
            <Text style={styles.supportTitle}>Need help with this order?</Text>
            <Text style={styles.supportSubtitle}>Find your issue or reach out via chat</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#000" />
        </TouchableOpacity>

      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={cancelModalVisible}
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconBg}>
              <Icon name="alert-circle" size={40} color="#FF4D4D" />
            </View>
            <Text style={styles.modalTitle}>Cancel Order?</Text>
            <Text style={styles.modalSubtitle}>Are you sure you want to cancel this order? This action cannot be undone.</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={() => setCancelModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Go Back</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalConfirmButton} 
                onPress={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmButtonText}>Yes, Cancel</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Footer Button */}
      <View style={styles.footer}>
        {order.status?.toLowerCase() === 'pending' ? (
          <TouchableOpacity 
            style={[styles.orderAgainButton, { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#FF4D4D' }]}
            onPress={() => setCancelModalVisible(true)}
          >
            <Text style={[styles.orderAgainText, { color: '#FF4D4D' }]}>Cancel Order</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.orderAgainButton}
            onPress={() => {
              if (order.items?.[0]?.productId) {
                navigation.navigate('ProductDetailPage', { product: { _id: order.items[0].productId } });
              }
            }}
          >
            <Text style={styles.orderAgainText}>Order Again</Text>
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
  header: {
    flexDirection: 'row',
    marginTop:24,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      }, 
    }),
  },
  backButton: {
    padding: 4, 
    borderRadius: 20,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 20,
  },
  helpText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#d91c5c',
    marginLeft: 4,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  statusSection: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 8,
    textTransform: 'capitalize'
  },
  arrivalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  arrivalText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6A1B9A',
    marginLeft: 4,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    marginLeft: 8,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 8,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    lineHeight: 18,
  },
  itemQty: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  itemPriceContainer: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  itemOldPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  billLabel: {
    fontSize: 14,
    color: '#444',
  },
  billValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  billValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  billOldValue: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  promoText: {
    fontSize: 12,
    color: '#00A86B',
    fontWeight: '600',
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  },
  totalSubtext: {
    fontSize: 11,
    color: '#999',
  },
  totalValueContainer: {
    alignItems: 'flex-end',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
  },
  savedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  savedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00A86B',
  },
  orderSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    marginBottom: 16,
  },
  detailItem: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  supportIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  supportSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  orderAgainButton: {
    backgroundColor: '#d91c5c',
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderAgainText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  modalIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
  modalConfirmButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FF4D4D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});

export default OrderDetails;
