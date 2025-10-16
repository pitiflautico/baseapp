# IAP Testing Guide

Complete guide for testing In-App Purchases in sandbox/test environments before going to production.

## Overview

Both Apple and Google provide sandbox environments where you can test purchases without real charges. This guide covers:
- iOS Sandbox testing
- Android Internal Testing
- Testing with the test key provided
- Common testing scenarios
- Troubleshooting

---

## 🧪 Test Environment Setup

### RevenueCat Test Key

**Test Key Provided:** `test_NpIFfDEYscPbGSqdbUBlopzMVaa`

This key can be used for initial development and testing in both iOS and Android sandbox environments.

**To use in your test branch:**

```javascript
// src/config/config.js (in test branch only)
IAP: {
  REVENUECAT_API_KEY_IOS: 'test_NpIFfDEYscPbGSqdbUBlopzMVaa',
  REVENUECAT_API_KEY_ANDROID: 'test_NpIFfDEYscPbGSqdbUBlopzMVaa',

  SUBSCRIPTION_PRODUCTS: [
    'monthly_premium', // Add your test product IDs
  ],

  ENTITLEMENTS: {
    PREMIUM: 'premium',
  },
}
```

**Important:** Replace with your production keys before app store submission.

---

## 🍎 iOS Sandbox Testing

### Step 1: Create Sandbox Test Account

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to **Users and Access**
3. Click **Sandbox Testers** in the left sidebar
4. Click the **+** button
5. Fill in details:
   - **Email:** Can be fake (e.g., `test1@example.com`)
   - **Password:** Choose a memorable password
   - **Region:** Select your country
   - **App Store Territory:** Same as region
6. Click **Create**

**Tip:** Create multiple sandbox accounts for testing different scenarios.

### Step 2: Prepare Test Device

**On your iPhone/iPad:**
1. Open **Settings** → **App Store**
2. Tap your Apple ID at the top
3. Select **Sign Out**
4. **Do NOT sign in with sandbox account yet**

**Important:** Never sign in to sandbox account in Settings. Only use it when prompted during purchase.

### Step 3: Run App in Development Mode

```bash
# Start development build
npx expo start

# Choose iOS simulator or device
# Press 'i' for iOS simulator
# Or scan QR code on physical device
```

### Step 4: Test Purchase Flow

1. In your app, navigate to subscription page
2. Click "Subscribe to Premium"
3. Apple payment sheet appears
4. When prompted to sign in, use your **sandbox tester credentials**
5. Complete purchase
6. Verify subscription is activated

**Expected Behavior:**
- Payment succeeds immediately
- No real charge occurs
- App receives subscription confirmation
- Premium features are unlocked

### Step 5: Verify Subscription Status

```javascript
// In your app or WebView
window.ReactNativeWebView.postMessage(JSON.stringify({
  action: 'getSubscriptionStatus'
}));

// Should receive:
{
  action: 'subscriptionStatus',
  isSubscribed: true,
  entitlements: ['premium'],
  expirationDate: '...'
}
```

### iOS Sandbox Behaviors

**Auto-Renewal Timing:**
| Actual Duration | Sandbox Duration |
|-----------------|------------------|
| 1 week | 3 minutes |
| 1 month | 5 minutes |
| 2 months | 10 minutes |
| 3 months | 15 minutes |
| 6 months | 30 minutes |
| 1 year | 1 hour |

**Important:** Subscriptions auto-renew up to 6 times in sandbox, then expire.

**Cancellation:**
1. Settings → Apple ID → Subscriptions
2. Find your test subscription
3. Tap **Cancel Subscription**
4. Subscription remains active until expiration

---

## 🤖 Android Internal Testing

### Step 1: Create Internal Test Release

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Navigate to **Testing** → **Internal testing**
4. Click **Create new release**
5. Upload your APK or AAB:
   ```bash
   # Build Android app bundle
   npx expo build:android -t app-bundle

   # Or generate APK
   npx expo build:android -t apk
   ```
6. Complete release form
7. Click **Save** and **Review release**
8. Click **Start rollout to Internal testing**

### Step 2: Add Test Users

1. In Internal testing page, click **Testers** tab
2. Click **Create email list**
3. Enter list name (e.g., "IAP Testers")
4. Add email addresses of testers (use real Gmail addresses)
5. Click **Save**

### Step 3: Enable License Testing

1. Go to **Setup** → **License testing**
2. Add tester email addresses
3. Select **License response:** Licensed
4. Click **Save changes**

**Note:** This allows testers to make purchases without charges.

### Step 4: Share Test Link

1. Go back to **Internal testing**
2. Copy the "Copy link" button URL
3. Send to testers
4. Testers must:
   - Open link in browser
   - Sign in with their Gmail account
   - Click "Become a tester"
   - Install app from Play Store

### Step 5: Test Purchase Flow

