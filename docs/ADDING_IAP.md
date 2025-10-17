# Adding In-App Purchases (IAP) to the Base App

This guide explains how to add In-App Purchases functionality using RevenueCat to the base app.

## Overview

The IAP feature is maintained in a separate branch (`with-iap`) to keep the main branch clean and avoid dependencies when IAP is not needed.

## Quick Start: Use the with-iap Branch

The easiest way to add IAP is to merge from the `with-iap` branch:

```bash
# Switch to your feature branch
git checkout your-branch

# Merge IAP code from with-iap branch
git merge with-iap

# Install the required package
npm install react-native-purchases

# Rebuild native code
npx expo prebuild --clean
```

Then configure your RevenueCat API keys in `src/config/config.js` and enable the feature flag.

## Manual Implementation

If you prefer to implement IAP manually or need to understand the implementation, follow these steps:

### 1. Install Dependencies

```bash
npm install react-native-purchases
npx expo prebuild --clean
```

### 2. Create IAP Service Files

Create two files in `src/services/`:

#### `src/services/iapService.js`

```javascript
import config from '../config/config';

/**
 * In-App Purchases Service
 *
 * Conditionally exports IAP functionality based on feature flag.
 */

if (!config.FEATURES.IN_APP_PURCHASES) {
  // Export dummy functions when IAP is disabled
  module.exports = {
    initializeIAP: async () => ({ success: false, error: 'IAP is disabled' }),
    purchaseProduct: async () => ({ success: false, error: 'IAP is disabled' }),
    restorePurchases: async () => ({ success: false, error: 'IAP is disabled' }),
    getSubscriptionStatus: async () => ({ isSubscribed: false, entitlements: [] }),
    getAvailableProducts: async () => ({ success: false, products: [] }),
    checkEntitlements: async () => false,
    syncWithBackend: async () => ({ success: false }),
    getCachedSubscriptionStatus: async () => ({ isSubscribed: false, entitlements: [] }),
  };
} else {
  // Import full implementation when enabled
  const iapImpl = require('./iapServiceImpl');

  module.exports = {
    initializeIAP: iapImpl.initializeIAP,
    purchaseProduct: iapImpl.purchaseProduct,
    restorePurchases: iapImpl.restorePurchases,
    getSubscriptionStatus: iapImpl.getSubscriptionStatus,
    getAvailableProducts: iapImpl.getAvailableProducts,
    checkEntitlements: iapImpl.checkEntitlements,
    syncWithBackend: iapImpl.syncWithBackend,
    getCachedSubscriptionStatus: iapImpl.getCachedSubscriptionStatus,
  };
}
```

#### `src/services/iapServiceImpl.js`

