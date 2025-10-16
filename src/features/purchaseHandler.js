import config from '../config/config';

/**
 * Purchase Handler
 *
 * Handles purchase-related events and communication between native IAP
 * and the WebView interface.
 *
 * This handler manages:
 * - Purchase success/failure notifications
 * - Subscription status updates
 * - Communication with WebView about subscription changes
 */

/**
 * Handle successful purchase
 *
 * @param {string} productId - Product identifier that was purchased
 * @param {Object} customerInfo - RevenueCat customer info
 * @param {Object} webViewRef - Reference to WebView for sending messages
 * @returns {Promise<void>}
 */
export const onPurchaseSuccess = async (productId, customerInfo, webViewRef) => {
  try {
    if (config.DEBUG) {
      console.log('[PurchaseHandler] Purchase successful:', productId);
    }

    // Extract subscription data
    const activeEntitlements = Object.keys(customerInfo.entitlements.active);
    const isSubscribed = activeEntitlements.length > 0;

    let expirationDate = null;
    if (isSubscribed) {
      const premiumEntitlement = customerInfo.entitlements.active[config.IAP.ENTITLEMENTS.PREMIUM];
      if (premiumEntitlement) {
        expirationDate = premiumEntitlement.expirationDate;
      }
    }

    // Notify WebView about subscription update
    if (webViewRef && webViewRef.current) {
      const message = {
        action: 'subscriptionUpdated',
        isSubscribed,
        productId,
        entitlements: activeEntitlements,
        expirationDate,
      };

      webViewRef.current.postMessage(JSON.stringify(message));

      if (config.DEBUG) {
        console.log('[PurchaseHandler] WebView notified of purchase success');
      }
    }
  } catch (error) {
    console.error('[PurchaseHandler] Error handling purchase success:', error);
  }
};

/**
 * Handle failed purchase
 *
 * @param {string} productId - Product identifier that failed
 * @param {string} error - Error code or message
 * @param {Object} webViewRef - Reference to WebView for sending messages
 * @returns {Promise<void>}
 */
export const onPurchaseFailure = async (productId, error, webViewRef) => {
  try {
    if (config.DEBUG) {
      console.log('[PurchaseHandler] Purchase failed:', productId, error);
    }

    // Notify WebView about purchase failure
    if (webViewRef && webViewRef.current) {
      const message = {
        action: 'purchaseFailed',
        productId,
        error: error === 'cancelled' ? 'cancelled' : 'failed',
        message: error === 'cancelled'
          ? config.IAP.ERROR_MESSAGES.PURCHASE_CANCELLED
          : config.IAP.ERROR_MESSAGES.PURCHASE_FAILED,
      };

      webViewRef.current.postMessage(JSON.stringify(message));

      if (config.DEBUG) {
        console.log('[PurchaseHandler] WebView notified of purchase failure');
      }
    }
  } catch (error) {
    console.error('[PurchaseHandler] Error handling purchase failure:', error);
  }
};

/**
 * Handle restored purchases
 *
 * @param {Object} customerInfo - RevenueCat customer info
 * @param {Object} webViewRef - Reference to WebView for sending messages
 * @returns {Promise<void>}
 */
export const onPurchaseRestored = async (customerInfo, webViewRef) => {
  try {
    if (config.DEBUG) {
      console.log('[PurchaseHandler] Purchases restored');
    }

    // Extract subscription data
    const activeEntitlements = Object.keys(customerInfo.entitlements.active);
    const isSubscribed = activeEntitlements.length > 0;

    let expirationDate = null;
    if (isSubscribed) {
      const premiumEntitlement = customerInfo.entitlements.active[config.IAP.ENTITLEMENTS.PREMIUM];
      if (premiumEntitlement) {
        expirationDate = premiumEntitlement.expirationDate;
      }
    }

    // Notify WebView about restored purchases
    if (webViewRef && webViewRef.current) {
      const message = {
        action: 'purchasesRestored',
        isSubscribed,
        entitlements: activeEntitlements,
        expirationDate,
      };

      webViewRef.current.postMessage(JSON.stringify(message));

      if (config.DEBUG) {
        console.log('[PurchaseHandler] WebView notified of restored purchases');
      }
    }
  } catch (error) {
    console.error('[PurchaseHandler] Error handling purchase restore:', error);
  }
};

/**
 * Send current subscription status to WebView
 *
 * This is useful when WebView first loads or requests subscription status
 *
 * @param {Object} subscriptionStatus - Current subscription status object
 * @param {Object} webViewRef - Reference to WebView for sending messages
 * @returns {Promise<void>}
 */
export const syncSubscriptionStatus = async (subscriptionStatus, webViewRef) => {
  try {
    if (!webViewRef || !webViewRef.current) {
      if (config.DEBUG) {
        console.log('[PurchaseHandler] WebView ref not available for sync');
      }
      return;
    }

    const activeEntitlements = subscriptionStatus.entitlements
      ? Object.keys(subscriptionStatus.entitlements)
      : [];

    const message = {
      action: 'subscriptionStatus',
      isSubscribed: subscriptionStatus.isSubscribed || false,
      entitlements: activeEntitlements,
      expirationDate: subscriptionStatus.expirationDate || null,
    };

    webViewRef.current.postMessage(JSON.stringify(message));

    if (config.DEBUG) {
      console.log('[PurchaseHandler] Subscription status synced with WebView');
    }
  } catch (error) {
    console.error('[PurchaseHandler] Error syncing subscription status:', error);
  }
};

/**
 * Send available products to WebView
 *
 * @param {Array} products - Array of product objects
 * @param {Object} webViewRef - Reference to WebView for sending messages
 * @returns {Promise<void>}
 */
export const sendAvailableProducts = async (products, webViewRef) => {
  try {
    if (!webViewRef || !webViewRef.current) {
      if (config.DEBUG) {
        console.log('[PurchaseHandler] WebView ref not available for products');
      }
      return;
    }

    const message = {
      action: 'availableProducts',
      products: products || [],
    };

    webViewRef.current.postMessage(JSON.stringify(message));

    if (config.DEBUG) {
      console.log('[PurchaseHandler] Available products sent to WebView:', products.length);
    }
  } catch (error) {
    console.error('[PurchaseHandler] Error sending products:', error);
  }
};

export default {
  onPurchaseSuccess,
  onPurchaseFailure,
  onPurchaseRestored,
  syncSubscriptionStatus,
  sendAvailableProducts,
};
