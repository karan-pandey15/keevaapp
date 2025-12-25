# Keeva Cart & Checkout Setup Instructions

## Prerequisites

Make sure you have these dependencies installed. Run these commands in your project root:

### 1. Required NPM Packages

```bash
npm install react-native-razorpay
npm install @react-native-async-storage/async-storage
npm install react-native-vector-icons
npm install @react-navigation/native
npm install redux react-redux
npm install @reduxjs/toolkit
```

### 2. Navigation Setup

Make sure your navigation includes the `CheckoutScreen`. Update your navigation file (usually App.js or your main navigator):

```javascript
import CheckoutScreen from './src/cart/CheckoutScreen';

// In your Stack Navigator:
<Stack.Screen 
  name="CheckoutScreen" 
  component={CheckoutScreen} 
  options={{ headerShown: false }}
/>
```

## Environment Variables

Create or update your `.env` file with the following:

```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RYbGAy70sU3V0B
RAZORPAY_KEY_SECRET=dlzL6oLG4vLh2Wn1LaBBYkhy
```

## Features Implemented

### 1. **CartButton** (`src/helperComponent/CartButton.js`)
   - Shows cart count badge
   - Only appears when cart has items
   - Navigates to KeevaCart screen
   - Added to all category screens

### 2. **KeevaCart** (`src/cart/KeevaCart.js`)
   - Dynamic calculation of totals
   - Item total calculation based on cart items
   - Discount calculation (based on original vs selling price)
   - Display all cart items with quantity controls
   - "Click to Pay" button navigates to checkout

### 3. **CheckoutScreen** (`src/cart/CheckoutScreen.js`)
   - Two payment options:
     - **Cash on Delivery (COD)**: Calls `/orders/create` endpoint
     - **Pay Online**: Calls `/payments/create` endpoint with Razorpay integration
   - Razorpay payment flow with signature verification
   - Order summary with totals
   - Automatic cart clear on successful order

### 4. **API Service** (`src/api.js`)
   - `createCODOrder()`: Create order with COD payment
   - `createPaymentOrder()`: Create order for online payment
   - `verifyPayment()`: Verify Razorpay payment signature

### 5. **Razorpay Service** (`src/services/razorpayService.js`)
   - `initiateRazorpayPayment()`: Handles Razorpay payment modal

## Updated Files

### CartButton Added To:
- `src/helperComponent/TrendingGrocery.js`
- `src/CaategoryScreen/AllCategoryPage.js`
- `src/CaategoryScreen/FreshFruit.js`
- `src/CaategoryScreen/FreshVeg.js`
- `src/CaategoryScreen/MilkBread.js`
- `src/CaategoryScreen/GroceryScreen.js`

### Modified Files:
- `src/api.js`: Added order and payment APIs
- `src/cart/KeevaCart.js`: Dynamic totals and checkout flow

## How the Flow Works

### Adding Items to Cart
1. User browses products in category screens
2. Clicks "ADD" button to add items
3. CartButton appears at bottom right (if not already visible)
4. CartButton shows item count

### Viewing Cart
1. User clicks CartButton
2. Navigates to KeevaCart
3. Can adjust quantities using +/- buttons
4. Sees itemized cart with totals
5. Clicks "Click to Pay" button

### Payment Process

#### COD Payment:
1. User selects "Cash on Delivery"
2. Clicks "Proceed to Pay"
3. API call to `/orders/create`
4. If successful, cart clears and returns to home
5. Order is created with "Pending" status

#### Online Payment:
1. User selects "Pay Online"
2. Clicks "Proceed to Pay"
3. API call to `/payments/create`
4. Razorpay payment modal opens
5. User completes payment in modal
6. App verifies signature via `/payments/verify`
7. If verified, cart clears and returns to home
8. Order status updated to "Done"

## Testing

### Test with These Credentials:
- **Razorpay Key ID**: rzp_test_RYbGAy70sU3V0B
- **Razorpay Key Secret**: dlzL6oLG4vLh2Wn1LaBBYkhy

### Test Cards (for Razorpay):
- **Success**: 4111 1111 1111 1111 (any future date, any CVV)
- **Decline**: 4000 0000 0000 0002 (any future date, any CVV)

## Important Notes

1. **Authentication**: All API calls include user token from AsyncStorage
2. **Cart State**: Managed via Redux (cartSlice)
3. **Error Handling**: All screens have try-catch with user-friendly alerts
4. **Loading States**: Payment screens show loading indicator during processing
5. **Order Format**: Items are sent with productId, quantity, and price

## API Endpoint Requirements

Your backend must handle these endpoints:

### 1. Create COD Order
**POST** `/orders/create`
```json
{
  "items": [
    {
      "productId": "id",
      "quantity": 2,
      "price": 100
    }
  ],
  "pricing": {
    "itemTotal": 200,
    "discount": 50,
    "deliveryFee": 30,
    "grandTotal": 180
  },
  "delivery": {
    "type": "home",
    "estimatedTime": "10 mins"
  }
}
```

**Response**:
```json
{
  "ok": true,
  "order": { "orderId": "...", ...order details }
}
```

### 2. Create Online Payment Order
**POST** `/payments/create`
```json
{
  "items": [...],
  "pricing": {...},
  "delivery": {...},
  "payment": { "method": "online" }
}
```

**Response**:
```json
{
  "ok": true,
  "order": { ...order details },
  "razorpayOrder": {
    "id": "order_123",
    "amount": 18000,
    "currency": "INR",
    "receipt": "receipt_123"
  }
}
```

### 3. Verify Payment
**POST** `/payments/verify`
```json
{
  "razorpay_order_id": "order_123",
  "razorpay_payment_id": "pay_123",
  "razorpay_signature": "signature_hash"
}
```

**Response**:
```json
{
  "ok": true,
  "order": { ...updated order details }
}
```

## Troubleshooting

### CartButton Not Appearing
- Check if cart has items (Redux state)
- Verify CartButton is imported in the component
- Check z-index if it's behind other elements

### Payment Not Working
- Verify Razorpay key is correct
- Check token in AsyncStorage
- Ensure API endpoints are accessible
- Check CORS settings if calling from web

### Cart Not Clearing After Order
- Verify `clearCart()` dispatch is called
- Check if navigation is working properly
- Ensure response from API has `ok: true`

## Support

If you encounter any issues, check:
1. Console logs for detailed error messages
2. Network tab for API response errors
3. Redux DevTools for cart state
4. Backend logs for validation errors
