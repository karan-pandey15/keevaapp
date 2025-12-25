# Simple COD Order Test - Step by Step

## Before You Test

1. ✅ Backend running: `npm start`
2. ✅ Routes registered in app.js
3. ✅ User logged in on mobile app
4. ✅ Items in cart

---

## Step 1: Test via Curl First (Easiest)

Get your token:
```bash
# Login and copy the token from response
# Or check app storage/localStorage
TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

Run test:
```bash
curl -X POST https://api.keeva.in/orders/create \
  -H "Authorization: Bearer $TOKEN" \
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
      "expectedDate": "2025-12-15"
    },
    "addressId": "507f1f77bcf86cd799439001",
    "couponCode": null
  }'
```

**Expected Response**:
```json
{
  "ok": true,
  "message": "Order created successfully",
  "order": {
    "orderId": "ORD1703322000123",
    "status": "Pending",
    "payment": {
      "method": "cod",
      "status": "Pending"
    }
  }
}
```

**If you get HTML back**:
```
<!DOCTYPE html>
<html>
<head><title>Error</title></head>
<body>...</body>
</html>
```

→ Routes are not registered. Go to Step 3.

---

## Step 2: Test via React Native App

Open app → Add items → Go to checkout → Select COD → Click Pay

**Check React Native console**:
```
✅ Creating COD Order with payload: {...}
✅ Token: xyz...
✅ URL: https://api.keeva.in/orders/create
✅ Response Status: 201
✅ COD Order Success: {...}
```

If success, you'll see alert: "Order placed successfully!" and navigate to YourOrders.

---

## Step 3: If You Get HTML Error

### Fix 1: Register Routes

Edit **server.js** or **app.js**:

```javascript
// FIND THIS SECTION (probably around line 50-100)
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// ADD THIS LINE HERE ⬇️
const orderRoutes = require('./routes/orderRoutes');
app.use('/orders', orderRoutes);  // ✅ ADD THIS

// Then error handling comes after
app.use((err, req, res, next) => {
  // error handling
});
```

**Then restart**:
```bash
npm start
```

### Fix 2: Verify File Exists

Check if **routes/orderRoutes.js** exists:
```bash
ls -la routes/orderRoutes.js
# Should show: -rw-r--r-- ... orderRoutes.js
```

If not, copy it:
```bash
cp BACKEND_orderRoutes.js routes/orderRoutes.js
```

### Fix 3: Check Controller File

Check if **controllers/orderController.js** exists and has `createOrder` function:
```bash
ls -la controllers/orderController.js
grep "const createOrder" controllers/orderController.js
# Should find the function
```

---

## Step 4: Verify All Components

### Backend Check
```bash
# 1. Is backend running?
curl https://api.keeva.in/health
# Should return 200 OK

# 2. Do routes exist?
curl -X POST https://api.keeva.in/orders/create \
  -H "Authorization: Bearer fake_token" \
  -H "Content-Type: application/json" \
  -d '{"items":[]}'
