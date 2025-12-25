# Exact Code Changes - Copy/Paste Ready

## File 1: src/api.js (COMPLETE FILE)

**DELETE everything and replace with this:**

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://api.keeva.in';

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  const text = await response.text();
  console.error('❌ Non-JSON Response:', text.substring(0, 200));
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
    console.log('📤 Creating COD Order with payload:', JSON.stringify(orderData, null, 2));
    
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('❌ No authentication token found. Please login first.');
    }

    console.log('🔐 Token:', token.substring(0, 20) + '...');
    console.log('🌐 URL:', `${BASE_URL}/orders/create`);

    const response = await fetch(`${BASE_URL}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    console.log('📊 Response Status:', response.status);
    console.log('📋 Content-Type:', response.headers.get('content-type'));

    if (!response.ok) {
      const errorData = await parseResponse(response);
      throw new Error(errorData.message || `❌ HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await parseResponse(response);
    console.log('✅ COD Order Success:', data);
    return data;
  } catch (error) {
    console.error('❌ Error creating COD order:', error.message);
    throw error;
  }
};

export const createPaymentOrder = async (orderData) => {
  try {
    console.log('📤 Creating Payment Order with payload:', JSON.stringify(orderData, null, 2));
    
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('❌ No authentication token found. Please login first.');
    }

    const response = await fetch(`${BASE_URL}/orders/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    console.log('📊 Response Status:', response.status);

    if (!response.ok) {
      const errorData = await parseResponse(response);
      throw new Error(errorData.message || `❌ HTTP ${response.status}`);
    }

    const data = await parseResponse(response);
    console.log('✅ Payment Order Success:', data);
    return data;
  } catch (error) {
    console.error('❌ Error creating payment order:', error.message);
    throw error;
  }
};

export const verifyPayment = async (paymentData) => {
  try {
    console.log('📤 Verifying payment:', paymentData);
    
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('❌ No authentication token found.');
    }

    const response = await fetch(`${BASE_URL}/orders/payment/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData),
    });

    console.log('📊 Verify Response Status:', response.status);

    if (!response.ok) {
      const errorData = await parseResponse(response);
      throw new Error(errorData.message || `❌ HTTP ${response.status}`);
    }

    const data = await parseResponse(response);
    console.log('✅ Payment Verified:', data);
    return data;
  } catch (error) {
    console.error('❌ Error verifying payment:', error.message);
    throw error;
  }
};
```

---

## File 2: src/cart/CheckoutScreen.js (Find & Replace Sections)

### SECTION 1: handleCODOrder (Find around line 89)

**FIND:**
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
            navigation.navigate('KeevaHome');  // ❌ CHANGE THIS
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

**REPLACE WITH:**
```javascript
const handleCODOrder = async () => {
  setLoading(true);
  try {
    const orderData = prepareOrderData();
    console.log('📤 Sending COD Order:', orderData);
    
    const response = await createCODOrder(orderData);

    if (response.ok) {
      Alert.alert('Success', 'Order placed successfully!', [
        {
          text: 'OK',
          onPress: () => {
            dispatch(clearCart());
            navigation.navigate('YourOrders');  // ✅ CHANGED
          },
        },
      ]);
    } else {
      Alert.alert('Error', response.message || 'Failed to place order');
    }
  } catch (error) {
    Alert.alert('Error', error.message || 'Something went wrong');
    console.error('❌ COD Order Error:', error);
  } finally {
    setLoading(false);
  }
};
```

### SECTION 2: handleOnlinePayment (Find around line 116)

**FIND:**
```javascript
const handleOnlinePayment = async () => {
  setLoading(true);
  try {
    const orderData = prepareOrderData();
    const paymentOrderData = {
      ...orderData,
      payment: { method: 'online' },
    };
    const paymentResponse = await createPaymentOrder(paymentOrderData);
```

**REPLACE WITH:**
```javascript
const handleOnlinePayment = async () => {
  setLoading(true);
  try {
    const orderData = prepareOrderData();
    const paymentOrderData = {
      ...orderData,
      payment: { method: 'online' },
    };
    console.log('📤 Sending Payment Order:', paymentOrderData);
    
    const paymentResponse = await createPaymentOrder(paymentOrderData);
```

---

## File 3: src/CaategoryScreen/AllCategoryPage.js (Find & Replace)

### Find the handleAddToCart function (around line 76)

**FIND:**
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

**REPLACE WITH:**
```javascript
const handleAddToCart = (product) => {
  dispatch(addItem({
    id: product._id,
    name: product.name,
    price: product.price.selling_price,
    originalPrice: product.price.mrp,
    vendorId: product.vendor?.vendor_id || 'VEND001',  // ✅ ADDED
    image: { uri: product.images?.[0]?.url },
    quantity: 1,
  }));
};
```

---

## File 4: Backend - server.js or app.js

### Find the routes section (around line 50-100)

**FIND:**
```javascript
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// Then error handling comes after
app.use((err, req, res, next) => {
```

**REPLACE WITH:**
```javascript
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');  // ✅ ADDED

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/orders', orderRoutes);  // ✅ ADDED

// Then error handling comes after
app.use((err, req, res, next) => {
```

---

## File 5: Backend - Copy These Files

```bash
# Copy controller
cp BACKEND_orderController_UPDATED.js controllers/orderController.js

# Copy payment controller (if doing online payments)
cp BACKEND_paymentController_UPDATED.js controllers/paymentController.js

# Copy routes
cp BACKEND_orderRoutes.js routes/orderRoutes.js
```

---

## Summary of Changes

### Frontend Changes
1. ✅ **src/api.js** - Complete replacement with better error handling
2. ✅ **src/cart/CheckoutScreen.js** - Change navigation to YourOrders
3. ✅ **src/CaategoryScreen/AllCategoryPage.js** - Add vendorId

### Backend Changes
1. ✅ **server.js/app.js** - Register orderRoutes
2. ✅ **controllers/orderController.js** - Copy file
3. ✅ **routes/orderRoutes.js** - Copy file

---

## Testing After Changes

### 1. Restart Everything
```bash
# Frontend
npx react-native start

# Backend
npm start
```

### 2. Test via App
- Open app
- Add items to cart
- Go to checkout
- Select "Cash on Delivery"
- Click "Proceed to Pay"
- Check console logs

### 3. Check Console Output
You should see:
```
📤 Creating COD Order with payload: {...}
🔐 Token: eyJhbGciOiJIUzI1NiIs...
🌐 URL: https://api.keeva.in/orders/create
📊 Response Status: 201
✅ COD Order Success: {...}
```

If you see error, check:
- Routes registered in server.js ✅
- Backend running ✅
- User logged in ✅
- Token valid ✅

---

## All Changes Summary

| File | Change | Line |
|------|--------|------|
| api.js | Complete new file | All |
| CheckoutScreen.js | Change to YourOrders | ~100 |
| CheckoutScreen.js | Add console logs | ~94, ~125 |
| AllCategoryPage.js | Add vendorId | ~83 |
| server.js | Add orderRoutes register | ~75 |

---

## Test Checklist After All Changes

- [ ] api.js replaced completely
- [ ] CheckoutScreen uses YourOrders
- [ ] AllCategoryPage has vendorId
- [ ] server.js has orderRoutes registered
- [ ] Backend files copied
- [ ] Backend restarted
- [ ] Frontend restarted
- [ ] Console shows correct logs
- [ ] Order created successfully
- [ ] Navigated to YourOrders

Once all checked ✅, done! 🎉
