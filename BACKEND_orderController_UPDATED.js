const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');

const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      items,
      pricing,
      payment = {},
      delivery,
      addressId,
      couponCode
    } = req.body;

    console.log('Create Order Request:', JSON.stringify(req.body, null, 2));

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

    const paymentMethod = String(payment.method || '').toLowerCase().trim();
    if (!['cod', 'online', 'razorpay'].includes(paymentMethod)) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid payment method'
      });
    }

    if (paymentMethod === 'online' || paymentMethod === 'razorpay') {
      return res.status(400).json({
        ok: false,
        message: 'Online payments must be initiated via /orders/payment/create endpoint'
      });
    }

    const total = Number(pricing.total);
    if (!Number.isFinite(total) || total <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid order total amount'
      });
    }

    const formattedItems = items.map(item => ({
      productId: item.productId || item._id,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      vendorId: item.vendorId || 'VEND_DEFAULT'
    }));

    for (let item of formattedItems) {
      if (!item.productId || !item.name || !item.price || !item.quantity) {
        return res.status(400).json({
          ok: false,
          message: 'All items must have productId, name, price, and quantity'
        });
      }
      if (item.quantity <= 0 || item.price <= 0) {
        return res.status(400).json({
          ok: false,
          message: 'Item price and quantity must be greater than 0'
        });
      }
    }

    const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const orderData = {
      orderId: orderId,
      user: user._id,
      items: formattedItems,
      pricing: {
        subtotal: Number(pricing.subtotal) || 0,
        deliveryFee: Number(pricing.deliveryFee) || 0,
        tax: Number(pricing.tax) || 0,
        couponDiscount: Number(pricing.couponDiscount) || 0,
        total: total
      },
      payment: {
        method: 'cod',
        status: 'Pending',
        transactionId: null
      },
      delivery: {
        type: delivery?.type || 'standard',
        expectedDate: delivery?.expectedDate || new Date().toISOString().split('T')[0],
        status: 'Pending'
      },
      address: {
        addressId: addressId || null,
        ...(user.addresses?.find(addr => addr._id.toString() === addressId) || {})
      },
      couponCode: couponCode || null,
      status: 'Pending',
      statusHistory: [{
        status: 'Pending',
        updatedBy: {
          user: user._id,
          role: user.role || 'customer'
        },
        updatedAt: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const order = new Order(orderData);
    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('orders:new', {
        orderId: order.orderId,
        userId: user._id.toString(),
        status: order.status,
        total: order.pricing.total
      });
    }

    const responsePayload = order.toObject();
    delete responsePayload.__v;

    console.log('Order Created Successfully:', order.orderId);

    return res.status(201).json({
      ok: true,
      message: 'Order created successfully',
      order: responsePayload
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
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'User not found'
      });
    }

    const filter = user.role === 'admin' ? {} : { user: user._id };
    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({
      ok: true,
      orders: orders.map(order => order.toObject())
    });

  } catch (error) {
    console.error('Get Orders Error:', error);
    return res.status(400).json({
      ok: false,
      message: error.message
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;

    const order = await Order.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(orderId) ? orderId : null },
        { orderId: orderId }
      ]
    }).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: 'Order not found'
      });
    }

    const user = await User.findById(userId);
    if (order.user._id.toString() !== userId && user.role !== 'admin') {
      return res.status(403).json({
        ok: false,
        message: 'You are not authorized to view this order'
      });
    }

    return res.json({
      ok: true,
      order: order.toObject()
    });

  } catch (error) {
    console.error('Get Order By ID Error:', error);
    return res.status(400).json({
      ok: false,
      message: error.message
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        ok: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const user = await User.findById(userId);
    if (!user || !['admin', 'partner'].includes(user.role)) {
      return res.status(403).json({
        ok: false,
        message: 'Only admins and partners can update order status'
      });
    }

    const order = await Order.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(orderId) ? orderId : null },
        { orderId: orderId }
      ]
    });

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    order.statusHistory.push({
      status: status,
      updatedBy: {
        user: user._id,
        role: user.role
      },
      updatedAt: new Date()
    });
    order.updatedAt = new Date();

    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('orders:status', {
        orderId: order.orderId,
        status: order.status,
        updatedAt: order.updatedAt
      });
    }

    return res.json({
      ok: true,
      message: 'Order status updated successfully',
      order: order.toObject()
    });

  } catch (error) {
    console.error('Update Order Status Error:', error);
    return res.status(400).json({
      ok: false,
      message: error.message
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(orderId) ? orderId : null },
        { orderId: orderId }
      ]
    });

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: 'Order not found'
      });
    }

    if (order.user.toString() !== userId) {
      return res.status(403).json({
        ok: false,
        message: 'You are not authorized to cancel this order'
      });
    }

    if (['Shipped', 'Delivered', 'Cancelled'].includes(order.status)) {
      return res.status(400).json({
        ok: false,
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    order.status = 'Cancelled';
    order.cancellationReason = reason || null;
    order.statusHistory.push({
      status: 'Cancelled',
      updatedBy: {
        user: userId,
        role: 'customer'
      },
      updatedAt: new Date()
    });
    order.updatedAt = new Date();

    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('orders:cancelled', {
        orderId: order.orderId,
        reason: reason || 'User requested cancellation'
      });
    }

    return res.json({
      ok: true,
      message: 'Order cancelled successfully',
      order: order.toObject()
    });

  } catch (error) {
    console.error('Cancel Order Error:', error);
    return res.status(400).json({
      ok: false,
      message: error.message
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};
