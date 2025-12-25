  
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import io from 'socket.io-client';

const { width } = Dimensions.get('window');

const API_URL = 'https://api.keeva.in';

const YourOrders = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);

  /* ---------------- FETCH ORDERS ---------------- */
  const fetchOrders = async (socketId = null) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

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
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.log('Fetch orders error:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SOCKET ---------------- */
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

  /* ---------------- ORDER CARD ---------------- */
  const renderOrderCard = (order) => (
    <View key={order._id || order.orderId} style={styles.orderCard}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <Text style={{ fontSize: 26 }}>🛒</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.orderId}>Order #{order.orderId}</Text>
          <Text style={styles.location}>
            {order.address?.city || '—'}, {order.address?.state || ''}
          </Text>
        </View>

        <Icon name="more-vert" size={22} />
      </View>

      {/* Items */}
      <View style={styles.itemsBox}>
        {(order.items || []).map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <View style={styles.dot} />
            <Text style={styles.itemText}>
              {item.quantity} × {item.name}
            </Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.date}>
            {new Date(order.createdAt).toLocaleString()}
          </Text>
          <Text style={styles.status}>{order.status}</Text>
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.amount}>₹{order.pricing?.grandTotal ?? 0}</Text>
          <Icon name="chevron-right" size={22} color="#666" />
        </View>
      </View>

      {/* Status Button */}
      <View style={styles.statusBtn}>
        <Text style={styles.statusBtnText}>
          {order.status === 'Delivered'
            ? 'Delivered'
            : 'Currently not delivering'}
        </Text>
      </View>
    </View>
  );

  /* ---------------- UI ---------------- */
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} />
        </TouchableOpacity>

        <Text style={styles.title}>Your Orders</Text>

        <View
          style={[
            styles.liveDot,
            { backgroundColor: socketConnected ? 'green' : 'red' },
          ]}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      ) : orders.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 50 }}>
          No orders found
        </Text>
      ) : (
        <ScrollView>{orders.map(renderOrderCard)}</ScrollView>
      )}
    </View>
  );
};

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: Platform.OS === 'ios' ? 40 : 20,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: '600',
    marginLeft: 16,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  orderCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  orderId: { fontSize: 16, fontWeight: '600' },
  location: { fontSize: 13, color: '#666' },
  itemsBox: {
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#00A86B',
    marginRight: 10,
  },
  itemText: { fontSize: 14 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#eee',
    marginTop: 10,
    paddingTop: 10,
  },
  date: { fontSize: 12, color: '#666' },
  status: { fontSize: 12, color: '#666' },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  amount: { fontSize: 16, fontWeight: '600', marginRight: 5 },
  statusBtn: {
    backgroundColor: '#ddd',
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusBtnText: { color: '#666', fontWeight: '500' },
});

export default YourOrders;
