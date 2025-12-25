# Fix for "Server Returned Invalid Response" Error

## Problem
Backend returns HTML error page instead of JSON. This means:
- ❌ Routes not registered in backend
- ❌ Endpoint path wrong
- ❌ Backend not started
- ❌ Token missing

---

## Solution

### Step 1: Verify Backend Routes are Registered

In your **server.js** or **app.js**, add this:

```javascript
// AFTER all other route registrations
const orderRoutes = require('./routes/orderRoutes');

// IMPORTANT: Add this BEFORE error handling middleware
app.use('/orders', orderRoutes);

// Error handling comes AFTER
app.use((err, req, res, next) => {
  // error handling
});
```

**CRITICAL**: The order matters!
1. ✅ Routes first
2. ✅ Then error handling
3. ❌ If reversed, gets 404

---

### Step 2: Test Backend is Running

```bash
# Check if backend is running
curl https://api.keeva.in/ping
# or
curl https://api.keeva.in/health

# Should return 200 OK, not 404
```

---

### Step 3: Test Endpoint with Token

```bash
# Get your token first (from login)
TOKEN="your_actual_token_here"

# Test endpoint
curl -X POST https://api.keeva.in/orders/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": "693a9ce091fcf0e2593ac768", "name": "Almonds", "price": 450, "quantity": 2, "vendorId": "VEND001"}],
    "pricing": {"subtotal": 900, "deliveryFee": 40, "tax": 0, "couponDiscount": 0, "total": 940},
    "payment": {"method": "cod"},
    "delivery": {"type": "standard", "expectedDate": "2025-12-15"},
    "addressId": "507f1f77bcf86cd799439001",
    "couponCode": null
  }'
```

If you get HTML back, the route isn't registered.

---

## Complete Fixed Code

### 1. AllCategoryPage.js - Add vendorId

**Find this section** (around line 76):
```javascript
const handleAddToCart = (product) => {
  dispatch(addItem({
    id: product._id,
    name: product.name,
    price: product.price.selling_price,
    originalPrice: product.price.mrp,
    image: { uri: product.images?.[0]?.url },
    quantity: 1,
  }));
};
```

**Replace with**:
```javascript
const handleAddToCart = (product) => {
  dispatch(addItem({
    id: product._id,
    name: product.name,
    price: product.price.selling_price,
    originalPrice: product.price.mrp,
    vendorId: product.vendor?.vendor_id || 'VEND001',
    image: { uri: product.images?.[0]?.url },
    quantity: 1,
  }));
};
```

---

### 2. api.js - Better Error Handling

**Replace the entire file** with:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://api.keeva.in';

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  const text = await response.text();
  console.error('Non-JSON Response:', text.substring(0, 200));
  throw new Error(`Backend returned HTML/Error. Status: ${response.status}. Check if routes are registered.`);
};

export const sendOtp = async (phone) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

export const verifyOtp = async (phone, otp) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, otp }),
    });
    const data = await response.json();
    
    if (data.ok && data.token) {
      await AsyncStorage.setItem('userToken', data.token);
      if (data.user) {
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

export const getProfile = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${BASE_URL}/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const updateProfile = async (userData) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const createCODOrder = async (orderData) => {
  try {
    console.log('Creating COD Order with payload:', JSON.stringify(orderData, null, 2));
    
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    console.log('Token:', token.substring(0, 20) + '...');
    console.log('URL:', `${BASE_URL}/orders/create`);

    const response = await fetch(`${BASE_URL}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers.get('content-type'));

    if (!response.ok) {
      const errorData = await parseResponse(response);
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await parseResponse(response);
    console.log('COD Order Success:', data);
    return data;
  } catch (error) {
    console.error('Error creating COD order:', error.message);
    throw error;
  }
};

export const createPaymentOrder = async (orderData) => {
  try {
    console.log('Creating Payment Order with payload:', JSON.stringify(orderData, null, 2));
    
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${BASE_URL}/orders/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    console.log('Response Status:', response.status);

    if (!response.ok) {
      const errorData = await parseResponse(response);
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await parseResponse(response);
    console.log('Payment Order Success:', data);
    return data;
  } catch (error) {
    console.error('Error creating payment order:', error.message);
    throw error;
  }
};

export const verifyPayment = async (paymentData) => {
  try {
    console.log('Verifying payment:', paymentData);
    
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('No authentication token found.');
    }

    const response = await fetch(`${BASE_URL}/orders/payment/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData),
    });

    console.log('Verify Response Status:', response.status);

    if (!response.ok) {
      const errorData = await parseResponse(response);
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await parseResponse(response);
    console.log('Payment Verified:', data);
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error.message);
    throw error;
  }
};
```

---

### 3. CheckoutScreen.js - Navigate to YourOrders

**Find the handleCODOrder function** (around line 89):

```javascript
const handleCODOrder = async () => {
  setLoading(true);
  try {
    const orderData = prepareOrderData();
    const response = await createCODOrder(orderData);

    if (response.ok) {
      Alert.alert('Success', 'Order placed successfully!', [
        {
          text: 'OK',
          onPress: () => {
            dispatch(clearCart());
            navigation.navigate('YourOrders');  // ✅ Changed to YourOrders
          },
        },
      ]);
    } else {
      Alert.alert('Error', response.message || 'Failed to place order');
    }
  } catch (error) {
    Alert.alert('Error', error.message || 'Something went wrong');
    console.error('COD Order Error:', error);
  } finally {
    setLoading(false);
  }
};
```

**Change this line**:
```javascript
// OLD
navigation.navigate('KeevaHome');

