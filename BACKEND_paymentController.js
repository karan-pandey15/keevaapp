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
  emitOrderEvent
} = require('../services/orderHelper');
const { createRazorpayOrder, verifyPaymentSignature } = require('../services/razorpayService');

const createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      items,
      pricing,
      delivery,
      addressId,
      address,
      payment = {},
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
    const amountInPaise = Math.round(amountPayable * 100);

    if (amountInPaise <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid payable amount for online payment'
      });
    }

    const razorpayOrder = await createRazorpayOrder({
      amount: amountInPaise,
      receipt: internalOrderId,
      notes: {
        userId: user._id.toString(),
        paymentMethod: 'online'
      }
    });

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

    const order = await Order.create({
      ...baseOrderData,
      payment: buildPayment({
        method: 'online',
        status: 'Pending',
        razorpayOrderId: razorpayOrder.id
      })
    });

    const io = req.app.get('io');
    const payload = order.toObject();
    delete payload.__v;
    emitOrderEvent(io, 'orders:new', payload, userId);

    payload.razorpayOrder = {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt
    };
    payload.razorpayKeyId = process.env.RAZORPAY_KEY_ID;

    return res.status(201).json({
      ok: true,
      order: payload,
      razorpayOrder: payload.razorpayOrder,
      razorpayKeyId: payload.razorpayKeyId,
      message: 'Payment order created successfully'
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

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        ok: false,
        message: 'Payment verification data is incomplete'
      });
    }

    const isValid = verifyPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature
    });

    if (!isValid) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid payment signature'
      });
    }

    const order = await Order.findOne({
      'payment.razorpayOrderId': razorpayOrderId
    }).populate('user', '_id role');

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: 'Order not found for the provided Razorpay order ID'
      });
    }

    if (order.user._id.toString() !== userId) {
      return res.status(403).json({
        ok: false,
        message: 'You are not authorized to verify this payment'
      });
    }

    if (order.payment.status === 'Done') {
      const io = req.app.get('io');
      const broadcastPayload = {
        orderId: order.orderId,
        status: order.status,
        paymentStatus: order.payment.status,
        transactionId: order.payment.transactionId
      };
      emitOrderEvent(io, 'orders:status', broadcastPayload, order.user._id);

      const payload = order.toObject();
      delete payload.__v;
      return res.json({
        ok: true,
        order: payload,
        message: 'Payment already verified'
      });
    }

    order.payment.status = 'Done';
    order.payment.transactionId = razorpayPaymentId;

    await order.save();

    const io = req.app.get('io');
    const broadcastPayload = {
      orderId: order.orderId,
      status: order.status,
      paymentStatus: order.payment.status,
      transactionId: order.payment.transactionId
    };
    emitOrderEvent(io, 'orders:status', broadcastPayload, order.user._id);

    const payload = order.toObject();
    delete payload.__v;

    return res.json({
      ok: true,
      order: payload,
      message: 'Payment verified successfully'
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
