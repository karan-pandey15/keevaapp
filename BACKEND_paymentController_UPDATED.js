const Order = require('../models/Order');
const User = require('../models/User');
const crypto = require('crypto');

const createPaymentOrder = async (req, res) => {
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

    console.log('Create Payment Order Request:', JSON.stringify(req.body, null, 2));

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
    const amountInPaise = Math.round(total * 100);

    if (amountInPaise <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid amount for payment'
      });
    }

    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderId,
      notes: {
        userId: user._id.toString(),
        userEmail: user.email,
        userPhone: user.phone
      }
    });

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
        method: 'online',
        status: 'Pending',
        razorpayOrderId: razorpayOrder.id,
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

    console.log('Payment Order Created:', {
      orderId: order.orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: total
    });

    return res.status(201).json({
      ok: true,
      message: 'Payment order created successfully',
      order: responsePayload,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt
      },
      razorpayKeyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Create Payment Order Error:', error);
    return res.status(400).json({
      ok: false,
      message: error.message || 'Error creating payment order'
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature
    } = req.body;

    console.log('Verify Payment Request:', {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: razorpaySignature?.substring(0, 20) + '...'
    });

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        ok: false,
        message: 'Payment verification data is incomplete'
      });
    }

    const signatureBody = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(signatureBody)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      console.error('Signature Mismatch:', {
        expected: expectedSignature,
        received: razorpaySignature
      });
      return res.status(400).json({
        ok: false,
        message: 'Invalid payment signature - verification failed'
      });
    }

    const order = await Order.findOne({
      'payment.razorpayOrderId': razorpayOrderId
    }).populate('user', '_id email phone');

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: 'Order not found for this payment'
      });
    }

    if (order.user._id.toString() !== userId) {
      return res.status(403).json({
        ok: false,
        message: 'You are not authorized to verify this payment'
      });
    }

    if (order.payment.status === 'Done') {
      console.log('Payment already verified:', order.orderId);
      const io = req.app.get('io');
      if (io) {
        io.emit('orders:status', {
          orderId: order.orderId,
          status: order.status,
          paymentStatus: order.payment.status
        });
      }
      return res.json({
        ok: true,
        message: 'Payment already verified',
        order: order.toObject()
      });
    }

    order.payment.status = 'Done';
    order.payment.transactionId = razorpayPaymentId;
    order.updatedAt = new Date();

    await order.save();

    console.log('Payment Verified Successfully:', {
      orderId: order.orderId,
      transactionId: razorpayPaymentId
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('orders:status', {
        orderId: order.orderId,
        status: order.status,
        paymentStatus: order.payment.status
      });
    }

    return res.json({
      ok: true,
      message: 'Payment verified successfully',
      order: order.toObject()
    });

  } catch (error) {
    console.error('Verify Payment Error:', error);
    return res.status(400).json({
      ok: false,
      message: error.message || 'Error verifying payment'
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment
};
