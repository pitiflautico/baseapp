# In-App Purchases (IAP) with RevenueCat

Complete overview of the In-App Purchases system implemented in this base app.

## Overview

This app uses **RevenueCat** to handle subscriptions and in-app purchases across iOS and Android. RevenueCat provides:

- ✅ Unified API for Apple App Store and Google Play
- ✅ Server-side receipt validation
- ✅ Webhook events for subscription changes
- ✅ Customer management and analytics
- ✅ Easy product configuration

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     COMPLETE FLOW                            │
└─────────────────────────────────────────────────────────────┘

1. User taps "Subscribe" in WebView
   └─→ WebView sends postMessage to Native

2. Native app calls RevenueCat SDK
   └─→ RevenueCat shows Apple/Google payment UI

3. User completes purchase
   └─→ Apple/Google processes payment

4. RevenueCat receives receipt
   └─→ Validates with Apple/Google servers
   └─→ Sends webhook to your backend

5. Native app receives confirmation
   └─→ Updates local state
   └─→ Sends postMessage to WebView
   └─→ Syncs with backend API

6. WebView updates UI
   └─→ Shows premium features

7. Backend processes webhook
   └─→ Updates database
   └─→ Grants premium access
```

---

## 📁 Project Structure

```
app-base/
├── src/
│   ├── config/
│   │   └── config.js                    # IAP configuration
│   ├── services/
│   │   └── iapService.js                # RevenueCat SDK integration
│   ├── contexts/
│   │   └── SubscriptionContext.js       # Global subscription state
│   ├── features/
│   │   └── purchaseHandler.js           # Purchase event handlers
│   └── screens/
│       └── WebViewScreen.js             # WebView with IAP messaging
├── docs/
│   ├── BACKEND_IAP_ENDPOINTS.md         # Backend API spec
│   ├── IAP_WEBHOOKS.md                  # Webhook configuration
│   ├── STORE_SETUP.md                   # Store configuration
│   ├── IAP_API.md                       # Web↔Native protocol
│   ├── IAP_TESTING.md                   # Testing guide
│   └── IAP_COMPLETE_GUIDE.md            # Master guide
└── app.config.js                        # RevenueCat plugin config
```

---

## 🔧 Components

### 1. Configuration (`config.js`)

Central configuration for all IAP settings:

```javascript
FEATURES: {
  IN_APP_PURCHASES: false, // Set to true to enable
}

IAP: {
  REVENUECAT_API_KEY_IOS: 'appl_xxxxx',
  REVENUECAT_API_KEY_ANDROID: 'goog_xxxxx',

  SUBSCRIPTION_PRODUCTS: [
    'monthly_premium',
    'yearly_premium',
  ],

  ENTITLEMENTS: {
    PREMIUM: 'premium',
  },

  BACKEND_API: {
    BASE_URL: 'https://api.yourapp.com',
    ENDPOINTS: {
      SYNC_SUBSCRIPTION: '/api/users/:userId/subscription/sync',
      GET_SUBSCRIPTION_STATUS: '/api/users/:userId/subscription/status',
    },
    WEBHOOK_URL: 'https://api.yourapp.com/api/webhooks/revenuecat',
  },
}
```

### 2. IAP Service (`iapService.js`)

Wrapper around RevenueCat SDK:

**Key Functions:**
- `initializeIAP(userId)` - Initialize RevenueCat
- `getAvailableProducts()` - Get products from offering
- `purchaseProduct(productId)` - Make purchase
- `restorePurchases()` - Restore previous purchases
- `getSubscriptionStatus()` - Check active subscription
- `checkEntitlements(entitlementId)` - Check specific entitlement
- `syncWithBackend()` - Sync status with backend

**Conditional Loading:**
- If `FEATURES.IN_APP_PURCHASES = false`, exports dummy functions
- Zero traces of IAP code in build when disabled

### 3. Subscription Context (`SubscriptionContext.js`)

React Context providing global subscription state:

```javascript
const {
  isSubscribed,      // boolean: User has active subscription
  isLoading,         // boolean: Loading state
  subscriptionStatus, // object: Full subscription info
  availableProducts, // array: Products from RevenueCat
  purchaseProduct,   // function: Purchase a product
  restorePurchases,  // function: Restore purchases
  refreshStatus,     // function: Refresh status from RevenueCat
  hasEntitlement,    // function: Check specific entitlement
} = useSubscription();
```

### 4. Purchase Handler (`purchaseHandler.js`)

Handles purchase events and WebView communication:

**Functions:**
- `onPurchaseSuccess()` - Handle successful purchase
- `onPurchaseFailure()` - Handle failed purchase
- `onPurchaseRestored()` - Handle restored purchases
- `syncSubscriptionStatus()` - Send status to WebView
- `sendAvailableProducts()` - Send products to WebView

---

## 🔄 Communication Flow

### Web → Native Messages

WebView can send these messages to native:

```javascript
// Purchase a product
window.ReactNativeWebView.postMessage(JSON.stringify({
  action: 'purchase',
  productId: 'monthly_premium'
}));

