# Complete COD & Online Payment Implementation Guide

## Backend Setup (Updated)

### 1. Copy Files to Your Backend

```bash
# Copy order controller
cp BACKEND_orderController_UPDATED.js controllers/orderController.js

# Copy payment controller
cp BACKEND_paymentController_UPDATED.js controllers/paymentController.js

# Create routes file
cp BACKEND_orderRoutes.js routes/orderRoutes.js
```

### 2. Register Routes in Main App (`server.js` or `app.js`)

```javascript
const orderRoutes = require('./routes/orderRoutes');

// Add after other routes
app.use('/orders', orderRoutes);
```

### 3. Ensure Environment Variables

```env
RAZORPAY_KEY_ID=rzp_test_RYbGAy70sU3V0B
RAZORPAY_KEY_SECRET=your_secret_key
DATABASE_URL=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

### 4. Install Razorpay Package (if not installed)

```bash
npm install razorpay
```

---

## Frontend Updates ✅

### CheckoutScreen.js - UPDATED
**File**: `e:\keevaapp\src\cart\CheckoutScreen.js`

**Changes Made**:
1. ✅ Updated `prepareOrderData()` to match exact payload structure
2. ✅ Added `vendorId` to items
3. ✅ Changed pricing keys: `subtotal`, `deliveryFee`, `tax`, `couponDiscount`, `total`
4. ✅ Added `payment` object with `method`
5. ✅ Updated `delivery` with `expectedDate`
6. ✅ Added `addressId` and `couponCode`
7. ✅ Added delivery date calculation

**Payload Structure (Correct)**:
```javascript
{
  items: [
    {
      productId: "693a9ce091fcf0e2593ac768",
      name: "Organic Almonds",
      price: 450,
      quantity: 2,
      vendorId: "VEND001"
    }
  ],
  pricing: {
    subtotal: 900,
    deliveryFee: 40,
    tax: 0,
    couponDiscount: 0,
    total: 940
  },
  payment: {
    method: "cod"
  },
  delivery: {
    type: "standard",
    expectedDate: "2025-12-24"
  },
  addressId: "ADDRESS_ID_FROM_USER_PROFILE",
  couponCode: null
}
```

---

## API Testing

### Test 1: Create COD Order

**cURL Command**:
```bash
curl -X POST https://api.keeva.in/orders/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "693a9ce091fcf0e2593ac768",
        "name": "Organic Almonds",
        "price": 450,
        "quantity": 2,
        "vendorId": "VEND001"
      }
    ],
    "pricing": {
      "subtotal": 900,
      "deliveryFee": 40,
      "tax": 0,
      "couponDiscount": 0,
      "total": 940
    },
    "payment": {
      "method": "cod"
    },
    "delivery": {
      "type": "standard",
      "expectedDate": "2025-12-24"
    },
    "addressId": "507f1f77bcf86cd799439001",
    "couponCode": null
  }'
```

**Expected Response (201)**:
```json
{
  "ok": true,
  "message": "Order created successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439050",
    "orderId": "ORD1703322000123",
    "user": "507f1f77bcf86cd799439001",
    "items": [
      {
        "productId": "693a9ce091fcf0e2593ac768",
        "name": "Organic Almonds",
        "price": 450,
        "quantity": 2,
        "vendorId": "VEND001"
      }
    ],
    "pricing": {
      "subtotal": 900,
      "deliveryFee": 40,
      "tax": 0,
      "couponDiscount": 0,
      "total": 940
    },
    "payment": {
      "method": "cod",
      "status": "Pending",
      "transactionId": null
    },
    "status": "Pending",
    "delivery": {
      "type": "standard",
      "expectedDate": "2025-12-24",
      "status": "Pending"
    },
    "createdAt": "2023-12-23T10:00:00Z",
    "updatedAt": "2023-12-23T10:00:00Z"
  }
}
```

**What Happens**:
1. ✅ Order created with COD payment
2. ✅ Order status: Pending
3. ✅ Payment status: Pending
4. ✅ Can be marked as complete when customer pays

---

### Test 2: Create Online Payment Order

**cURL Command**:
```bash
curl -X POST https://api.keeva.in/orders/payment/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "693a9ce091fcf0e2593ac768",
        "name": "Organic Almonds",
        "price": 450,
        "quantity": 2,
        "vendorId": "VEND001"
      }
    ],
    "pricing": {
      "subtotal": 900,
      "deliveryFee": 40,
      "tax": 0,
      "couponDiscount": 0,
      "total": 940
    },
    "payment": {
      "method": "online"
    },
    "delivery": {
      "type": "standard",
      "expectedDate": "2025-12-24"
    },
    "addressId": "507f1f77bcf86cd799439001",
    "couponCode": null
  }'
```

**Expected Response (201)**:
```json
{
  "ok": true,
  "message": "Payment order created successfully",
  "razorpayOrder": {
    "id": "order_abc123xyz789",
    "amount": 94000,
    "currency": "INR",
    "receipt": "ORD1703322000456"
  },
  "razorpayKeyId": "rzp_test_RYbGAy70sU3V0B",
  "order": {
    "_id": "507f1f77bcf86cd799439051",
    "orderId": "ORD1703322000456",
    "payment": {
      "method": "online",
      "status": "Pending",
      "razorpayOrderId": "order_abc123xyz789",
      "transactionId": null
    },
    "status": "Pending",
    ...
  }
}
```

**What Happens**:
1. ✅ Order created with online payment
2. ✅ Razorpay order created (amount in paise: 940 * 100 = 94000)
3. ✅ Razorpay Key and Order details sent to frontend
4. ✅ Frontend opens Razorpay modal
5. ✅ User completes payment
6. ✅ Frontend calls verify endpoint

---

### Test 3: Verify Payment

**Test Payment Card** (Razorpay Test Mode):
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date (e.g., `12/25`)
- CVV: Any 3 digits (e.g., `123`)

**After user completes payment in Razorpay modal**:

**cURL Command**:
```bash
curl -X POST https://api.keeva.in/orders/payment/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_abc123xyz789",
    "razorpay_payment_id": "pay_abc123xyz789",
    "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
  }'