// NEW
navigation.navigate('YourOrders');
```

---

## Debugging Steps

### Step 1: Check Console Logs
When you run the app, open React Native debugger and look for:

```
Creating COD Order with payload: {...}
Token: xyz...
URL: https://api.keeva.in/orders/create
Response Status: 201
COD Order Success: {...}
```

If you see HTML response, check Step 2.

### Step 2: Verify Routes

Your **server.js/app.js** should have:

```javascript
const orderRoutes = require('./routes/orderRoutes');

// This must be BEFORE error handling
app.use('/orders', orderRoutes);
```

Check if this line exists. If not, add it.

### Step 3: Verify Backend Started

```bash
# In your backend folder
npm start

# Should show: Server running on port 5000 (or your port)
# Should NOT show: Cannot find module
```

### Step 4: Test Endpoint

```bash
# Copy this exact curl command and run it
curl -v -X POST https://api.keeva.in/orders/create \
  -H "Authorization: Bearer YOUR_ACTUAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"693a9ce091fcf0e2593ac768","name":"Almonds","price":450,"quantity":2,"vendorId":"VEND001"}],"pricing":{"subtotal":900,"deliveryFee":40,"tax":0,"couponDiscount":0,"total":940},"payment":{"method":"cod"},"delivery":{"type":"standard","expectedDate":"2025-12-15"},"addressId":"ADDRESS_ID","couponCode":null}'
```

Should return:
```json
{
  "ok": true,
  "message": "Order created successfully",
  "order": {...}
}
```

If you get HTML, the route isn't registered.

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `Server returned invalid response: <!` | Routes not registered. Add `app.use('/orders', orderRoutes)` |
| `No token found` | User not logged in. Login first. |
| `Order items are required` | Items array empty. Check cart state. |
| `Cannot find module 'orderRoutes'` | File path wrong. Check `routes/orderRoutes.js` exists. |
| `Cannot GET /orders/create` | Routes not registered or middleware blocking. |

---

## Checklist Before Testing

- [ ] Backend routes registered in app.js/server.js
- [ ] `routes/orderRoutes.js` exists
- [ ] `controllers/orderController.js` copied from backend file
- [ ] Backend running (`npm start` shows no errors)
- [ ] User logged in (has valid token)
- [ ] Cart has items with vendorId
- [ ] Curl test works before React Native test
- [ ] Console logs show correct payload

---

## Success Flow

```
1. Add items to cart (with vendorId) ✅
   ↓
2. Click "Click to Pay" ✅
   ↓
3. Select "Cash on Delivery" ✅
   ↓
4. Click "Proceed to Pay" ✅
   ↓
5. See console logs with payload ✅
   ↓
6. Response: { ok: true, order: {...} } ✅
   ↓
7. Success alert shows ✅
   ↓
8. Navigate to YourOrders ✅
   ↓
9. Cart cleared ✅
```

Once all these pass, you're done! ✅
