const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const {
  sanitizeItems,
  computePricing,
  selectUserAddress,
  buildOrderAddress,
  buildPayment,
  buildDelivery,
  generateOrderId,
  emitOrderEvent,
  joinOrderRooms
} = require('../services/orderHelper');
const {
  STATUS_VALUES,
  canRoleSetStatus,
  applyStatusChange,
  serializeOrder
} = require('../services/orderStatus');

const normalizePaymentMethod = (value = 'cod') => {
  const normalized = String(value || '').toLowerCase().trim();
  if (['online', 'razorpay', 'prepaid', 'card'].includes(normalized)) return 'online';
  if (['cod', 'cash', 'cash_on_delivery'].includes(normalized)) return 'cod';
  return 'cod';
};

const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      items,
      pricing,
      payment = {},
      delivery,
      addressId,
      address,
      couponCode
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'Order items are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'User not found'
      });
    }

    const paymentMethod = normalizePaymentMethod(payment.method);

    const sanitizedItems = sanitizeItems(items);
    if (sanitizedItems.length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'No valid items in order'
      });
    }

    const pricingPayload = computePricing(sanitizedItems, pricing);
    const amountPayable = Number(pricingPayload.grandTotal);

    if (!Number.isFinite(amountPayable) || amountPayable <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid payable amount'
      });
    }

    const selectedAddress = selectUserAddress(user, addressId);
    const addressPayload = buildOrderAddress(
      user,
      selectedAddress,
      address || {}
    );

    const deliveryPayload = buildDelivery(delivery);

    const internalOrderId = generateOrderId();
    const baseOrderData = {
      orderId: internalOrderId,
      user: user._id,
      items: sanitizedItems,
      pricing: pricingPayload,
      address: addressPayload,
      delivery: deliveryPayload,
      couponCode: couponCode || null,
      status: 'Pending',
      statusHistory: [{
        status: 'Pending',
        updatedBy: { user: user._id, role: user.role },
        updatedAt: new Date()
      }]
    };

    if (paymentMethod === 'online') {
      return res.status(400).json({
        ok: false,
        message: 'Online payments must be initiated via /orders/payment/create endpoint'
      });
    }

    const paymentPayload = buildPayment({
      method: 'cod',
      status: 'Pending'
    });

    const order = await Order.create({
      ...baseOrderData,
      payment: paymentPayload
    });

    const io = req.app.get('io');
    const payload = order.toObject();
    delete payload.__v;
    emitOrderEvent(io, 'orders:new', payload, userId);

    return res.status(201).json({
      ok: true,
      order: payload,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Create Order Error:', error);
    return res.status(400).json({
      ok: false,
      message: error.message || 'Error creating order'
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('role');
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'User not found'
      });
    }

    const filter = user.role === 'customer' ? { user: user._id } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    const payload = orders.map((order) => serializeOrder(order));

    const io = req.app.get('io');
    const socketId = req.query.socketId || req.headers['x-socket-id'];
    if (io && socketId) {
      const socket = joinOrderRooms(io, socketId, user);
      if (socket) {
        socket.emit('orders:init', payload);
      }
    }

    return res.json({ ok: true, orders: payload });
  } catch (error) {
    console.error('Get Orders Error:', error);
    return res.status(400).json({
      ok: false,
      message: error.message
    });
  }
};

const resolveOrderByParam = async (orderIdOrDbId) => {
  if (!orderIdOrDbId) return null;
  if (mongoose.Types.ObjectId.isValid(orderIdOrDbId)) {
    const order = await Order.findById(orderIdOrDbId);
    if (order) return order;
  }
  return Order.findOne({ orderId: orderIdOrDbId });
};

const updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status || !STATUS_VALUES.includes(status)) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid status'
      });
    }

    const actor = await User.findById(userId).select('role');
    if (!actor) {
      return res.status(404).json({
        ok: false,
        message: 'User not found'
      });
    }

    if (!canRoleSetStatus(actor.role, status)) {
      return res.status(403).json({
        ok: false,
        message: 'Not allowed to set this status'
      });
    }

    const order = await resolveOrderByParam(orderId);
    if (!order) {
      return res.status(404).json({
        ok: false,
        message: 'Order not found'
      });
    }

    await applyStatusChange({
      order,
      status,
      actor: {
        type: 'user',
        id: actor._id,
        role: actor.role
      }
    });

    const io = req.app.get('io');
    const broadcastPayload = {
      orderId: order.orderId,
      status: order.status
    };
    emitOrderEvent(io, 'orders:status', broadcastPayload, order.user);

    return res.json({
      ok: true,
      order: serializeOrder(order)
    });
  } catch (error) {
    console.error('Update Order Status Error:', error);
    return res.status(400).json({
      ok: false,
      message: error.message
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus
};