```

**Expected Response (200)**:
```json
{
  "ok": true,
  "message": "Payment verified successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439051",
    "orderId": "ORD1703322000456",
    "payment": {
      "method": "online",
      "status": "Done",
      "razorpayOrderId": "order_abc123xyz789",
      "transactionId": "pay_abc123xyz789"
    },
    "status": "Pending",
    ...
  }
}
```

**What Happens**:
1. ✅ Signature verified (HMAC-SHA256)
2. ✅ Payment status updated to "Done"
3. ✅ Transaction ID stored
4. ✅ Order status remains "Pending" (waiting for fulfillment)
5. ✅ Order ready for delivery

---

## Complete Workflow

### COD Order Workflow
```
1. User adds items to cart (Redux)
   ↓
2. Navigate to checkout
   ↓
3. Select "Cash on Delivery"
   ↓
4. Click "Proceed to Pay ₹940"
   ↓
5. Frontend calls createCODOrder() with payload
   ↓
6. Backend validates and creates order
   ↓
7. Response: { ok: true, order: {...} }
   ↓
8. Alert shown: "Order created successfully!"
   ↓
9. Cart cleared
   ↓
10. Navigate to home
```

### Online Payment Workflow
```
1. User adds items to cart (Redux)
   ↓
2. Navigate to checkout
   ↓
3. Select "Pay Online"
   ↓
4. Click "Proceed to Pay ₹940"
   ↓
5. Frontend calls createPaymentOrder() with payload
   ↓
6. Backend validates, creates Razorpay order, creates order
   ↓
7. Response: { ok: true, razorpayOrder: {...}, razorpayKeyId: ... }
   ↓
8. Frontend opens Razorpay modal
   ↓
9. User enters card details and completes payment
   ↓
10. Razorpay returns: {razorpay_order_id, razorpay_payment_id, razorpay_signature}
   ↓
11. Frontend calls verifyPayment() with payment details
   ↓
12. Backend verifies signature and updates order
   ↓
13. Response: { ok: true, order: {...} }
   ↓
14. Alert shown: "Payment verified successfully!"
   ↓
15. Cart cleared
   ↓
16. Navigate to home
```

---

## Error Scenarios

### ❌ Error: Missing Items
```json
{
  "ok": false,
  "message": "Order items are required"
}
```
**Fix**: Ensure items array is not empty

### ❌ Error: Missing Required Item Fields
```json
{
  "ok": false,
  "message": "All items must have productId, name, price, and quantity"
}
```
**Fix**: Ensure each item has: `productId`, `name`, `price`, `quantity`

### ❌ Error: Invalid Total Amount
```json
{
  "ok": false,
  "message": "Invalid order total amount"
}
```
**Fix**: Ensure `pricing.total` > 0

### ❌ Error: Invalid Payment Signature
```json
{
  "ok": false,
  "message": "Invalid payment signature - verification failed"
}
```
**Fix**: 
- Verify `RAZORPAY_KEY_SECRET` is correct
- Ensure signature calculation is correct
- Check Razorpay credentials

### ❌ Error: Order Not Found
```json
{
  "ok": false,
  "message": "Order not found for this payment"
}
```
**Fix**: 
- Ensure payment order was created before verification
- Check if razorpayOrderId is correct

### ❌ Error: Unauthorized
```json
{
  "ok": false,
  "message": "User not found"
}
```
**Fix**: Ensure token is valid and user exists

---

## Additional Endpoints

### Get All Orders
```bash
GET /orders/list
Authorization: Bearer YOUR_TOKEN
```

### Get Single Order
```bash
GET /orders/ORD1703322000123
Authorization: Bearer YOUR_TOKEN
```

### Update Order Status
```bash
PUT /orders/ORD1703322000123/status
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "status": "Confirmed"
}
```

Valid statuses: `Pending`, `Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`

### Cancel Order
```bash
PUT /orders/ORD1703322000123/cancel
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "reason": "Changed my mind"
}
```

---

## Testing Checklist

- [ ] Backend routes registered
- [ ] Environment variables set
- [ ] Database connected
- [ ] POST /orders/create works with COD
- [ ] POST /orders/payment/create works with online
- [ ] POST /orders/payment/verify works
- [ ] GET /orders/list returns user orders
- [ ] Frontend sends correct payload
- [ ] Cart clears on success
- [ ] Error messages show on failure
- [ ] Razorpay modal opens for online payment
- [ ] Test payment completes successfully
- [ ] Order status updates correctly

---

## Files Summary

| File | Purpose | Action |
|------|---------|--------|
| BACKEND_orderController_UPDATED.js | COD order handling | Copy to `controllers/orderController.js` |
| BACKEND_paymentController_UPDATED.js | Online payment handling | Copy to `controllers/paymentController.js` |
| BACKEND_orderRoutes.js | API routes | Copy to `routes/orderRoutes.js` |
| CheckoutScreen.js | Frontend checkout | ✅ Already updated |
| api.js | API calls | ✅ Already updated |

---

## Status

✅ **Everything is Ready**
- Frontend: Updated with correct payload
- Backend: Provided with complete implementation
- Routes: Provided and ready to register
- Testing: Complete workflow documented
- Error Handling: Comprehensive error messages

**Next Step**: Copy backend files and test!
