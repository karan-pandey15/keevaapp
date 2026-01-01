
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import CustomToast from '../helperComponent/CustomToast';

const { width } = Dimensions.get('window');
const API_URL = 'https://api.keeva.in';

const YourOrders = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const socketRef = useRef(null);

  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;
    try {
      setCancelling(true);
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/orders/${selectedOrderId}/status`, {
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
        setOrders((prev) =>
          prev.map((order) =>
            (order._id === selectedOrderId || order.orderId === selectedOrderId) ? { ...order, status: 'Cancelled' } : order
          )
        );
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

  const fetchOrders = async (socketId = null) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const url = socketId
        ? `${API_URL}/orders?socketId=${socketId}`
        : `${API_URL}/orders`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (res.ok && data.ok && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.log('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initSocket = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const socket = io(API_URL, {
        transports: ['websocket'],
        auth: { token },
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        setSocketConnected(true);
        fetchOrders(socket.id);
      });

      socket.on('disconnect', () => {
        setSocketConnected(false);
      });

      socket.on('orders:new', (newOrder) => {
        setOrders((prev) => {
          const exists = prev.some(o => o.orderId === newOrder.orderId);
          return exists ? prev : [newOrder, ...prev];
        });
      });

      socket.on('orders:status', (update) => {
        setOrders((prev) =>
          prev.map((order) =>
            order.orderId === update.orderId
              ? {
                  ...order,
                  status: update.status,
                  payment: {
                    ...order.payment,
                    status: update.paymentStatus,
                  },
                }
              : order
          )
        );
      });
    };

    initSocket();
    return () => socketRef.current?.disconnect();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).replace(',', '');
  };

  const getStatusIcon = (status) => {
    if (status?.toLowerCase() === 'delivered') {
      return <Icon name="checkmark-circle" size={18} color="#00A86B" />;
    }
    if (status?.toLowerCase() === 'cancelled') {
      return <Icon name="close-circle" size={18} color="#666" />;
    }
    return <Icon name="time" size={18} color="#FFB300" />;
  };

  const renderOrderCard = (order) => {
    const isCancelled = order.status?.toLowerCase() === 'cancelled';
    const isPending = order.status?.toLowerCase() === 'pending';
    
    return (
      <TouchableOpacity 
        key={order._id || order.orderId} 
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetails', { order })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.statusRow}>
            <Text style={styles.orderStatusText}>
              Order {order.status?.toLowerCase() || 'pending'}
            </Text>
            <View style={styles.statusIcon}>
              {getStatusIcon(order.status)}
            </View>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.grandTotal}>₹{order.pricing?.grandTotal}</Text>
            <Icon name="chevron-forward" size={18} color="#666" />
          </View>
        </View>

        <Text style={styles.orderDate}>
          Placed at {formatDate(order.createdAt)}
        </Text>

        <View style={styles.itemsImagesRow}>
          {order.items?.slice(0, 4).map((item, idx) => (
            <View key={idx} style={styles.itemImageContainer}>
              <Image source={{ uri: item.image }} style={styles.itemThumbnail} />
              {item.quantity > 1 && (
                <View style={styles.quantityBadge}>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                </View>
              )}
            </View>
          ))}
          {order.items?.length > 4 && (
            <View style={styles.moreItemsBadge}>
              <Text style={styles.moreItemsText}>+{order.items.length - 4}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          {isPending ? (
            <TouchableOpacity 
              style={styles.cancelOrderBtn}
              onPress={() => {
                setSelectedOrderId(order._id);
                setCancelModalVisible(true);
              }}
            >
              <Text style={styles.cancelOrderBtnText}>Cancel Order</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.orderAgainBtn}
              onPress={() => {
                if (order.items?.[0]?.productId) {
                  navigation.navigate('ProductDetailPage', { product: { _id: order.items[0].productId } });
                }
              }}
            >
              <Text style={styles.orderAgainBtnText}>Order Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
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
                style={styles.cancelBtn} 
                onPress={() => setCancelModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Go Back</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmBtn} 
                onPress={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmBtnText}>Yes, Cancel</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Orders</Text>
        <View style={[styles.socketIndicator, { backgroundColor: socketConnected ? '#00A86B' : '#FF4D4D' }]} />
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#ff3162" />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centerContent}>
          <Icon name="cart-outline" size={80} color="#ddd" />
          <Text style={styles.emptyText}>No orders found</Text>
          <TouchableOpacity 
            style={styles.browseBtn}
            onPress={() => navigation.navigate('HomePage')}
          >
            <Text style={styles.browseBtnText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {orders.map(renderOrderCard)}
        </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',  
    marginTop:20
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginLeft: 12,
    flex: 1,
  },
  socketIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  browseBtn: {
    marginTop: 20,
    backgroundColor: '#ff3162',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 12,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderStatusText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    textTransform: 'capitalize',
  },
  statusIcon: {
    marginLeft: 6,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grandTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginRight: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  itemsImagesRow: {
    flexDirection: 'row',
    marginTop: 16,
    alignItems: 'center',
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginRight: 10,
    padding: 4,
    position: 'relative',
  },
  itemThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  quantityBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#6A1B9A',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  moreItemsBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreItemsText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 16,
    paddingTop: 12,
    alignItems: 'center',
  },
  orderAgainBtn: {
    width: '100%',
    paddingVertical: 8,
    alignItems: 'center',
  },
  orderAgainBtnText: {
    color: '#ff3162',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelOrderBtn: {
    width: '100%',
    paddingVertical: 8,
    alignItems: 'center', 
    borderRadius: 8,
  },
  cancelOrderBtnText: {
    color: '#FF4D4D',
    fontSize: 14,
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
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
  confirmBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FF4D4D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});

export default YourOrders;
