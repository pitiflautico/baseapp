# Complete In-App Purchases Setup Guide

**Master guide for adding subscriptions and in-app purchases to your app using RevenueCat.**

This document walks you through the complete process from zero to production-ready IAP implementation.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Phase 1: Enable IAP in App](#phase-1-enable-iap-in-app)
3. [Phase 2: RevenueCat Setup](#phase-2-revenuecat-setup)
4. [Phase 3: iOS App Store Connect Setup](#phase-3-ios-app-store-connect-setup)
5. [Phase 4: Android Play Console Setup](#phase-4-android-play-console-setup)
6. [Phase 5: Backend Implementation](#phase-5-backend-implementation)
7. [Phase 6: Web Application Integration](#phase-6-web-application-integration)
8. [Phase 7: Testing](#phase-7-testing)
9. [Phase 8: Production Deployment](#phase-8-production-deployment)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- [ ] **Apple Developer Account** ($99/year) - for iOS
- [ ] **Google Play Developer Account** ($25 one-time) - for Android
- [ ] **RevenueCat Account** (free tier available) - [Sign up here](https://app.revenuecat.com)
- [ ] **Backend server** with public HTTPS endpoint (for webhooks)
- [ ] **Base app cloned** and working

**Estimated Time:** 4-6 hours for complete setup

---

## Phase 1: Enable IAP in App

### Step 1.1: Create Test Branch

```bash
cd baseapp/app-base

# Create branch for IAP work
git checkout -b feature/iap-integration

# Or create test project (alternative)
cd ..
cp -r app-base app-iap-test
cd app-iap-test
```

### Step 1.2: Enable IAP Feature Flag

Edit `src/config/config.js`:

```javascript
FEATURES: {
  PUSH_NOTIFICATIONS: true,
  SHARING: true,
  DEEP_LINKING: true,
  IN_APP_PURCHASES: true, // ✅ Change to true
}
```

### Step 1.3: Install Dependencies

```bash
# Install RevenueCat SDK
npm install react-native-purchases

# Rebuild native code
npx expo prebuild --clean

# iOS only: Install pods
cd ios && pod install && cd ..
```

### Step 1.4: Verify Installation

Run the app to ensure no errors:

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

**Expected:** App runs without errors (IAP not yet configured, but feature is enabled).

---

## Phase 2: RevenueCat Setup

### Step 2.1: Create RevenueCat Project

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Click **Create New Project**
3. Enter project name (e.g., "My App")
4. Click **Create**

### Step 2.2: Add iOS App

1. In your project, click **Apps**
2. Click **+ New App**
3. Select **Apple App Store**
4. Enter:
   - **App name:** My App iOS
   - **Bundle ID:** Your iOS bundle ID (e.g., `com.yourcompany.appname`)
5. Click **Save**

### Step 2.3: Configure iOS Shared Secret

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to **My Apps** → Your App → **App Information**
3. Scroll to **App-Specific Shared Secret**
4. Click **Generate** (or view if already generated)
5. Copy the shared secret
6. Go back to RevenueCat → Your iOS App → **Configuration**
7. Paste shared secret in **App-Specific Shared Secret** field
8. Click **Save**

### Step 2.4: Add Android App

1. RevenueCat Dashboard → **Apps** → **+ New App**
2. Select **Google Play Store**
3. Enter:
   - **App name:** My App Android
   - **Package name:** Your Android package (e.g., `com.yourcompany.appname`)
4. Click **Save**

### Step 2.5: Configure Google Service Credentials

1. Go to [Google Play Console](https://play.google.com/console)
2. Navigate to **Settings** → **API access**
3. Click **Create new service account**
4. Follow link to Google Cloud Console
5. Create service account with **Viewer** role
6. Create JSON key and download
7. Go back to Play Console
8. Grant **View financial data** permission
9. Upload JSON key to RevenueCat:
   - RevenueCat Dashboard → Android App → **Service Credentials**
   - Upload JSON file
   - Click **Save**

### Step 2.6: Get API Keys

1. RevenueCat Dashboard → **Project Settings** → **API Keys**
2. Copy:
   - **Apple API Key:** `appl_xxxxxxxxxxxxxxxxxxxxxx`
   - **Google API Key:** `goog_xxxxxxxxxxxxxxxxxxxxxx`

### Step 2.7: Configure API Keys in App

Edit `src/config/config.js`:

```javascript
IAP: {
  REVENUECAT_API_KEY_IOS: 'appl_xxxxxxxxxxxxxxxxxxxxxx', // Paste here
  REVENUECAT_API_KEY_ANDROID: 'goog_xxxxxxxxxxxxxxxxxxxxxx', // Paste here

  USER_ID_MODE: 'custom', // Use your user IDs

  // We'll add product IDs later
  SUBSCRIPTION_PRODUCTS: [],

  ENTITLEMENTS: {
    PREMIUM: 'premium',
  },
}
```

---

## Phase 3: iOS App Store Connect Setup

See [STORE_SETUP.md](./STORE_SETUP.md) for detailed instructions. Quick version:

### Step 3.1: Create In-App Purchase Products

1. [App Store Connect](https://appstoreconnect.apple.com) → **My Apps** → Your App
2. Click **In-App Purchases**
3. Click **+** to create new product
4. Select **Auto-Renewable Subscription**
5. Fill in:
   - **Reference Name:** Premium Monthly
   - **Product ID:** `monthly_premium` (important: lowercase, underscores)
   - **Subscription Group:** Premium Subscriptions (create new)
   - **Duration:** 1 month
   - **Price:** Select tier (e.g., $9.99)
6. Add localized information:
   - **Display Name:** Premium Monthly
   - **Description:** Get unlimited access to all premium features.
7. Configure free trial (optional):
   - Click **Set Up Offer** → **Introductory Offer**
   - Select **Free Trial** → **7 days**
8. Click **Save**
9. Click **Submit for Review**

**Repeat for other products** (e.g., yearly subscription).

### Step 3.2: Create Sandbox Test Account

1. App Store Connect → **Users and Access** → **Sandbox Testers**
2. Click **+**
3. Fill in details (can use fake email like `test@example.com`)
4. Click **Create**

---

## Phase 4: Android Play Console Setup

See [STORE_SETUP.md](./STORE_SETUP.md) for detailed instructions. Quick version:

### Step 4.1: Create Subscription Products

1. [Google Play Console](https://play.google.com/console) → Your App
2. **Monetize** → **Subscriptions**
3. Click **Create subscription**
4. Fill in:
   - **Product ID:** `monthly_premium` (MUST match iOS exactly)
   - **Name:** Premium Monthly
   - **Description:** Get unlimited access to all premium features.
   - **Billing period:** Every 1 month
   - **Price:** $9.99 USD
5. Configure free trial (optional):
   - Toggle **Offer free trial** → 7 days
6. Click **Save**
7. Click **Activate**

**Repeat for other products** (e.g., yearly subscription).

### Step 4.2: Set Up Internal Testing

1. **Testing** → **Internal testing**
2. Click **Create new release**
3. Upload APK/AAB:
   ```bash
   npx expo build:android
   ```
4. Add test users under **Testers** tab
5. Save and start rollout

---

## Phase 5: Backend Implementation

See [BACKEND_IAP_ENDPOINTS.md](./BACKEND_IAP_ENDPOINTS.md) for complete API spec.

### Step 5.1: Create Database Tables

```sql
-- User subscriptions table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE,
  product_id VARCHAR(255),
  status VARCHAR(50), -- active, cancelled, expired, grace_period
  entitlements JSONB,
  purchased_at TIMESTAMP,
  expires_at TIMESTAMP,
  will_renew BOOLEAN DEFAULT true,
  store VARCHAR(50), -- APP_STORE, PLAY_STORE
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscription events log (optional but recommended)
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(100),
  revenue_cat_event_id VARCHAR(255) UNIQUE,
  event_data JSONB,
  received_at TIMESTAMP DEFAULT NOW()
);
```

### Step 5.2: Implement Webhook Endpoint

```javascript
// Node.js/Express example
app.post('/api/webhooks/revenuecat', async (req, res) => {
  try {
    // 1. Validate webhook signature
    const authHeader = req.headers['authorization'];
    const expectedToken = process.env.REVENUECAT_WEBHOOK_TOKEN;

    if (!authHeader || authHeader.replace('Bearer ', '') !== expectedToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { event } = req.body;

    // 2. Check for duplicate events
    const existing = await db.subscription_events.findOne({
      revenue_cat_event_id: event.id
    });

    if (existing) {
      return res.json({ success: true, message: 'Already processed' });
    }

    // 3. Update user subscription
    await db.user_subscriptions.upsert({
      user_id: event.app_user_id,
      product_id: event.product_id,
      status: getStatusFromEventType(event.type),
      entitlements: event.entitlement_ids,
      purchased_at: new Date(event.purchased_at_ms),
      expires_at: event.expiration_at_ms ? new Date(event.expiration_at_ms) : null,
      store: event.store,
    });

    // 4. Log event
    await db.subscription_events.create({
      user_id: event.app_user_id,
      event_type: event.type,
      revenue_cat_event_id: event.id,
      event_data: event,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal error' });
  }
});
```

### Step 5.3: Implement Subscription Status Endpoint

```javascript
app.get('/api/users/:userId/subscription/status', authenticateUser, async (req, res) => {
  const { userId } = req.params;

  const subscription = await db.user_subscriptions.findOne({ user_id: userId });

  if (!subscription) {
    return res.json({ isSubscribed: false, subscription: null });
  }

  const isActive = subscription.expires_at && subscription.expires_at > new Date();

  res.json({
    isSubscribed: isActive,
    subscription: {
      productId: subscription.product_id,
      status: subscription.status,
      expiresAt: subscription.expires_at,
      entitlements: subscription.entitlements,
    },
  });
});
```

### Step 5.4: Configure Webhook in RevenueCat

1. RevenueCat Dashboard → **Project Settings** → **Integrations** → **Webhooks**
2. Click **+ Add Webhook**
3. Enter webhook URL: `https://your-api.com/api/webhooks/revenuecat`
4. Select events to receive (check all recommended)
5. Copy the **Authorization header** shown (e.g., `Bearer sk_xxx...`)
6. Save this as `REVENUECAT_WEBHOOK_TOKEN` environment variable
7. Click **Add Webhook**

**For local testing:** Use ngrok: `ngrok http 3000`

---

## Phase 6: Web Application Integration

See [IAP_API.md](./IAP_API.md) for complete protocol spec.

### Step 6.1: Create Subscription Page

```html
<!DOCTYPE html>
<html>
<head>
  <title>Subscribe to Premium</title>
</head>
<body>
  <h1>Premium Subscription</h1>

  <div id="subscription-status">
    <p>Loading...</p>
  </div>

  <div id="products">
    <!-- Products will be inserted here -->
  </div>

  <button onclick="restorePurchases()">Restore Purchases</button>

  <script src="subscription.js"></script>
</body>
</html>
```

### Step 6.2: Implement Subscription Logic

```javascript
// subscription.js

let currentStatus = null;

// Listen for messages from Native app
window.addEventListener('message', (event) => {
  try {
    const message = JSON.parse(event.data);
    handleNativeMessage(message);
  } catch (e) {
    console.error('Failed to parse message:', e);
  }
});

function handleNativeMessage(message) {
  console.log('Received from native:', message);

  switch (message.action) {
    case 'subscriptionStatus':
      updateSubscriptionStatus(message);
      break;

    case 'availableProducts':
      displayProducts(message.products);
      break;

    case 'subscriptionUpdated':
      showSuccess('Welcome to Premium!');
      updateSubscriptionStatus(message);
      break;

    case 'purchaseFailed':
      if (message.error !== 'cancelled') {
        showError(message.message);
      }
      break;

    case 'purchasesRestored':
      showSuccess('Purchases restored!');
      updateSubscriptionStatus(message);
      break;
  }
}

function updateSubscriptionStatus(status) {
  currentStatus = status;
  const statusDiv = document.getElementById('subscription-status');

  if (status.isSubscribed) {
    statusDiv.innerHTML = `
      <p>✅ You have Premium access</p>
      <p>Expires: ${new Date(status.expirationDate).toLocaleDateString()}</p>
    `;
  } else {
    statusDiv.innerHTML = '<p>You do not have an active subscription</p>';
  }
}

function displayProducts(products) {
  const productsDiv = document.getElementById('products');
  productsDiv.innerHTML = '';

  products.forEach(product => {
    const productEl = document.createElement('div');
    productEl.className = 'product-card';
    productEl.innerHTML = `
      <h3>${product.title}</h3>
      <p>${product.description}</p>
      <p class="price">${product.priceString}</p>
      <button onclick="purchaseProduct('${product.identifier}')">
        Subscribe
      </button>
    `;
    productsDiv.appendChild(productEl);
  });
}

function sendToNative(action, data = {}) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      action,
      ...data
    }));
  } else {
    console.warn('Not running in native app');
    // Fallback: redirect to web checkout
    window.location.href = '/subscribe';
  }
}

function purchaseProduct(productId) {
  sendToNative('purchase', { productId });
}

function restorePurchases() {
  sendToNative('restorePurchases');
}

// Request initial data on page load
setTimeout(() => {
  sendToNative('getSubscriptionStatus');
  sendToNative('getProducts');
}, 500);
```

### Step 6.3: Update Backend URLs in Config

Edit `src/config/config.js`:

```javascript
IAP: {
  // ... other config

  BACKEND_API: {
    BASE_URL: 'https://your-api.com',
    ENDPOINTS: {
      SYNC_SUBSCRIPTION: '/api/users/:userId/subscription/sync',
      GET_SUBSCRIPTION_STATUS: '/api/users/:userId/subscription/status',
      GET_PURCHASE_HISTORY: '/api/users/:userId/subscription/history',
    },
    WEBHOOK_URL: 'https://your-api.com/api/webhooks/revenuecat',
  },
}
```

---

## Phase 7: Testing

See [IAP_TESTING.md](./IAP_TESTING.md) for complete testing guide.

### Step 7.1: iOS Sandbox Testing

1. Sign out of App Store in Settings
2. Run app: `npx expo run:ios`
3. Navigate to subscription page
4. Attempt purchase
5. Sign in with sandbox tester when prompted
6. Verify purchase succeeds
7. Check subscription status updates
8. Test restore purchases

### Step 7.2: Android Internal Testing

1. Upload app to internal test track
2. Install from Play Store test link
3. Navigate to subscription page
4. Attempt purchase
5. Complete payment (no charge for license testers)
6. Verify purchase succeeds
7. Check subscription status updates
8. Test restore purchases

### Step 7.3: Verify Backend Integration

1. Make test purchase
2. Check RevenueCat Dashboard:
   - Go to **Customers**
   - Find your test user
   - Verify active subscription shown
3. Check your backend database:
   - Verify user_subscriptions record created
   - Verify subscription_events logged
4. Check webhook delivery:
   - RevenueCat → Integrations → Webhooks → Delivery Logs
   - Verify events delivered successfully

### Step 7.4: Test All Scenarios

- [x] New purchase
- [x] Restore purchases
- [x] Cancel subscription
- [x] Subscription expiration
- [x] Purchase cancellation (user backs out)
- [x] Network error handling
- [x] Invalid product handling

---

## Phase 8: Production Deployment

### Step 8.1: Replace Test Keys

Edit `src/config/config.js`:

```javascript
IAP: {
  // Replace with production keys
  REVENUECAT_API_KEY_IOS: 'appl_PRODUCTION_KEY_HERE',
  REVENUECAT_API_KEY_ANDROID: 'goog_PRODUCTION_KEY_HERE',

  // Add production product IDs
  SUBSCRIPTION_PRODUCTS: [
    'monthly_premium',
    'yearly_premium',
  ],

  // Update backend URLs
  BACKEND_API: {
    BASE_URL: 'https://api.yourapp.com', // Production URL
    WEBHOOK_URL: 'https://api.yourapp.com/api/webhooks/revenuecat',
  },
}
```

### Step 8.2: Build Production Apps

```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

### Step 8.3: Final Verification

**iOS:**
- [ ] Products approved in App Store Connect
- [ ] App submitted with correct bundle ID
- [ ] In-App Purchases capability enabled
- [ ] Tested with TestFlight (production mode)

**Android:**
- [ ] Products active in Play Console
- [ ] App uploaded to production track
- [ ] Billing permission in manifest
- [ ] Tested with closed beta

**Backend:**
- [ ] Production webhook URL configured in RevenueCat
- [ ] Webhook signature validation working
- [ ] Database tables created
- [ ] API endpoints responding correctly

### Step 8.4: Monitor After Launch

1. **RevenueCat Dashboard:**
   - Monitor active subscriptions
   - Check for errors or failed purchases
   - Review conversion rates

2. **Backend Logs:**
   - Monitor webhook delivery
   - Check for processing errors
   - Verify subscription syncs

3. **User Feedback:**
   - Watch for subscription issues
   - Monitor support tickets
   - Track refund requests

---

## Troubleshooting

### Products Not Loading

**Symptoms:** App shows "No products available"

**Checks:**
1. Verify API keys are correct in config.js
2. Check products exist in RevenueCat dashboard
3. Ensure offering is set as "Current"
4. Verify products approved (iOS) or active (Android)
5. Check product IDs match exactly everywhere

**Solution:**
```javascript
// Enable debug logging
import Purchases from 'react-native-purchases';
Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
```

### Purchase Fails Silently

**Symptoms:** User attempts purchase but nothing happens

**Checks:**
1. Check console logs for errors
2. Verify user is authenticated (if using custom user IDs)
3. Ensure network connection available
4. Check RevenueCat dashboard for error events

### Webhook Not Received

**Symptoms:** Purchase succeeds but backend not updated

**Checks:**
1. Verify webhook URL is correct and publicly accessible
2. Check webhook signature validation logic
3. Review RevenueCat webhook delivery logs
4. Ensure endpoint returns 200 OK quickly

**Solution:**
```bash
# Use ngrok for testing
ngrok http 3000

# Update webhook URL in RevenueCat to ngrok URL
```

### Subscription Status Out of Sync

**Symptoms:** App shows subscribed but backend doesn't

**Checks:**
1. Verify webhook events being received
2. Check database update logic
3. Ensure event deduplication working
4. Review RevenueCat customer info

**Solution:** Implement sync endpoint and call periodically:
```javascript
await iapService.syncWithBackend();
```

---

## 📚 Complete Documentation Index

- **[IN_APP_PURCHASES.md](./IN_APP_PURCHASES.md)** - System overview and architecture
- **[IAP_API.md](./IAP_API.md)** - Web ↔ Native communication protocol
- **[BACKEND_IAP_ENDPOINTS.md](./BACKEND_IAP_ENDPOINTS.md)** - Backend API implementation
- **[IAP_WEBHOOKS.md](./IAP_WEBHOOKS.md)** - Webhook configuration and validation
- **[STORE_SETUP.md](./STORE_SETUP.md)** - Store configuration guide
- **[IAP_TESTING.md](./IAP_TESTING.md)** - Testing procedures

---

## ✅ Final Checklist

### Pre-Launch
- [ ] IAP feature enabled in config
- [ ] react-native-purchases installed
- [ ] RevenueCat project created
- [ ] iOS products created and approved
- [ ] Android products created and activated
- [ ] Products configured in RevenueCat
- [ ] API keys added to config
- [ ] Backend endpoints implemented
- [ ] Webhook configured and tested
- [ ] Web application integrated
- [ ] Sandbox testing completed (iOS)
- [ ] Internal testing completed (Android)
- [ ] All documentation reviewed

### Post-Launch
- [ ] Monitor RevenueCat dashboard daily
- [ ] Review webhook delivery logs
- [ ] Check backend error logs
- [ ] Respond to user feedback
- [ ] Track key metrics (conversions, refunds, churn)

---

## 🎉 Congratulations!

You now have a fully functional In-App Purchase system with:
- ✅ Cross-platform subscriptions (iOS + Android)
- ✅ Server-side receipt validation
- ✅ Automatic renewal handling
- ✅ Web ↔ Native integration
- ✅ Backend synchronization
- ✅ Production-ready code

**Revenue Cat Test Key:** `test_NpIFfDEYscPbGSqdbUBlopzMVaa`

---

**Last Updated:** 2025-10-16