1. Open app (installed from internal test track)
2. Navigate to subscription page
3. Click "Subscribe to Premium"
4. Google payment sheet appears
5. Complete purchase (no real charge for license testers)
6. Verify subscription activated

**Expected Behavior:**
- Purchase completes successfully
- No real charge occurs for license testers
- Receipt is validated by RevenueCat
- App receives subscription confirmation

### Android Testing Behaviors

**Auto-Renewal Timing:**
Subscriptions in test track renew at normal intervals but are automatically refunded.

**Cancellation:**
1. Open Play Store
2. Tap profile icon → **Payments & subscriptions** → **Subscriptions**
3. Find test subscription
4. Tap **Cancel subscription**

---

## 🧩 Testing Scenarios

### Scenario 1: New Subscription Purchase

**Test Flow:**
1. App opens → User not subscribed
2. Click "Subscribe to Premium"
3. Complete purchase
4. Verify premium features unlock

**Expected Messages:**
```javascript
// Native → Web
{
  action: 'subscriptionUpdated',
  isSubscribed: true,
  productId: 'monthly_premium',
  entitlements: ['premium'],
  expirationDate: '...'
}
```

### Scenario 2: Restore Purchases

**Test Flow:**
1. Make purchase on device A
2. Uninstall app
3. Reinstall on device B (same account)
4. Click "Restore Purchases"
5. Verify subscription restored

**Expected Messages:**
```javascript
// Native → Web
{
  action: 'purchasesRestored',
  isSubscribed: true,
  entitlements: ['premium'],
  expirationDate: '...'
}
```

### Scenario 3: Subscription Expiration

**iOS Sandbox:** Wait ~30 minutes (6 renewals × 5 minutes)
**Android:** Cancel subscription and wait for current period to end

**Expected Behavior:**
- Subscription status changes to expired
- Premium features are locked
- RevenueCat webhook sends EXPIRATION event

### Scenario 4: Purchase Cancellation

**Test Flow:**
1. Start purchase flow
2. Tap outside payment sheet (iOS) or press back (Android)
3. Purchase is cancelled

**Expected Messages:**
```javascript
// Native → Web
{
  action: 'purchaseFailed',
  productId: 'monthly_premium',
  error: 'cancelled',
  message: 'Purchase was cancelled.'
}
```

### Scenario 5: Network Error

**Test Flow:**
1. Enable airplane mode
2. Attempt purchase
3. Should fail gracefully

**Expected Messages:**
```javascript
// Native → Web
{
  action: 'purchaseFailed',
  productId: 'monthly_premium',
  error: 'network',
  message: 'Network error. Please check your connection.'
}
```

### Scenario 6: Product Not Available

**Test Flow:**
1. Request purchase of non-existent product ID
2. Should fail with clear error

**Expected Messages:**
```javascript
// Native → Web
{
  action: 'purchaseFailed',
  productId: 'nonexistent_product',
  error: 'failed',
  message: 'This product is currently unavailable.'
}
```

---

## 🌐 Testing Web ↔ Native Communication

### Create Test HTML Page

```html
<!DOCTYPE html>
<html>
<head>
  <title>IAP Test Page</title>
  <style>
    body { font-family: Arial; padding: 20px; }
    button { padding: 10px 20px; margin: 5px; font-size: 16px; }
    .status { padding: 10px; background: #f0f0f0; margin: 10px 0; }
    .success { background: #d4edda; color: #155724; }
    .error { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <h1>IAP Testing Interface</h1>

  <div id="status" class="status">Status: Waiting...</div>

  <h2>Actions</h2>
  <button onclick="getProducts()">Get Products</button>
  <button onclick="getStatus()">Get Subscription Status</button>
  <button onclick="purchaseMonthly()">Purchase Monthly</button>
  <button onclick="restorePurchases()">Restore Purchases</button>

  <h2>Messages Received</h2>
  <div id="messages"></div>

  <script>
    // Listen for messages from Native
    window.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received:', message);

        const messagesDiv = document.getElementById('messages');
        const messageEl = document.createElement('div');
        messageEl.className = 'status';
        messageEl.textContent = JSON.stringify(message, null, 2);
        messagesDiv.insertBefore(messageEl, messagesDiv.firstChild);

        // Handle specific actions
        if (message.action === 'subscriptionUpdated') {
          showStatus('✅ Subscription Active!', 'success');
        } else if (message.action === 'purchaseFailed') {
          showStatus('❌ Purchase Failed: ' + message.message, 'error');
        } else if (message.action === 'availableProducts') {
          showStatus('📦 Products: ' + message.products.length, 'success');
        }
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    });

    function sendToNative(action, data = {}) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          action,
          ...data
        }));
        showStatus('Sent: ' + action, '');
      } else {
        showStatus('❌ Not running in native app', 'error');
      }
    }

    function showStatus(text, className) {
      const statusDiv = document.getElementById('status');
      statusDiv.textContent = text;
      statusDiv.className = 'status ' + className;
    }

    function getProducts() {
      sendToNative('getProducts');
    }

    function getStatus() {
      sendToNative('getSubscriptionStatus');
    }

    function purchaseMonthly() {
      sendToNative('purchase', { productId: 'monthly_premium' });
    }

    function restorePurchases() {
      sendToNative('restorePurchases');
    }

    // Auto-request status on load
    setTimeout(() => {
      getStatus();
      getProducts();
    }, 1000);
  </script>
</body>
</html>
```

