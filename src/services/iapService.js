import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import config from '../config/config';

/**
 * In-App Purchases Service
 *
 * IMPORTANT: This service has two modes:
 * 1. IAP DISABLED (default): Exports dummy functions that do nothing
 * 2. IAP ENABLED: Exports full RevenueCat integration
 *
 * This ensures zero traces of IAP code in builds where IAP is disabled.
 */

// ===== MODE 1: IAP DISABLED =====
// If IN_APP_PURCHASES feature is disabled, export dummy functions
if (!config.FEATURES.IN_APP_PURCHASES) {
  if (config.DEBUG) {
    console.log('[IAP Service] In-App Purchases is DISABLED. Using dummy service.');
  }

  // Export stub functions that do nothing
  module.exports = {
    initializeIAP: async () => {
      if (config.DEBUG) console.log('[IAP Service] initializeIAP called (disabled)');
      return { success: false, error: 'IAP is disabled' };
    },
    purchaseProduct: async () => {
      if (config.DEBUG) console.log('[IAP Service] purchaseProduct called (disabled)');
      return { success: false, error: 'IAP is disabled' };
    },
    restorePurchases: async () => {
      if (config.DEBUG) console.log('[IAP Service] restorePurchases called (disabled)');
      return { success: false, error: 'IAP is disabled' };
    },
    getSubscriptionStatus: async () => {
      if (config.DEBUG) console.log('[IAP Service] getSubscriptionStatus called (disabled)');
      return { isSubscribed: false, entitlements: [] };
    },
    getAvailableProducts: async () => {
      if (config.DEBUG) console.log('[IAP Service] getAvailableProducts called (disabled)');
      return { success: false, products: [] };
    },
    checkEntitlements: async () => {
      if (config.DEBUG) console.log('[IAP Service] checkEntitlements called (disabled)');
      return {};
    },
    syncWithBackend: async () => {
      if (config.DEBUG) console.log('[IAP Service] syncWithBackend called (disabled)');
      return { success: false };
    },
  };
} else {
  // ===== MODE 2: IAP ENABLED =====
  // Full RevenueCat implementation

  // Only import RevenueCat when IAP is enabled
  const Purchases = require('react-native-purchases').default;
  const { PURCHASES_ERROR_CODE } = require('react-native-purchases');

  /**
   * Initialize RevenueCat SDK
   *
   * @param {string} userId - Optional user ID for custom mode
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const initializeIAP = async (userId = null) => {
    try {
      if (config.DEBUG) {
        console.log('[IAP Service] Initializing RevenueCat...');
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      }

      // Configure RevenueCat with platform-specific API key
      const apiKey =
        Platform.OS === 'ios'
          ? config.IAP.REVENUECAT_API_KEY_IOS
          : config.IAP.REVENUECAT_API_KEY_ANDROID;

      if (!apiKey) {
        throw new Error('RevenueCat API key not configured');
      }

      await Purchases.configure({ apiKey });

      // Set user ID if using custom mode
      if (config.IAP.USER_ID_MODE === 'custom' && userId) {
        await Purchases.logIn(userId);
        if (config.DEBUG) console.log(`[IAP Service] Logged in user: ${userId}`);
      }

      // Listen to customer info updates
      Purchases.addCustomerInfoUpdateListener((customerInfo) => {
        if (config.DEBUG) {
          console.log('[IAP Service] Customer info updated:', customerInfo);
        }
        // Cache customer info
        cacheCustomerInfo(customerInfo);
      });

      if (config.DEBUG) console.log('[IAP Service] RevenueCat initialized successfully');
      return { success: true };
    } catch (error) {
      console.error('[IAP Service] Failed to initialize RevenueCat:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Get available products from RevenueCat
   *
   * @returns {Promise<{success: boolean, products?: Array, offerings?: Object, error?: string}>}
   */
  const getAvailableProducts = async () => {
    try {
      const offerings = await Purchases.getOfferings();

      if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
        const packages = offerings.current.availablePackages;

        if (config.DEBUG) {
          console.log('[IAP Service] Available packages:', packages.length);
          packages.forEach((pkg) => {
            console.log(`- ${pkg.product.identifier}: ${pkg.product.priceString}`);
          });
        }

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
   *
   * @param {string} productId - Product identifier
   * @returns {Promise<{success: boolean, customerInfo?: Object, error?: string}>}
   */
  const purchaseProduct = async (productId) => {
    try {
      if (config.DEBUG) console.log(`[IAP Service] Purchasing product: ${productId}`);

      // Get offerings to find the package
      const offerings = await Purchases.getOfferings();
      const packageToPurchase = offerings.current?.availablePackages.find(
        (pkg) => pkg.product.identifier === productId
      );

      if (!packageToPurchase) {
        throw new Error(`Product ${productId} not found in available packages`);
      }

      // Make the purchase
      const { customerInfo, productIdentifier } = await Purchases.purchasePackage(packageToPurchase);

      if (config.DEBUG) {
        console.log('[IAP Service] Purchase successful:', productIdentifier);
        console.log('[IAP Service] Active entitlements:', Object.keys(customerInfo.entitlements.active));
      }

      // Cache customer info
      await cacheCustomerInfo(customerInfo);

      // Sync with backend if enabled
      if (config.IAP.FEATURES.AUTO_SYNC_BACKEND) {
        await syncWithBackend(customerInfo);
      }

      return {
        success: true,
        customerInfo,
        productIdentifier,
      };
    } catch (error) {
      // Handle specific error codes
      if (error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        if (config.DEBUG) console.log('[IAP Service] Purchase cancelled by user');
        return { success: false, error: 'cancelled', message: config.IAP.ERROR_MESSAGES.PURCHASE_CANCELLED };
      }

      console.error('[IAP Service] Purchase failed:', error);
      return {
        success: false,
        error: error.code || 'unknown',
        message: error.message || config.IAP.ERROR_MESSAGES.PURCHASE_FAILED,
      };
    }
  };

  /**
   * Restore previous purchases
   *
   * @returns {Promise<{success: boolean, customerInfo?: Object, error?: string}>}
   */
  const restorePurchases = async () => {
    try {
      if (config.DEBUG) console.log('[IAP Service] Restoring purchases...');

      const customerInfo = await Purchases.restorePurchases();

      if (config.DEBUG) {
        console.log('[IAP Service] Purchases restored');
        console.log('[IAP Service] Active entitlements:', Object.keys(customerInfo.entitlements.active));
      }

      // Cache customer info
      await cacheCustomerInfo(customerInfo);

      // Sync with backend if enabled
      if (config.IAP.FEATURES.AUTO_SYNC_BACKEND) {
        await syncWithBackend(customerInfo);
      }

      return { success: true, customerInfo };
    } catch (error) {
      console.error('[IAP Service] Restore failed:', error);
      return {
        success: false,
        error: error.message || config.IAP.ERROR_MESSAGES.RESTORE_FAILED,
      };
    }
  };

  /**
   * Get current subscription status
   *
   * @returns {Promise<{isSubscribed: boolean, entitlements: Object, expirationDate?: Date}>}
   */
  const getSubscriptionStatus = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();

      // Check if user has active entitlements
      const activeEntitlements = customerInfo.entitlements.active;
      const isSubscribed = Object.keys(activeEntitlements).length > 0;

      let expirationDate = null;
      if (isSubscribed) {
        // Get expiration date from the premium entitlement
        const premiumEntitlement = activeEntitlements[config.IAP.ENTITLEMENTS.PREMIUM];
        if (premiumEntitlement) {
          expirationDate = new Date(premiumEntitlement.expirationDate);
        }
      }

      if (config.DEBUG) {
        console.log('[IAP Service] Subscription status:', {
          isSubscribed,
          entitlements: Object.keys(activeEntitlements),
          expirationDate,
        });
      }

      return {
        isSubscribed,
        entitlements: activeEntitlements,
        expirationDate,
        customerInfo,
      };
    } catch (error) {
      console.error('[IAP Service] Failed to get subscription status:', error);
      return {
        isSubscribed: false,
        entitlements: {},
      };
    }
  };

  /**
   * Check if user has specific entitlement
   *
   * @param {string} entitlementId - Entitlement identifier
   * @returns {Promise<boolean>}
   */
  const checkEntitlements = async (entitlementId = config.IAP.ENTITLEMENTS.PREMIUM) => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const hasEntitlement = typeof customerInfo.entitlements.active[entitlementId] !== 'undefined';

      if (config.DEBUG) {
        console.log(`[IAP Service] Has entitlement '${entitlementId}':`, hasEntitlement);
      }

      return hasEntitlement;
    } catch (error) {
      console.error('[IAP Service] Failed to check entitlements:', error);
      return false;
    }
  };

  /**
   * Sync subscription status with backend
   *
   * @param {Object} customerInfo - RevenueCat customer info (optional)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const syncWithBackend = async (customerInfo = null) => {
    try {
      if (!config.IAP.BACKEND_API.BASE_URL) {
        if (config.DEBUG) console.log('[IAP Service] Backend URL not configured, skipping sync');
        return { success: false, error: 'Backend not configured' };
      }

      // Get customer info if not provided
      if (!customerInfo) {
        customerInfo = await Purchases.getCustomerInfo();
      }

      // Get user token for authentication
      const userToken = await SecureStore.getItemAsync(config.AUTH_STORAGE_KEYS.USER_TOKEN);
      const userId = await SecureStore.getItemAsync(config.AUTH_STORAGE_KEYS.USER_ID);

      if (!userToken || !userId) {
        console.error('[IAP Service] User not authenticated, cannot sync with backend');
        return { success: false, error: 'Not authenticated' };
      }

      // Build endpoint URL
      const endpoint = config.IAP.BACKEND_API.ENDPOINTS.SYNC_SUBSCRIPTION.replace(':userId', userId);
      const url = `${config.IAP.BACKEND_API.BASE_URL}${endpoint}`;

      // Prepare payload
      const payload = {
        customerId: customerInfo.originalAppUserId,
        activeEntitlements: Object.keys(customerInfo.entitlements.active),
        subscriptions: customerInfo.allPurchasedProductIdentifiers,
      };

      if (config.DEBUG) {
        console.log('[IAP Service] Syncing with backend:', url);
      }

      // Send to backend
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Backend sync failed: ${response.status}`);
      }

      if (config.DEBUG) console.log('[IAP Service] Backend sync successful');
      return { success: true };
    } catch (error) {
      console.error('[IAP Service] Backend sync failed:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Cache customer info in SecureStore
   *
   * @param {Object} customerInfo - RevenueCat customer info
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

      if (config.DEBUG) console.log('[IAP Service] Customer info cached');
    } catch (error) {
      console.error('[IAP Service] Failed to cache customer info:', error);
    }
  };

  /**
   * Get cached subscription status (works offline)
   *
   * @returns {Promise<{isSubscribed: boolean, entitlements: Array}>}
   */
  const getCachedSubscriptionStatus = async () => {
    try {
      const entitlementsJson = await SecureStore.getItemAsync(config.IAP.STORAGE_KEYS.ACTIVE_ENTITLEMENTS);
      const entitlements = entitlementsJson ? JSON.parse(entitlementsJson) : [];

      return {
        isSubscribed: entitlements.length > 0,
        entitlements,
      };
    } catch (error) {
      console.error('[IAP Service] Failed to get cached status:', error);
      return { isSubscribed: false, entitlements: [] };
    }
  };

  // Export all functions
  module.exports = {
    initializeIAP,
    purchaseProduct,
    restorePurchases,
    getSubscriptionStatus,
    getAvailableProducts,
    checkEntitlements,
    syncWithBackend,
    getCachedSubscriptionStatus,
  };
}