// Restore purchases
window.ReactNativeWebView.postMessage(JSON.stringify({
  action: 'restorePurchases'
}));

// Get subscription status
window.ReactNativeWebView.postMessage(JSON.stringify({
  action: 'getSubscriptionStatus'
}));

// Get available products
window.ReactNativeWebView.postMessage(JSON.stringify({
  action: 'getProducts'
}));
```

### Native → Web Messages

Native sends these messages to WebView:

```javascript
// Subscription updated (after purchase or restore)
{
  action: 'subscriptionUpdated',
  isSubscribed: true,
  productId: 'monthly_premium',
  entitlements: ['premium'],
  expirationDate: '2024-12-01T00:00:00Z'
}

// Purchase failed
{
  action: 'purchaseFailed',
  productId: 'monthly_premium',
  error: 'cancelled', // or 'failed'
  message: 'Purchase was cancelled.'
}

// Purchases restored
{
  action: 'purchasesRestored',
  isSubscribed: true,
  entitlements: ['premium'],
  expirationDate: '2024-12-01T00:00:00Z'
}

// Current subscription status
{
  action: 'subscriptionStatus',
  isSubscribed: true,
  entitlements: ['premium'],
  expirationDate: '2024-12-01T00:00:00Z'
}

// Available products
{
  action: 'availableProducts',
  products: [
    {
      identifier: 'monthly_premium',
      title: 'Premium Monthly',
      description: 'Premium access for 1 month',
      price: 9.99,
      priceString: '$9.99',
      currencyCode: 'USD'
    }
  ]
}
```

See [IAP_API.md](./IAP_API.md) for complete API specification.

---

## 💾 Data Storage

### Local Storage (SecureStore)

Subscription data is cached locally:

```javascript
// Storage keys (from config.js)
IAP.STORAGE_KEYS = {
  SUBSCRIPTION_STATUS: 'iap_subscription_status',
  CUSTOMER_INFO: 'iap_customer_info',
  ACTIVE_ENTITLEMENTS: 'iap_active_entitlements',
  LAST_SYNC: 'iap_last_sync',
}
```

### Backend Database

Your backend should store:
- User subscription status
- Active entitlements
- Purchase history
- Webhook events (for audit trail)

See [BACKEND_IAP_ENDPOINTS.md](./BACKEND_IAP_ENDPOINTS.md) for database schema.

---

## 🔐 Security

### Receipt Validation

RevenueCat handles all receipt validation:
1. User makes purchase
2. Apple/Google sends receipt to device
3. RevenueCat SDK sends receipt to RevenueCat servers
4. RevenueCat validates with Apple/Google
5. RevenueCat confirms to app and sends webhook

**You never handle receipts directly** - RevenueCat does it all.

### Backend Validation

Your backend receives webhook events with validated data:
- Event signature validated (see IAP_WEBHOOKS.md)
- Subscription status is source of truth
- Frontend cannot fake subscription status

### Zero-Trust Architecture

```javascript
// ❌ NEVER trust client-side subscription status alone
if (user.isSubscribed) { // Client says they're subscribed
  // DON'T give access based on this
}

