# Payment System Implementation Guide - React Native

## Overview
This guide explains the complete payment system implementation for your React Native app that integrates with your backend using `/payments/create` and `/payments/verify` endpoints.

## Files Modified

### 1. **src/api.js**
Updated with new payment endpoints that match your backend API:

**New Functions Added:**
- `getAddresses()` - Fetches user addresses from backend
- `createPayment(orderData)` - Creates payment order (replaces old `createCODOrder` and `createPaymentOrder`)
- `verifyPayment(paymentData)` - Verifies payment (updated to use `/payments/verify`)

**Removed Functions:**
- `createCODOrder()`
- `createPaymentOrder()`

### 2. **src/cart/KeevaCart.js**
Updated delivery fee calculation logic:

**Changes:**
- Delivery fee is now **FREE (₹0)** if `itemTotal >= 159`
- Otherwise delivery fee is **₹30**

```javascript
const deliveryFee = itemTotal >= 159 ? 0 : 30;
```

### 3. **src/cart/CheckoutScreen.js**
Complete rewrite with proper payment flow:

**Key Updates:**

#### Data Fetching
- Fetches user profile from `/user/profile` endpoint
- Fetches user addresses from `/user/addresses` endpoint
- Auto-selects default address or first available address
- Shows loading state while fetching data

#### Order Payload Structure
Matches your backend requirements:

```javascript
{
  "items": [
    {
      "productId": "694a877eec037668ae1f5dff",
      "name": "Capsicum",
      "quantity": 2,
      "unitPrice": 25,
      "discount": 5,
      "finalPrice": 20,
      "image": "url_or_string"
    }
  ],
  "pricing": {
    "subtotal": 75,
    "deliveryFee": 49,
    "couponDiscount": 0,
    "tax": 0,
    "grandTotal": 124
  },
  "delivery": {
    "type": "Standard",
    "expectedTime": "2025-12-27T07:42:12.058Z",
    "instructions": ""
  },
  "address": {
    "label": "Home",
    "houseNo": "11",
    "street": "Main Street",
    "landmark": "Near Park",
    "city": "New York",
    "state": "NY",
    "pincode": "10001",
    "isDefault": true,
    "_id": "69490a6df4a82300ca85b44f",
    "contactName": "John Doe",
    "contactPhone": "9876543210"
  },
  "addressId": "69490a6df4a82300ca85b44f",
  "couponCode": null,
  "payment": {
    "method": "cod"  // or "online" for Razorpay
  }
}
```

#### COD Payment Flow
1. User selects COD payment method
2. Validates address selection
3. Calls `/payments/create` with payment method "cod"
4. On success, clears cart and navigates to home
5. Shows success alert

#### Online Payment Flow (Razorpay)
1. User selects online payment method
2. Calls `/payments/create` with payment method "online"
3. Backend returns `razorpayOrder` and `razorpayKeyId`
4. Initiates Razorpay payment using SDK
5. On successful payment, calls `/payments/verify` endpoint
6. Verifies payment signature on backend
7. On verification success, clears cart and navigates to home
8. Handles payment cancellation gracefully

#### UI Components
- **Loading Screen**: Shows while fetching profile and addresses
- **Address Section**: Displays selected delivery address with option to change
- **Payment Method Selection**: COD or Online (Razorpay)
- **Order Summary**: Shows breakdown of charges
- **Checkout Button**: Disabled until address is selected

## API Endpoint Requirements

Your backend should have:

### POST `/payments/create`
**Request Body:**
```json
{
  "items": [...],
  "pricing": {...},
  "delivery": {...},
  "address": {...},
  "addressId": "...",
  "couponCode": null,
  "payment": {
    "method": "cod" | "online"
  }
}
```

**Response (COD):**
```json
{
  "ok": true,
  "order": {
    "orderId": "...",
    ...
  }
}
```

**Response (Online):**
```json
{
  "ok": true,
  "order": {
    "orderId": "...",
    "razorpayOrder": {
      "id": "order_RvN2A6qvoLyd0C",
      "amount": 12400,
      "currency": "INR"
    },
    "razorpayKeyId": "rzp_test_RYbGAy70sU3V0B"
  }
}
```

### POST `/payments/verify`
**Request Body:**
```json
{
  "razorpay_order_id": "order_RvN2A6qvoLyd0C",
  "razorpay_payment_id": "pay_RvN3AaZBuXLHaG",
  "razorpay_signature": "31a3bcee23ea15b9919b438b1a02f319da35a2096d02add95e59d34b12a882a5"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Payment verified successfully"
}
```

## Delivery Fee Logic

The delivery fee is calculated as follows:

| Item Total | Delivery Fee |
|-----------|-------------|
| ≥ ₹159    | FREE (₹0)   |
| < ₹159    | ₹30         |

This is implemented in `KeevaCart.js` during cart calculations.

## Error Handling

The implementation handles:
- Network errors with user-friendly alerts
- Missing user data (addresses not available)
- Payment cancellation by user
- Razorpay SDK loading failures
- Verification failures
- Invalid order data

## Testing Checklist

- [ ] COD order creation works
- [ ] Online payment flow initiates Razorpay
- [ ] Razorpay payment verification succeeds
- [ ] Cart clears after successful payment
- [ ] Navigation to home after payment
- [ ] Address selection is required
- [ ] Delivery fee calculation is correct (≥159 = free, <159 = ₹30)
- [ ] User profile and addresses are fetched correctly
- [ ] Loading states work properly
- [ ] Error alerts show appropriate messages

## Integration Steps

1. **Update Backend**: Ensure `/payments/create` and `/payments/verify` endpoints match the specifications
2. **Test Endpoints**: Verify endpoints work with Postman
3. **Deploy Frontend**: Update React Native app with these changes
4. **Test Payment Flow**: 
   - Test COD payment
   - Test Razorpay payment with test keys
5. **Monitor Logs**: Check console logs for any errors

## Important Notes

1. **Delivery Fee**: The ₹30 fee is applied automatically for orders < ₹159
2. **Default Address**: If user has multiple addresses, default one is auto-selected
3. **Razorpay Key**: Make sure the Razorpay test key is correctly configured in `razorpayService.js`
4. **Token**: User token from AsyncStorage is automatically included in all API requests
5. **Image Handling**: Images can be objects with URL or direct strings - both are handled

## Troubleshooting

### Issue: Addresses not loading
- Check user has saved at least one address
- Verify `/user/addresses` endpoint returns proper response
- Check token is valid

### Issue: Payment not proceeding to Razorpay
- Verify backend `/payments/create` returns `razorpayOrder` and `razorpayKeyId`
- Check Razorpay test key is valid
- Verify Razorpay SDK loaded successfully

### Issue: Cart not clearing
- Check that `clearCart()` Redux action is properly exported
- Verify payment verification response has `ok: true`

---

## Summary

This implementation provides a complete, production-ready payment system for your React Native app that:
- ✅ Properly fetches user data
- ✅ Calculates delivery fees correctly
- ✅ Handles both COD and online payments
- ✅ Integrates with Razorpay
- ✅ Matches backend API structure
- ✅ Includes proper error handling
- ✅ Has good UX with loading states and address selection