```javascript
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import config from '../config/config';

const Purchases = require('react-native-purchases').default;
const { PURCHASES_ERROR_CODE } = require('react-native-purchases');

/**
 * Initialize RevenueCat SDK
 */
export const initializeIAP = async (userId = null) => {
  try {
    if (config.DEBUG) {
      console.log('[IAP Service] Initializing RevenueCat...');
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    }

    const apiKey = Platform.OS === 'ios'
      ? config.IAP.REVENUECAT_API_KEY_IOS
      : config.IAP.REVENUECAT_API_KEY_ANDROID;

    if (!apiKey) {
      throw new Error('RevenueCat API key not configured');
    }

    await Purchases.configure({ apiKey });

    if (config.IAP.USER_ID_MODE === 'custom' && userId) {
      await Purchases.logIn(userId);
    }

    Purchases.addCustomerInfoUpdateListener((customerInfo) => {
      if (config.DEBUG) {
        console.log('[IAP Service] Customer info updated:', customerInfo);
      }
      cacheCustomerInfo(customerInfo);
    });

    return { success: true };
  } catch (error) {
    console.error('[IAP Service] Failed to initialize RevenueCat:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get available products
 */
export const getAvailableProducts = async () => {
  try {
    const offerings = await Purchases.getOfferings();

    if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
      const packages = offerings.current.availablePackages;

      return {
        success: true,
        products: packages.map((pkg) => ({
          identifier: pkg.product.identifier,
          title: pkg.product.title,
          description: pkg.product.description,
          price: pkg.product.price,
          priceString: pkg.product.priceString,
          currencyCode: pkg.product.currencyCode,
          packageType: pkg.packageType,
        })),
        offerings,
      };
    }

    return { success: true, products: [], offerings };
  } catch (error) {
    console.error('[IAP Service] Failed to get products:', error);
    return { success: false, error: error.message, products: [] };
  }
};

/**
 * Purchase a product
 */
export const purchaseProduct = async (productId) => {
  try {
    const offerings = await Purchases.getOfferings();
    const packageToPurchase = offerings.current?.availablePackages.find(
      (pkg) => pkg.product.identifier === productId
    );

    if (!packageToPurchase) {
      throw new Error(`Product ${productId} not found`);
    }

    const { customerInfo, productIdentifier } = await Purchases.purchasePackage(packageToPurchase);

    await cacheCustomerInfo(customerInfo);

    if (config.IAP.FEATURES.AUTO_SYNC_BACKEND) {
      await syncWithBackend(customerInfo);
    }

    return { success: true, customerInfo, productIdentifier };
  } catch (error) {
    if (error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return { success: false, error: 'cancelled', message: config.IAP.ERROR_MESSAGES.PURCHASE_CANCELLED };
    }
    return { success: false, error: error.code || 'unknown', message: error.message };
  }
};

/**
 * Restore purchases
 */
export const restorePurchases = async () => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    await cacheCustomerInfo(customerInfo);

    if (config.IAP.FEATURES.AUTO_SYNC_BACKEND) {
      await syncWithBackend(customerInfo);
    }

    return { success: true, customerInfo };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get subscription status
 */
export const getSubscriptionStatus = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const activeEntitlements = customerInfo.entitlements.active;
    let isSubscribed = Object.keys(activeEntitlements).length > 0;

    if (!isSubscribed && customerInfo.activeSubscriptions?.length > 0) {
      isSubscribed = true;
    }

    return { isSubscribed, entitlements: activeEntitlements, customerInfo };
  } catch (error) {
    return { isSubscribed: false, entitlements: {} };
  }
};

/**
 * Check entitlements
 */
export const checkEntitlements = async (entitlementId = config.IAP.ENTITLEMENTS.PREMIUM) => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return typeof customerInfo.entitlements.active[entitlementId] !== 'undefined';
  } catch (error) {
    return false;
  }
};

/**
 * Sync with backend
 */
export const syncWithBackend = async (customerInfo = null) => {
  try {
    if (!config.IAP.BACKEND_API.BASE_URL) {
      return { success: false, error: 'Backend not configured' };
    }

    if (!customerInfo) {
      customerInfo = await Purchases.getCustomerInfo();
    }

    const userToken = await SecureStore.getItemAsync(config.AUTH_STORAGE_KEYS.USER_TOKEN);
    const userId = await SecureStore.getItemAsync(config.AUTH_STORAGE_KEYS.USER_ID);

    if (!userToken || !userId) {
      return { success: false, error: 'Not authenticated' };
    }

    const endpoint = config.IAP.BACKEND_API.ENDPOINTS.SYNC_SUBSCRIPTION.replace(':userId', userId);
    const url = `${config.IAP.BACKEND_API.BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        customerId: customerInfo.originalAppUserId,
        activeEntitlements: Object.keys(customerInfo.entitlements.active),
        subscriptions: customerInfo.allPurchasedProductIdentifiers,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend sync failed: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Cache customer info
 */
const cacheCustomerInfo = async (customerInfo) => {
  try {
    await SecureStore.setItemAsync(
      config.IAP.STORAGE_KEYS.CUSTOMER_INFO,
      JSON.stringify(customerInfo)
    );
    await SecureStore.setItemAsync(
      config.IAP.STORAGE_KEYS.ACTIVE_ENTITLEMENTS,
      JSON.stringify(Object.keys(customerInfo.entitlements.active))
    );
    await SecureStore.setItemAsync(config.IAP.STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  } catch (error) {
    console.error('[IAP Service] Failed to cache customer info:', error);
  }
};

/**
 * Get cached subscription status
 */
export const getCachedSubscriptionStatus = async () => {
  try {
    const entitlementsJson = await SecureStore.getItemAsync(config.IAP.STORAGE_KEYS.ACTIVE_ENTITLEMENTS);
    const entitlements = entitlementsJson ? JSON.parse(entitlementsJson) : [];
    return { isSubscribed: entitlements.length > 0, entitlements };
  } catch (error) {
    return { isSubscribed: false, entitlements: [] };
  }
};
```

### 3. Update HomeScreen to Initialize IAP

In `app/(tabs)/index.js`, add IAP initialization:

```javascript
import * as iapService from '../../src/services/iapService';

// Inside the component, add this useEffect:
useEffect(() => {
  if (!config.FEATURES.IN_APP_PURCHASES) {
    return;
  }

  const initIAP = async () => {
    try {
      if (config.DEBUG) {
        console.log('[HomeScreen] Initializing IAP...');
      }
      const result = await iapService.initializeIAP(userId);
      if (result.success) {
        console.log('[HomeScreen] IAP initialized successfully');
      } else {
        console.warn('[HomeScreen] IAP initialization failed:', result.error);
      }
    } catch (error) {
      console.error('[HomeScreen] Error initializing IAP:', error);
    }
  };

  initIAP();
}, [userId]);
```

### 4. Add IAP Message Handlers

In the `handleWebMessage` function in `app/(tabs)/index.js`, add these cases:

```javascript
case 'getProducts':
  if (!config.FEATURES.IN_APP_PURCHASES) {
    console.warn('[HomeScreen] IAP feature disabled');
    return;
  }

  const productsResult = await iapService.getAvailableProducts();
  if (productsResult.success && webViewRef.current?.sendMessage) {
    webViewRef.current.sendMessage({
      action: 'availableProducts',
      products: productsResult.products,
    });
  }
  break;

case 'getSubscriptionStatus':
  if (!config.FEATURES.IN_APP_PURCHASES) {
    console.warn('[HomeScreen] IAP feature disabled');
    return;
  }

  const statusResult = await iapService.getSubscriptionStatus();
  if (webViewRef.current?.sendMessage) {
    webViewRef.current.sendMessage({
      action: 'subscriptionStatus',
      isSubscribed: statusResult.isSubscribed,
      entitlements: Object.keys(statusResult.entitlements || {}),
      expirationDate: statusResult.expirationDate,
    });
  }
  break;

case 'purchase':
  if (!config.FEATURES.IN_APP_PURCHASES) {
    console.warn('[HomeScreen] IAP feature disabled');
    return;
  }

  if (!message.productId) {
    console.error('[HomeScreen] Purchase failed: no productId provided');
    return;
  }

  const purchaseResult = await iapService.purchaseProduct(message.productId);
  if (purchaseResult.success && webViewRef.current?.sendMessage) {
    webViewRef.current.sendMessage({
      action: 'subscriptionUpdated',
      isSubscribed: true,
      productId: purchaseResult.productIdentifier,
    });
  } else if (webViewRef.current?.sendMessage) {
    webViewRef.current.sendMessage({
      action: 'purchaseFailed',
      error: purchaseResult.error,
      message: purchaseResult.message,
    });
  }
  break;

case 'restorePurchases':
  if (!config.FEATURES.IN_APP_PURCHASES) {
    console.warn('[HomeScreen] IAP feature disabled');
    return;
  }

  const restoreResult = await iapService.restorePurchases();
  if (restoreResult.success) {
    const restoredStatus = await iapService.getSubscriptionStatus();
    if (webViewRef.current?.sendMessage) {
      webViewRef.current.sendMessage({
        action: 'purchasesRestored',
        isSubscribed: restoredStatus.isSubscribed,
        entitlements: Object.keys(restoredStatus.entitlements || {}),
        expirationDate: restoredStatus.expirationDate,
      });
    }
  } else if (webViewRef.current?.sendMessage) {
    webViewRef.current.sendMessage({
      action: 'restoreFailed',
      error: restoreResult.error,
    });
  }
  break;
```

### 5. Configure RevenueCat

In `src/config/config.js`, configure the IAP section:

```javascript
FEATURES: {
  // ... other features
  IN_APP_PURCHASES: true, // Enable IAP
},

IAP: {
  // Get these from https://app.revenuecat.com
  REVENUECAT_API_KEY_IOS: 'appl_xxxxxxxxxxxxx',
  REVENUECAT_API_KEY_ANDROID: 'goog_xxxxxxxxxxxxx',

  USER_ID_MODE: 'custom', // or 'anonymous'

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
      GET_PURCHASE_HISTORY: '/api/users/:userId/subscription/history',
    },
  },

  STORAGE_KEYS: {
    SUBSCRIPTION_STATUS: 'iap_subscription_status',
    CUSTOMER_INFO: 'iap_customer_info',
    ACTIVE_ENTITLEMENTS: 'iap_active_entitlements',
    LAST_SYNC: 'iap_last_sync',
  },

  FEATURES: {
    ALLOW_RESTORE_PURCHASES: true,
    AUTO_SYNC_BACKEND: true,
    SHOW_PURCHASE_HISTORY: false,
    ENABLE_PROMOTIONAL_OFFERS: true,
  },

  ERROR_MESSAGES: {
    PURCHASE_CANCELLED: 'Purchase was cancelled.',
    PURCHASE_FAILED: 'Purchase failed. Please try again.',
    RESTORE_FAILED: 'Failed to restore purchases. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    PRODUCT_NOT_AVAILABLE: 'This product is currently unavailable.',
    ALREADY_SUBSCRIBED: 'You already have an active subscription.',
    INVALID_PRODUCT: 'Invalid product. Please contact support.',
  },

  SUCCESS_MESSAGES: {
    PURCHASE_SUCCESS: 'Purchase successful! Thank you.',
    RESTORE_SUCCESS: 'Purchases restored successfully.',
    SUBSCRIPTION_ACTIVE: 'Your subscription is active.',
  },
},
```

### 6. Setup RevenueCat Dashboard

1. Create account at https://app.revenuecat.com
2. Create a new app
3. Add your iOS Bundle ID and Android Package Name
4. Configure API keys in Settings > API Keys
5. Create products in Products section
6. Create entitlements (e.g., "premium")
7. Link products to entitlements

### 7. Setup App Store / Google Play

#### iOS (App Store Connect):
1. Go to App Store Connect
2. Select your app > Features > In-App Purchases
3. Create new subscription or in-app purchase
4. Use the same Product IDs as in config.js

#### Android (Google Play Console):
1. Go to Google Play Console
2. Select your app > Monetize > Subscriptions
3. Create new subscription
4. Use the same Product IDs as in config.js

## Testing

Use the test page included in the repo:

```javascript
// In your web app
window.ReactNativeWebView.postMessage(JSON.stringify({
  action: 'getProducts'
}));

window.ReactNativeWebView.postMessage(JSON.stringify({
  action: 'purchase',
  productId: 'monthly_premium'
}));
```

## Branch Strategy

- **main**: No IAP code, clean base
- **with-iap**: Full IAP implementation
- When creating a new app project:
  - Clone from `main` if you don't need IAP
  - Clone from `with-iap` or merge it if you need IAP

## Troubleshooting

### Metro bundler error: "Unable to resolve react-native-purchases"
- Make sure you installed the package: `npm install react-native-purchases`
- Run: `npx expo prebuild --clean`
- Clear Metro cache: `rm -rf node_modules/.cache && npx expo start --clear`

### Purchases not working in simulator
- RevenueCat Test Store works in simulator
- For real Store testing, use physical device

### Backend sync fails
- Check that `config.IAP.BACKEND_API.BASE_URL` is set
- Verify user is authenticated (has valid token)
- Check backend endpoint implementation

## Reference Implementation

For a complete working example, check the `with-iap` branch:

```bash
git checkout with-iap
git log --oneline -- src/services/iap*
```
