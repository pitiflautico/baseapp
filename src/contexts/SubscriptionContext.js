import React, { createContext, useContext, useState, useEffect } from 'react';
import config from '../config/config';
import * as iapService from '../services/iapService';
import { useAuth } from '../hooks/useAuth';

/**
 * Subscription Context
 *
 * Provides global state for subscription status and IAP functionality.
 * Only active when FEATURES.IN_APP_PURCHASES is enabled.
 */

const SubscriptionContext = createContext({
  isSubscribed: false,
  isLoading: true,
  subscriptionStatus: null,
  availableProducts: [],
  purchaseProduct: async () => {},
  restorePurchases: async () => {},
  refreshStatus: async () => {},
  hasEntitlement: () => false,
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider = ({ children }) => {
  // If IAP is disabled, provide a minimal context
  if (!config.FEATURES.IN_APP_PURCHASES) {
    return (
      <SubscriptionContext.Provider
        value={{
          isSubscribed: false,
          isLoading: false,
          subscriptionStatus: null,
          availableProducts: [],
          purchaseProduct: async () => ({ success: false, error: 'IAP disabled' }),
          restorePurchases: async () => ({ success: false, error: 'IAP disabled' }),
          refreshStatus: async () => {},
          hasEntitlement: () => false,
        }}
      >
        {children}
      </SubscriptionContext.Provider>
    );
  }

  // Full IAP context when enabled
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);
  const { userId } = useAuth();

  /**
   * Initialize IAP and load subscription status
   */
  useEffect(() => {
    if (config.FEATURES.IN_APP_PURCHASES) {
      initializeSubscription();
    }
  }, [userId]);

  const initializeSubscription = async () => {
    try {
      setIsLoading(true);

      // Initialize RevenueCat
      const initResult = await iapService.initializeIAP(userId);
      if (!initResult.success) {
        console.error('[SubscriptionContext] Failed to initialize IAP:', initResult.error);
        setIsLoading(false);
        return;
      }

      // Load subscription status
      await refreshStatus();

      // Load available products
      await loadProducts();

      setIsLoading(false);
    } catch (error) {
      console.error('[SubscriptionContext] Initialization error:', error);
      setIsLoading(false);
    }
  };

  /**
   * Refresh subscription status from RevenueCat
   */
  const refreshStatus = async () => {
    try {
      const status = await iapService.getSubscriptionStatus();

      setIsSubscribed(status.isSubscribed);
      setSubscriptionStatus(status);

      if (config.DEBUG) {
        console.log('[SubscriptionContext] Subscription status updated:', status.isSubscribed);
      }

      return status;
    } catch (error) {
      console.error('[SubscriptionContext] Failed to refresh status:', error);
      return { isSubscribed: false };
    }
  };

  /**
   * Load available products
   */
  const loadProducts = async () => {
    try {
      const result = await iapService.getAvailableProducts();

      if (result.success) {
        setAvailableProducts(result.products);

        if (config.DEBUG) {
          console.log('[SubscriptionContext] Products loaded:', result.products.length);
        }
      }
    } catch (error) {
      console.error('[SubscriptionContext] Failed to load products:', error);
    }
  };

  /**
   * Purchase a product
   *
   * @param {string} productId - Product identifier
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const purchaseProduct = async (productId) => {
    try {
      setIsLoading(true);

      const result = await iapService.purchaseProduct(productId);

      if (result.success) {
        // Refresh subscription status after successful purchase
        await refreshStatus();

        if (config.DEBUG) {
          console.log('[SubscriptionContext] Purchase successful:', productId);
        }
      }

      setIsLoading(false);
      return result;
    } catch (error) {
      console.error('[SubscriptionContext] Purchase error:', error);
      setIsLoading(false);
      return { success: false, error: error.message };
    }
  };

  /**
   * Restore previous purchases
   *
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const restorePurchases = async () => {
    try {
      setIsLoading(true);

      const result = await iapService.restorePurchases();

      if (result.success) {
        // Refresh subscription status after restore
        await refreshStatus();

        if (config.DEBUG) {
          console.log('[SubscriptionContext] Purchases restored');
        }
      }

      setIsLoading(false);
      return result;
    } catch (error) {
      console.error('[SubscriptionContext] Restore error:', error);
      setIsLoading(false);
      return { success: false, error: error.message };
    }
  };

  /**
   * Check if user has specific entitlement
   *
   * @param {string} entitlementId - Entitlement identifier
   * @returns {boolean}
   */
  const hasEntitlement = (entitlementId = config.IAP.ENTITLEMENTS.PREMIUM) => {
    if (!subscriptionStatus || !subscriptionStatus.entitlements) {
      return false;
    }

    return typeof subscriptionStatus.entitlements[entitlementId] !== 'undefined';
  };

  const value = {
    isSubscribed,
    isLoading,
    subscriptionStatus,
    availableProducts,
    purchaseProduct,
    restorePurchases,
    refreshStatus,
    hasEntitlement,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

export default SubscriptionContext;
