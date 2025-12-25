# Backend Setup Guide - Order & Payment System

## Files to Update/Create in Your Backend

### 1. **Order Controller** (`controllers/orderController.js`)
- **File**: `BACKEND_orderController.js` (provided)
- Replace your existing `orderController.js` with this file
- **Key Changes**:
  - Added proper validation for items array
  - Rejects online payments with helpful error message
  - Improved error handling with console logging
  - Returns standardized response format

### 2. **Payment Controller** (`controllers/paymentController.js`)
- **File**: `BACKEND_paymentController.js` (provided)
- Create or replace your existing `paymentController.js`
- **Key Functions**:
  - `createPaymentOrder()`: Creates Razorpay order
  - `verifyPayment()`: Verifies payment signature and updates order status

### 3. **Routes Setup** (`routes/orderRoutes.js`)

```javascript
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { createPaymentOrder, verifyPayment } = require('../controllers/paymentController');

// COD Orders
router.post('/create', authenticateUser, createOrder);
router.get('/list', authenticateUser, getOrders);
router.put('/:orderId/status', authenticateUser, updateOrderStatus);

// Online Payment Orders
router.post('/payment/create', authenticateUser, createPaymentOrder);
router.post('/payment/verify', authenticateUser, verifyPayment);

module.exports = router;
```

### 4. **Register Routes in App.js**

```javascript
const orderRoutes = require('./routes/orderRoutes');
app.use('/orders', orderRoutes);
```

## Frontend Changes

### 1. **CheckoutScreen.js** ✅ (Already Fixed)
- Added `name` field to items object
- Improved error handling
- Proper payment flow logic

### 2. **api.js** ✅ (Already Fixed)
- Updated endpoint URLs to match backend routes:
  - COD: `/orders/create`
  - Payment: `/orders/payment/create`
  - Verify: `/orders/payment/verify`
- Added better error handling for non-JSON responses
- Proper HTTP status code checking

## API Endpoints

### Create COD Order
```
POST /orders/create
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "name": "Tomato",
      "quantity": 2,
      "price": 50
    }
  ],
  "pricing": {
    "itemTotal": 100,
    "discount": 10,
    "deliveryFee": 0,
    "grandTotal": 90
  },
  "delivery": {
    "type": "home",
    "estimatedTime": "10 mins"
  }
}

Response:
{
  "ok": true,
  "order": {
    "orderId": "ORD123456",
    "status": "Pending",
    "payment": {
      "method": "cod",
      "status": "Pending"
    },
    ...
  },
  "message": "Order created successfully"
}
```

### Create Payment Order (Razorpay)
```
POST /orders/payment/create
Authorization: Bearer {token}
Content-Type: application/json

Body: (Same as COD)

Response:
{
  "ok": true,
  "order": { ... },
  "razorpayOrder": {
    "id": "order_abc123",
    "amount": 9000,
    "currency": "INR",
    "receipt": "ORD123456"
  },
  "razorpayKeyId": "rzp_test_RYbGAy70sU3V0B",
  "message": "Payment order created successfully"
}
```

### Verify Payment
```
POST /orders/payment/verify
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "razorpay_order_id": "order_abc123",
  "razorpay_payment_id": "pay_xyz789",
  "razorpay_signature": "signature_hash"
}

Response:
{
  "ok": true,
  "order": { ... },
  "message": "Payment verified successfully"
}
```

## Important Notes

1. **Item Validation**: Items MUST have:
   - `productId` or `_id`
   - `name`
   - `quantity`
   - `price`

2. **Pricing Validation**: 
   - `grandTotal` must be > 0
   - Amount converted to paise for Razorpay (multiply by 100)

3. **Error Handling**:
   - Invalid JSON responses caught and reported
   - Proper HTTP status codes (400, 404, 403, 500)
   - Descriptive error messages logged to console

4. **Payment Flow**:
   - User selects payment method
   - Frontend sends order data to appropriate endpoint
   - Backend validates and creates order
   - For online: Razorpay order created, keys sent to frontend
   - Frontend initiates Razorpay modal
   - User completes payment in modal
   - Frontend calls verify endpoint with payment details
   - Backend verifies signature and updates order status

## Troubleshooting

### "JSON Parse error: Unexpected character: <"
- Backend is returning HTML instead of JSON
- Check: Middleware order, error handling, route registration
- Verify all routes are properly imported in main app file

### "Order validation failed: items.0.name: Path `name` is required"
- Frontend not sending `name` field in items
- ✅ Already fixed in updated CheckoutScreen.js

### "Invalid payable amount"
- `grandTotal` is 0 or negative
- Verify pricing calculations in frontend

### Payment signature verification failed
- Razorpay secret key mismatch
- Check `RAZORPAY_KEY_SECRET` in environment variables
- Verify signature verification logic in `razorpayService.js`

## Testing Checklist

- [ ] COD order creation works
- [ ] COD order appears in order list
- [ ] Online payment order creation works
- [ ] Razorpay modal opens with correct amount
- [ ] Payment can be completed in test mode
- [ ] Payment verification succeeds
- [ ] Order status updates to "Done" after payment
- [ ] Cart clears after successful order
- [ ] User redirected to home after order
