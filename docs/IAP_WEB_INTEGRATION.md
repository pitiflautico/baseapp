# In-App Purchases - Web Integration Guide

This guide explains how to integrate In-App Purchases in your web application that runs inside the React Native WebView.

## Table of Contents

1. [Overview](#overview)
2. [Communication Protocol](#communication-protocol)
3. [Sending Messages to Native](#sending-messages-to-native)
4. [Receiving Messages from Native](#receiving-messages-from-native)
5. [Complete Implementation Example](#complete-implementation-example)
6. [UI/UX Best Practices](#uiux-best-practices)

---

## Overview

The IAP system uses **bidirectional communication** between your web app and the native layer:

```
┌─────────────────┐                    ┌──────────────────┐
│                 │   postMessage()    │                  │
│   Web App       │──────────────────>│   Native App     │
│  (JavaScript)   │                    │  (React Native)  │
│                 │<──────────────────│                  │
│                 │  window.message    │                  │
└─────────────────┘                    └──────────────────┘
```

- **Web → Native**: Your web app sends action requests using `window.ReactNativeWebView.postMessage()`
- **Native → Web**: Native app sends responses using `window.postMessage()`

---

## Communication Protocol

### Message Format

All messages are JSON strings with an `action` property:

```javascript
{
  "action": "actionName",
  // ... additional properties
}
```

---

## Sending Messages to Native

### 1. Get Available Products

Request the list of available subscription products.

**Request:**
```javascript
window.ReactNativeWebView.postMessage(
  JSON.stringify({
    action: 'getProducts'
  })
);
```

**Response:** (received via `window.message` event)
```javascript
{
  "action": "availableProducts",
  "products": [
    {
      "identifier": "monthly_premium",      // Product ID
      "title": "Monthly Premium",           // Display name
      "description": "Premium features",    // Description
      "price": 4.99,                        // Numeric price
      "priceString": "$4.99",               // Formatted price string
      "currencyCode": "USD",                // Currency code
      "packageType": "MONTHLY"              // Package type
    },
    {
      "identifier": "yearly_premium",
      "title": "Yearly Premium",
      "description": "Premium features - yearly",
      "price": 49.99,
      "priceString": "$49.99",
      "currencyCode": "USD",
      "packageType": "ANNUAL"
    }
  ]
}
```

---

### 2. Check Subscription Status

Check if the user has an active subscription.

**Request:**
```javascript
window.ReactNativeWebView.postMessage(
  JSON.stringify({
    action: 'getSubscriptionStatus'
  })
);
```

**Response:**
```javascript
{
  "action": "subscriptionStatus",
  "isSubscribed": true,                    // true if user has active subscription
  "entitlements": ["premium"],             // Array of active entitlement IDs
  "expirationDate": "2024-12-31T23:59:59Z" // ISO 8601 date (null if no expiration)
}
```

**States:**
- `isSubscribed: true` - User has an active subscription
- `isSubscribed: false` - User is not subscribed or subscription expired

---

### 3. Purchase a Product

Initiate a purchase flow for a specific product.

**Request:**
```javascript
window.ReactNativeWebView.postMessage(
  JSON.stringify({
    action: 'purchase',
    productId: 'monthly_premium'  // The product identifier to purchase
  })
);
```

**Success Response:**
```javascript
{
  "action": "subscriptionUpdated",
  "isSubscribed": true,
  "productId": "monthly_premium"  // The purchased product ID
}
```

**Also Triggers:** A `subscriptionStatus` message with updated status.

**Failure Response:**
```javascript
{
  "action": "purchaseFailed",
  "error": "cancelled",           // Error code: "cancelled", "unknown", etc.
  "message": "Purchase was cancelled."
}
```

**Error Codes:**
- `cancelled` - User cancelled the purchase
- `unknown` - Unknown error occurred
- `network` - Network error
- `invalid_product` - Invalid product ID

---

### 4. Restore Purchases

Restore previously purchased subscriptions (for users on new devices).

**Request:**
```javascript
window.ReactNativeWebView.postMessage(
  JSON.stringify({
    action: 'restorePurchases'
  })
);
```

**Success Response:**
```javascript
{
  "action": "purchasesRestored",
  "isSubscribed": true,             // true if subscriptions were found
  "entitlements": ["premium"],
  "expirationDate": "2024-12-31T23:59:59Z"
}
```

**Failure Response:**
```javascript
{
  "action": "restoreFailed",
  "error": "No purchases to restore"
}
```

---

## Receiving Messages from Native

Set up a listener to receive messages from the native app:

```javascript
// Listen for messages from native app
window.addEventListener('message', (event) => {
  try {
    const data = JSON.parse(event.data);

    switch (data.action) {
      case 'availableProducts':
        handleAvailableProducts(data.products);
        break;

      case 'subscriptionStatus':
        handleSubscriptionStatus(data);
        break;

      case 'subscriptionUpdated':
        handleSubscriptionUpdated(data);
        break;

      case 'purchaseFailed':
        handlePurchaseFailed(data);
        break;

      case 'purchasesRestored':
        handlePurchasesRestored(data);
        break;

      case 'restoreFailed':
        handleRestoreFailed(data);
        break;
    }
  } catch (error) {
    console.error('Failed to parse message from native:', error);
  }
});
```

---

## Complete Implementation Example

### React/Vue.js Example

```javascript
class IAPManager {
  constructor() {
    this.products = [];
    this.isSubscribed = false;
    this.listeners = new Map();

    // Listen for messages from native
    window.addEventListener('message', this.handleNativeMessage.bind(this));
  }

  // Send message to native
  sendToNative(action, payload = {}) {
    if (!window.ReactNativeWebView) {
      console.warn('Not running in React Native WebView');
      return;
    }

    const message = JSON.stringify({ action, ...payload });
    window.ReactNativeWebView.postMessage(message);
  }

  // Handle messages from native
  handleNativeMessage(event) {
    try {
      const data = JSON.parse(event.data);

      switch (data.action) {
        case 'availableProducts':
          this.products = data.products;
          this.notify('productsLoaded', data.products);
          break;

        case 'subscriptionStatus':
          this.isSubscribed = data.isSubscribed;
          this.notify('subscriptionStatusChanged', data);
          break;

        case 'subscriptionUpdated':
          this.isSubscribed = true;
          this.notify('purchaseSuccess', data);
          break;

        case 'purchaseFailed':
          this.notify('purchaseFailure', data);
          break;

        case 'purchasesRestored':
          this.isSubscribed = data.isSubscribed;
          this.notify('restoreSuccess', data);
          break;

        case 'restoreFailed':
          this.notify('restoreFailure', data);
          break;
      }
    } catch (error) {
      console.error('Error parsing native message:', error);
    }
  }

  // Event system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  notify(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }

  // Public API
  loadProducts() {
    this.sendToNative('getProducts');
  }

  checkSubscriptionStatus() {
    this.sendToNative('getSubscriptionStatus');
  }

  purchaseProduct(productId) {
    this.sendToNative('purchase', { productId });
  }

  restorePurchases() {
    this.sendToNative('restorePurchases');
  }
}

// Usage
const iap = new IAPManager();

// Load products on page load
iap.loadProducts();

// Check subscription status
iap.checkSubscriptionStatus();

// Listen for events
iap.on('productsLoaded', (products) => {
  console.log('Products loaded:', products);
  displayProducts(products);
});

iap.on('subscriptionStatusChanged', (status) => {
  console.log('Subscription status:', status);
  updateUI(status.isSubscribed);
});

iap.on('purchaseSuccess', (data) => {
  console.log('Purchase successful!', data);
  showSuccessMessage();
});

iap.on('purchaseFailure', (error) => {
  console.error('Purchase failed:', error);
  showErrorMessage(error.message);
});

// Handle purchase button click
function handlePurchaseClick(productId) {
  iap.purchaseProduct(productId);
}

// Handle restore button click
function handleRestoreClick() {
  iap.restorePurchases();
}
```

### Vanilla JavaScript Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>Subscription Page</title>
</head>
<body>
  <div id="app">
    <h1>Premium Subscription</h1>

    <!-- Subscription status -->
    <div id="status">
      <p>Status: <span id="subscription-status">Checking...</span></p>
    </div>

    <!-- Products list -->
    <div id="products"></div>

    <!-- Restore button -->
    <button onclick="restorePurchases()">Restore Purchases</button>
  </div>

  <script>
    // Check if running in React Native WebView
    const isReactNativeWebView = !!window.ReactNativeWebView;

    // Send message to native
    function sendToNative(action, payload = {}) {
      if (!isReactNativeWebView) {
        console.warn('Not in React Native WebView');
        return;
      }

      const message = JSON.stringify({ action, ...payload });
      window.ReactNativeWebView.postMessage(message);
    }

    // Listen for messages from native
    window.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.action) {
          case 'availableProducts':
            displayProducts(data.products);
            break;

          case 'subscriptionStatus':
            updateSubscriptionStatus(data);
            break;

          case 'subscriptionUpdated':
            showSuccess('Subscription activated!');
            checkSubscriptionStatus(); // Refresh status
            break;

          case 'purchaseFailed':
            showError(data.message);
            break;

          case 'purchasesRestored':
            showSuccess('Purchases restored!');
            checkSubscriptionStatus(); // Refresh status
            break;

          case 'restoreFailed':
            showError(data.error);
            break;
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    // Display products
    function displayProducts(products) {
      const container = document.getElementById('products');
      container.innerHTML = products.map(product => `
        <div class="product">
          <h3>${product.title}</h3>
          <p>${product.description}</p>
          <p class="price">${product.priceString}</p>
          <button onclick="purchaseProduct('${product.identifier}')">
            Subscribe
          </button>
        </div>
      `).join('');
    }

    // Update subscription status
    function updateSubscriptionStatus(status) {
      const statusElement = document.getElementById('subscription-status');
      statusElement.textContent = status.isSubscribed ? 'Active ✓' : 'Not subscribed';
      statusElement.className = status.isSubscribed ? 'active' : 'inactive';

      if (status.expirationDate) {
        const expiryDate = new Date(status.expirationDate);
        statusElement.textContent += ` (expires ${expiryDate.toLocaleDateString()})`;
      }
    }

    // Actions
    function loadProducts() {
      sendToNative('getProducts');
    }

    function checkSubscriptionStatus() {
      sendToNative('getSubscriptionStatus');
    }

    function purchaseProduct(productId) {
      sendToNative('purchase', { productId });
    }

    function restorePurchases() {
      sendToNative('restorePurchases');
    }

    function showSuccess(message) {
      alert(message); // Replace with your UI
    }

    function showError(message) {
      alert('Error: ' + message); // Replace with your UI
    }

    // Initialize on page load
    window.addEventListener('DOMContentLoaded', () => {
      loadProducts();
      checkSubscriptionStatus();
    });
  </script>
</body>
</html>
```

---

## UI/UX Best Practices

### 1. Loading States

Always show loading indicators while waiting for responses:

```javascript
function purchaseProduct(productId) {
  showLoadingIndicator('Processing purchase...');
  sendToNative('purchase', { productId });
}

// In message handler
case 'subscriptionUpdated':
  hideLoadingIndicator();
  showSuccessMessage();
  break;
```

### 2. Error Handling

Provide clear error messages to users:

```javascript
const ERROR_MESSAGES = {
  cancelled: 'Purchase was cancelled. You can try again anytime.',
  network: 'Network error. Please check your connection and try again.',
  invalid_product: 'This product is unavailable. Please contact support.',
  unknown: 'Something went wrong. Please try again.'
};

function handlePurchaseFailure(error) {
  const message = ERROR_MESSAGES[error.error] || error.message;
  showErrorAlert(message);
}
```

### 3. Subscription Status Display

Show clear subscription status and benefits:

```javascript
function updateUI(status) {
  if (status.isSubscribed) {
    // Hide purchase buttons
    document.getElementById('subscribe-section').style.display = 'none';

    // Show premium features
    document.getElementById('premium-content').style.display = 'block';

    // Show expiration date
    if (status.expirationDate) {
      const date = new Date(status.expirationDate);
      document.getElementById('expiry').textContent =
        `Your subscription renews on ${date.toLocaleDateString()}`;
    }
  } else {
    // Show purchase options
    document.getElementById('subscribe-section').style.display = 'block';
    document.getElementById('premium-content').style.display = 'none';
  }
}
```

### 4. Restore Purchases Button

Always provide a "Restore Purchases" option:

```html
<button onclick="restorePurchases()" class="restore-btn">
  Already subscribed? Restore purchases
</button>
```

### 5. Price Display

Use the formatted price string from the product:

```javascript
// ✅ Good - Uses localized price
<span>${product.priceString}</span>

// ❌ Bad - Hard-coded price
<span>$4.99</span>
```

### 6. Prevent Double Purchases

Disable purchase buttons while a purchase is in progress:

```javascript
let purchaseInProgress = false;

function purchaseProduct(productId) {
  if (purchaseInProgress) return;

  purchaseInProgress = true;
  disablePurchaseButtons();
  sendToNative('purchase', { productId });
}

// In response handler
case 'subscriptionUpdated':
case 'purchaseFailed':
  purchaseInProgress = false;
  enablePurchaseButtons();
  break;
```

---

## Complete Flow Example

### Initial Page Load

```javascript
1. Page loads
2. Send 'getProducts' → Receive product list
3. Send 'getSubscriptionStatus' → Receive subscription status
4. Update UI based on status
```

### Purchase Flow

```javascript
1. User clicks "Subscribe to Monthly"
2. Send 'purchase' with productId
3. Native shows Apple/Google payment sheet
4. User confirms purchase
5. Receive 'subscriptionUpdated' → Show success
6. Receive 'subscriptionStatus' → Update UI
```

### Restore Flow

```javascript
1. User clicks "Restore Purchases"
2. Send 'restorePurchases'
3. Native checks App Store/Play Store
4. Receive 'purchasesRestored' → Show success
5. Receive 'subscriptionStatus' → Update UI
```

---

## Testing Your Integration

Use the provided test page:

```javascript
// In config.js
WEB_URL: 'http://127.0.0.1:8084/iap-test.html'
```

Test each flow:
- ✅ Load products
- ✅ Check subscription status
- ✅ Purchase product
- ✅ Restore purchases
- ✅ Handle errors (cancel purchase)

---

## Next Steps

- [IAP API Reference](./IAP_API_REFERENCE.md) - Complete API documentation
- [IAP Backend Integration](./IAP_WEBHOOKS.md) - Server-side webhooks
- [IAP Setup Guide](./IAP_SETUP_GUIDE.md) - Initial configuration

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check native app logs
3. Verify message format matches exactly
4. Ensure `window.ReactNativeWebView` exists