// ✅ ALWAYS verify with backend
const status = await backend.getSubscriptionStatus(userId);
if (status.isSubscribed) {
  // Safe to give access
}
```

---

## 🌍 Multi-Platform Support

### iOS (Apple App Store)

- Uses StoreKit framework
- RevenueCat handles all StoreKit complexity
- Supports:
  - Auto-renewable subscriptions
  - Non-consumable purchases (lifetime)
  - Promotional offers
  - Intro offers (free trial)

### Android (Google Play)

- Uses Google Play Billing Library
- RevenueCat handles all complexity
- Supports:
  - Auto-renewable subscriptions
  - One-time purchases
  - Promotional offers
  - Free trials

### Same Code, Both Platforms

```javascript
// This works on both iOS and Android
const result = await iapService.purchaseProduct('monthly_premium');
```

---

## 📊 Subscription Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│                  SUBSCRIPTION STATES                     │
└─────────────────────────────────────────────────────────┘

Trial → Active → Cancelled → Expired
  ↓       ↓         ↓           ↓
  └───────┴─────────┴───────────┴→ Renewed

States:
• trial       - In trial period
• active      - Subscription is active
• cancelled   - Cancelled but still active until expiry
• expired     - Subscription has expired
• grace       - Payment failed, in grace period
```

### Event Flow

1. **INITIAL_PURCHASE** - User subscribes
2. **RENEWAL** - Auto-renewal successful
3. **CANCELLATION** - User cancels (still active)
4. **UNCANCELLATION** - User re-enables auto-renew
5. **EXPIRATION** - Subscription expires
6. **BILLING_ISSUE** - Payment fails

---

## 🎯 Product Types

### Auto-Renewable Subscriptions

**Monthly:**
```javascript
SUBSCRIPTION_PRODUCTS: ['monthly_premium']
```

**Yearly:**
```javascript
SUBSCRIPTION_PRODUCTS: ['yearly_premium']
```

### One-Time Purchases

**Lifetime access:**
```javascript
ONE_TIME_PRODUCTS: ['lifetime_access']
```

### Consumables

**Credits/Coins (can purchase multiple times):**
```javascript
CONSUMABLE_PRODUCTS: ['100_coins', '500_coins']
```

---

## 🧪 Testing

### Development Mode

Use test key for development:
```javascript
REVENUECAT_API_KEY_IOS: 'test_NpIFfDEYscPbGSqdbUBlopzMVaa'
```

This key:
- ✅ Works in sandbox mode
- ✅ No charges
- ✅ Can test all features

### Sandbox Testing

**iOS:**
1. Create sandbox tester in App Store Connect
2. Sign out of App Store on device
3. Make purchase in app
4. Sign in with sandbox account when prompted

**Android:**
1. Upload app to Play Console (internal test track)
2. Add test users
3. Install from Play Store
4. Purchases are auto-cancelled after 5 minutes

See [IAP_TESTING.md](./IAP_TESTING.md) for complete testing guide.

---

## 💰 Pricing

### RevenueCat Costs

**Free Tier:**
- Up to $2,500 USD/month in tracked revenue
- Unlimited apps
- All core features

**Growth:**
- 1% of tracked revenue over $2,500/month
- Advanced features (Experiments, Customer Lists)

### Store Commissions

**Apple:**
- 30% first year
- 15% subsequent years
- 15% for small business (<$1M/year)

**Google:**
- 30% first year
- 15% subsequent years
- 15% for first $1M/year

---

## 📚 Related Documentation

- **[BACKEND_IAP_ENDPOINTS.md](./BACKEND_IAP_ENDPOINTS.md)** - Backend API implementation
- **[IAP_WEBHOOKS.md](./IAP_WEBHOOKS.md)** - Webhook setup and validation
- **[STORE_SETUP.md](./STORE_SETUP.md)** - Configure products in stores
- **[IAP_API.md](./IAP_API.md)** - Web↔Native communication protocol
- **[IAP_TESTING.md](./IAP_TESTING.md)** - Testing with sandbox
- **[IAP_COMPLETE_GUIDE.md](./IAP_COMPLETE_GUIDE.md)** - Step-by-step setup guide

---

## 🚀 Quick Start

1. **Enable IAP:**
   ```javascript
   // src/config/config.js
   FEATURES.IN_APP_PURCHASES = true
   ```

2. **Install dependency:**
   ```bash
   npm install react-native-purchases
   ```

3. **Configure RevenueCat:**
   - Add API keys to config.js
   - Create products in RevenueCat dashboard

4. **Configure stores:**
   - See STORE_SETUP.md

5. **Implement backend:**
   - See BACKEND_IAP_ENDPOINTS.md

6. **Test:**
   - See IAP_TESTING.md

---

**Last Updated:** 2025-10-16