**To use:**
1. Host this HTML file on local server (e.g., `http://localhost:8000/iap-test.html`)
2. Update `WEB_URL` in config.js to point to this page
3. Run app and test IAP functionality

---

## 🔍 Debugging Tools

### Enable Debug Logging

```javascript
// src/services/iapService.js
import Purchases from 'react-native-purchases';

// Enable debug logs
if (__DEV__) {
  Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
}
```

### Check RevenueCat Dashboard

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Navigate to **Customers**
3. Search for your test user ID
4. View:
   - Active subscriptions
   - Purchase history
   - Entitlements
   - Events timeline

### Monitor Webhook Events

1. RevenueCat Dashboard → **Integrations** → **Webhooks**
2. Click your webhook
3. View **Delivery Logs**
4. Check for failed deliveries or errors

### React Native Debugger

```bash
# Open debugger
react-devtools
```

Monitor console logs for:
- IAP service initialization
- Product fetch results
- Purchase attempts
- Subscription updates

---

## ⚠️ Common Testing Issues

### Issue: "Cannot connect to iTunes Store"

**Cause:** Not properly signed out of production App Store

**Solution:**
1. Settings → App Store → Sign Out completely
2. Restart device
3. Do NOT sign in to Settings
4. Only sign in when prompted during purchase

### Issue: "No products available"

**Cause:** Products not configured or API key incorrect

**Solution:**
1. Verify products exist in RevenueCat dashboard
2. Check API key is correct in config.js
3. Ensure products are approved (iOS)
4. Check offering is set as "Current"

### Issue: "Product already purchased"

**iOS Solution:**
- Sandbox subscriptions expire after 6 renewals
- Wait for expiration or use different sandbox account

**Android Solution:**
- Go to Play Store → Subscriptions → Cancel
- Or use different test account

### Issue: "Invalid product identifier"

**Cause:** Product ID mismatch

**Solution:**
- Verify Product IDs match exactly in:
  - App Store Connect / Play Console
  - RevenueCat dashboard
  - config.js

### Issue: Webhook not received

**Cause:** URL not publicly accessible

**Solution:**
- Use ngrok for local testing: `ngrok http 3000`
- Update webhook URL in RevenueCat dashboard
- Verify endpoint returns 200 OK

---

## ✅ Pre-Production Checklist

Before submitting to App Store / Play Store:

### Configuration
- [ ] Replace test API keys with production keys
- [ ] Remove test product IDs
- [ ] Add production product IDs
- [ ] Configure production webhook URL
- [ ] Disable debug logging

### iOS
- [ ] Products approved in App Store Connect
- [ ] Tested with sandbox account
- [ ] Tested with TestFlight (production mode)
- [ ] Restore purchases works
- [ ] Subscription auto-renewal works

### Android
- [ ] Products active in Play Console
- [ ] Tested with internal test track
- [ ] Tested with closed testing (production mode)
- [ ] Restore purchases works
- [ ] Subscription auto-renewal works

### Backend
- [ ] Webhook endpoint live and responding
- [ ] Webhook signature validation working
- [ ] Database schema created
- [ ] Subscription sync endpoint working
- [ ] Get status endpoint working

### RevenueCat
- [ ] Production API keys configured
- [ ] Products added to dashboard
- [ ] Offering set as current
- [ ] Webhook configured with production URL
- [ ] Tested end-to-end flow

---

## 📚 Related Documentation

- [STORE_SETUP.md](./STORE_SETUP.md) - Configure products in stores
- [IAP_COMPLETE_GUIDE.md](./IAP_COMPLETE_GUIDE.md) - Master setup guide
- [IAP_WEBHOOKS.md](./IAP_WEBHOOKS.md) - Webhook configuration

---

## 🔗 Useful Resources

**Apple:**
- [Sandbox Testing Guide](https://developer.apple.com/documentation/storekit/in-app_purchase/testing_in-app_purchases_with_sandbox)
- [TestFlight Documentation](https://developer.apple.com/testflight/)

**Google:**
- [Test Purchases](https://developer.android.com/google/play/billing/test)
- [Internal Testing Guide](https://support.google.com/googleplay/android-developer/answer/9845334)

**RevenueCat:**
- [Testing Guide](https://docs.revenuecat.com/docs/test-and-launch)
- [Debugging](https://docs.revenuecat.com/docs/debugging)

---

**Last Updated:** 2025-10-16
