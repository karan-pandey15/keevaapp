const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const {
  createPaymentOrder,
  verifyPayment
} = require('../controllers/paymentController');
const { authenticateUser } = require('../middleware/auth');

router.use(authenticateUser);

router.post('/create', createOrder);
router.get('/list', getOrders);
router.get('/:orderId', getOrderById);
router.put('/:orderId/status', updateOrderStatus);
router.put('/:orderId/cancel', cancelOrder);
router.post('/payment/create', createPaymentOrder);
router.post('/payment/verify', verifyPayment);

module.exports = router;
