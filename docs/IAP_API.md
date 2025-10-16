# IAP Communication Protocol (Web ↔ Native)

This document defines the complete communication protocol between the WebView (web application) and the Native layer for In-App Purchases.

## Overview

Communication happens via `postMessage` in both directions:
- **Web → Native:** WebView sends purchase requests
- **Native → Web:** Native sends subscription updates

---

## 📤 Web → Native Messages

Messages sent from web application to native app using:

```javascript
window.ReactNativeWebView.postMessage(JSON.stringify(message));
```

### 1. Purchase Product

**Trigger a product purchase**

```javascript
{
  "action": "purchase",
  "productId": "monthly_premium"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | Yes | Must be `"purchase"` |
| `productId` | string | Yes | Product identifier (from config) |

**Example:**
```javascript
// User clicks "Subscribe to Premium"
window.ReactNativeWebView.postMessage(JSON.stringify({
  action: 'purchase',
  productId: 'monthly_premium'
}));
```

**Native Response:**
- On success: `subscriptionUpdated` message
- On failure: `purchaseFailed` message

---

### 2. Restore Purchases

**Restore previous purchases (for users who reinstalled app)**

```javascript
{
  "action": "restorePurchases"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | Yes | Must be `"restorePurchases"` |

**Example:**
```javascript
// User clicks "Restore Purchases"
window.ReactNativeWebView.postMessage(JSON.stringify({
  action: 'restorePurchases'
}));
```

**Native Response:**
- On success: `purchasesRestored` message
- On failure: `purchaseFailed` message

---

### 3. Get Subscription Status

**Query current subscription status**

```javascript
{
  "action": "getSubscriptionStatus"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | Yes | Must be `"getSubscriptionStatus"` |

**Example:**
```javascript
// On page load, check if user is subscribed
window.ReactNativeWebView.postMessage(JSON.stringify({
  action: 'getSubscriptionStatus'
}));
```

**Native Response:**
- `subscriptionStatus` message with current status

---

### 4. Get Available Products

**Request list of available products with pricing**

```javascript
{
  "action": "getProducts"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | Yes | Must be `"getProducts"` |

**Example:**
```javascript
// Load pricing page
window.ReactNativeWebView.postMessage(JSON.stringify({
  action: 'getProducts'
}));
```

**Native Response:**
- `availableProducts` message with product list

---

## 📥 Native → Web Messages

Messages sent from native app to WebView using:

```javascript
webViewRef.current.postMessage(JSON.stringify(message));
```

Web receives them via:

```javascript
window.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  // Handle message
});

// Or in React:
useEffect(() => {
  const handleMessage = (event) => {
    const message = JSON.parse(event.data);
    // Handle message
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

---

### 1. Subscription Updated

**Sent after successful purchase or when subscription status changes**

```javascript
{
  "action": "subscriptionUpdated",
  "isSubscribed": true,
  "productId": "monthly_premium",
  "entitlements": ["premium"],
  "expirationDate": "2024-12-01T00:00:00Z"
}
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `action` | string | Always `"subscriptionUpdated"` |
| `isSubscribed` | boolean | User has active subscription |
| `productId` | string | Product identifier |
| `entitlements` | array | List of active entitlement IDs |
| `expirationDate` | string (ISO) | When subscription expires (null for lifetime) |

**Example Handling:**
```javascript
if (message.action === 'subscriptionUpdated') {
  if (message.isSubscribed) {
    // Show premium features
    enablePremiumFeatures();
    showThankYouMessage();
  }
}
```

---

### 2. Purchase Failed

**Sent when purchase fails or user cancels**

```javascript
{
  "action": "purchaseFailed",
  "productId": "monthly_premium",
  "error": "cancelled",
  "message": "Purchase was cancelled."
}
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `action` | string | Always `"purchaseFailed"` |
| `productId` | string | Product that failed |
| `error` | string | Error code: `"cancelled"`, `"failed"`, `"network"` |
| `message` | string | Human-readable error message |

**Error Codes:**
- `"cancelled"` - User cancelled the purchase
- `"failed"` - Purchase failed (payment issue, etc.)
- `"network"` - Network error
- `"unknown"` - Unknown error

**Example Handling:**
```javascript
if (message.action === 'purchaseFailed') {
  if (message.error === 'cancelled') {
    // User cancelled, no need to show error
    return;
  }

  // Show error message
  showError(message.message);
}
```

---

### 3. Purchases Restored

**Sent after successfully restoring purchases**

```javascript
{
  "action": "purchasesRestored",
  "isSubscribed": true,
  "entitlements": ["premium"],
  "expirationDate": "2024-12-01T00:00:00Z"
}
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `action` | string | Always `"purchasesRestored"` |
| `isSubscribed` | boolean | User has active subscription |
| `entitlements` | array | List of active entitlement IDs |
| `expirationDate` | string (ISO) | When subscription expires |

**Example Handling:**
```javascript
if (message.action === 'purchasesRestored') {
  if (message.isSubscribed) {
    showSuccessMessage('Purchases restored!');
    enablePremiumFeatures();
  } else {
    showInfoMessage('No active subscriptions found.');
  }
}
```

---

### 4. Subscription Status

**Sent in response to `getSubscriptionStatus` request**

```javascript
{
  "action": "subscriptionStatus",
  "isSubscribed": true,
  "entitlements": ["premium"],
  "expirationDate": "2024-12-01T00:00:00Z"
}
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `action` | string | Always `"subscriptionStatus"` |
| `isSubscribed` | boolean | User has active subscription |
| `entitlements` | array | List of active entitlement IDs |
| `expirationDate` | string (ISO) | When subscription expires |

**Example Handling:**
```javascript
// On page load
useEffect(() => {
  // Request status
  window.ReactNativeWebView.postMessage(JSON.stringify({
    action: 'getSubscriptionStatus'
  }));
}, []);

// Handle response
if (message.action === 'subscriptionStatus') {
  setIsSubscribed(message.isSubscribed);
  setEntitlements(message.entitlements);
}
```

---

### 5. Available Products

**Sent in response to `getProducts` request**

```javascript
{
  "action": "availableProducts",
  "products": [
    {
      "identifier": "monthly_premium",
      "title": "Premium Monthly",
      "description": "Premium access for 1 month",
      "price": 9.99,
      "priceString": "$9.99",
      "currencyCode": "USD",
      "packageType": "MONTHLY"
    },
    {
      "identifier": "yearly_premium",
      "title": "Premium Yearly",
      "description": "Premium access for 1 year",
      "price": 99.99,
      "priceString": "$99.99",
      "currencyCode": "USD",
      "packageType": "ANNUAL"
    }
  ]
}
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `action` | string | Always `"availableProducts"` |
| `products` | array | List of product objects |

**Product Object:**
| Field | Type | Description |
|-------|------|-------------|
| `identifier` | string | Product ID |
| `title` | string | Localized product title |
| `description` | string | Localized description |
| `price` | number | Price as number (e.g., 9.99) |
| `priceString` | string | Formatted price (e.g., "$9.99") |
| `currencyCode` | string | Currency code (e.g., "USD") |
| `packageType` | string | MONTHLY, ANNUAL, LIFETIME, etc. |

**Example Handling:**
```javascript
if (message.action === 'availableProducts') {
  const products = message.products;

  // Display products
  products.forEach(product => {
    console.log(`${product.title}: ${product.priceString}`);
  });

  // Render pricing UI
  setProducts(products);
}
```

---

## 🔄 Complete Flow Examples

### Example 1: User Purchases Subscription

```javascript
// 1. Web: User clicks subscribe button
function handleSubscribe() {
  window.ReactNativeWebView.postMessage(JSON.stringify({
    action: 'purchase',
    productId: 'monthly_premium'
  }));

  showLoading('Processing purchase...');
}

// 2. Native: Processes purchase, shows Apple/Google UI
// (handled automatically by iapService.js)

// 3. Web: Receives result
window.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);

  if (message.action === 'subscriptionUpdated') {
    hideLoading();
    showSuccess('Welcome to Premium!');
    enablePremiumFeatures();
  } else if (message.action === 'purchaseFailed') {
    hideLoading();
    if (message.error !== 'cancelled') {
      showError(message.message);
    }
  }
});
```

---

### Example 2: Load Pricing Page

```javascript
// 1. Web: Request products on page load
useEffect(() => {
  window.ReactNativeWebView.postMessage(JSON.stringify({
    action: 'getProducts'
  }));
}, []);

// 2. Web: Receive and display products
window.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);

  if (message.action === 'availableProducts') {
    const products = message.products;

    // Find monthly plan
    const monthlyPlan = products.find(p => p.identifier === 'monthly_premium');

    // Display price
    document.getElementById('monthly-price').textContent = monthlyPlan.priceString;
  }
});
```

---

### Example 3: Check Subscription on App Load

```javascript
// 1. Web: Request status when app loads
useEffect(() => {
  window.ReactNativeWebView.postMessage(JSON.stringify({
    action: 'getSubscriptionStatus'
  }));
}, []);

// 2. Web: Handle response
window.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);

  if (message.action === 'subscriptionStatus') {
    if (message.isSubscribed) {
      // User is subscribed
      setUserType('premium');
      enablePremiumFeatures();
    } else {
      // User is free
      setUserType('free');
      showUpgradePrompt();
    }
  }
});
```

---

## 🛡️ Security Considerations

### 1. Validate All Messages

```javascript
window.addEventListener('message', (event) => {
  try {
    const message = JSON.parse(event.data);

    // Validate message structure
    if (!message.action) {
      console.error('Invalid message: missing action');
      return;
    }

    // Handle message
    handleIAPMessage(message);
  } catch (error) {
    console.error('Failed to parse message:', error);
  }
});
```

### 2. Never Trust Client-Side Status Alone

```javascript
// ❌ DON'T: Trust only native message
if (message.isSubscribed) {
  grantPremiumAccess(); // Can be faked
}

// ✅ DO: Verify with backend
if (message.isSubscribed) {
  // Verify with backend
  const status = await fetch('/api/subscription/status');
  if (status.isSubscribed) {
    grantPremiumAccess(); // Safe
  }
}
```

### 3. Handle Missing ReactNativeWebView

```javascript
// Check if running in native app
function sendToNative(message) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  } else {
    console.warn('Not running in native app, IAP not available');
    // Fallback: redirect to web checkout
    window.location.href = '/subscribe';
  }
}
```

---

## 📚 Related Documentation

- [IN_APP_PURCHASES.md](./IN_APP_PURCHASES.md) - Complete IAP overview
- [BACKEND_IAP_ENDPOINTS.md](./BACKEND_IAP_ENDPOINTS.md) - Backend API
- [IAP_COMPLETE_GUIDE.md](./IAP_COMPLETE_GUIDE.md) - Setup guide

---

**Last Updated:** 2025-10-16