# Should return 400 (bad request), NOT 404 (not found)
# 404 means route doesn't exist
# 400 means route exists but validation failed
```

### Frontend Check
```javascript
// In CheckoutScreen.js, add this console.log
const handleCODOrder = async () => {
  setLoading(true);
  try {
    const orderData = prepareOrderData();
    console.log('📤 Sending Order:', JSON.stringify(orderData, null, 2));  // ✅ ADD
    
    const response = await createCODOrder(orderData);
    console.log('📥 Response:', response);  // ✅ ADD
    
    // ... rest of code
  }
};
```

Then check console when you click pay.

---

## Complete Working Setup

### Files to Update

**1. server.js** - Register routes
```javascript
const orderRoutes = require('./routes/orderRoutes');
app.use('/orders', orderRoutes);
```

**2. api.js** - Use provided code (complete file in FIX_CHECKOUT_ERROR.md)

**3. CheckoutScreen.js** - Use provided handleCODOrder and navigate to YourOrders

**4. AllCategoryPage.js** - Add vendorId:
```javascript
const handleAddToCart = (product) => {
  dispatch(addItem({
    id: product._id,
    name: product.name,
    price: product.price.selling_price,
    originalPrice: product.price.mrp,
    vendorId: product.vendor?.vendor_id || 'VEND001',  // ✅ Add this
    image: { uri: product.images?.[0]?.url },
    quantity: 1,
  }));
};
```

---

## Real Example - Complete Flow

### Payload You're Sending
```json
{
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
    "expectedDate": "2025-12-15"
  },
  "addressId": "ADDRESS_ID_FROM_USER_PROFILE",
  "couponCode": null
}
```

### Backend Processes It
1. ✅ Validates all fields present
2. ✅ Checks user exists
3. ✅ Checks items array not empty
4. ✅ Validates pricing.total > 0
5. ✅ Creates order in database
6. ✅ Returns order with ID

### Response
```json
{
  "ok": true,
  "message": "Order created successfully",
  "order": {
    "orderId": "ORD1703322000123",
    "user": "507f1f77bcf86cd799439001",
    "items": [...],
    "pricing": {...},
    "payment": {
      "method": "cod",
      "status": "Pending"
    },
    "status": "Pending",
    "createdAt": "2023-12-23T10:00:00Z"
  }
}
```

### Frontend Handles It
1. ✅ Receives `ok: true`
2. ✅ Shows success alert
3. ✅ Clears cart: `dispatch(clearCart())`
4. ✅ Navigates: `navigation.navigate('YourOrders')`

---

## Troubleshooting Table

| What You See | What's Wrong | Fix |
|--------------|-------------|-----|
| HTML error page | Route not registered | Add `app.use('/orders', orderRoutes)` |
| `Cannot find module 'orderRoutes'` | File missing | Copy `BACKEND_orderRoutes.js` |
| `Cannot find module 'orderController'` | File missing | Copy `BACKEND_orderController_UPDATED.js` |
| 404 error | Endpoint wrong | Use `/orders/create` not `/orders` |
| 401 error | No token | Login first |
| 400 with validation error | Missing fields | Check payload structure |
| Order created! | ✅ SUCCESS | Navigate to YourOrders |

---

## Quick Checklist

Run through this:

- [ ] Backend running: `npm start` (no errors)
- [ ] Routes file exists: `routes/orderRoutes.js` ✅
- [ ] Controller file exists: `controllers/orderController.js` ✅
- [ ] Routes registered in app.js: `app.use('/orders', orderRoutes)` ✅
- [ ] Curl test works: Returns JSON, not HTML ✅
- [ ] Frontend api.js updated: Complete file from FIX_CHECKOUT_ERROR.md ✅
- [ ] CheckoutScreen.js updated: Uses YourOrders for navigation ✅
- [ ] AllCategoryPage.js has vendorId: `product.vendor?.vendor_id` ✅
- [ ] React Native test: Add items → Checkout → Pay → Success ✅
- [ ] Check database: Order exists with correct status ✅

Once all checked ✅, you're done!

---

## Testing Timeline

1. **Curl Test** (1 min)
   - Verify backend responds with JSON
   
2. **Frontend Test** (2 min)
   - Add items, go to checkout, pay
   
3. **Database Check** (1 min)
   - Verify order created in database
   
4. **Navigation Check** (1 min)
   - Verify navigates to YourOrders

**Total: 5 minutes**

---

## Success Message You Should See

```
📤 Sending Order: {
  "items": [...],
  "pricing": {...},
  ...
}

Token: eyJhbGciOiJIUzI1NiIs...

URL: https://api.keeva.in/orders/create

Response Status: 201

📥 Response: {
  "ok": true,
  "message": "Order created successfully",
  "order": {...}
}

✅ Order placed successfully!
✅ Cart cleared
✅ Navigated to YourOrders
```

If you see this, everything works! 🎉
