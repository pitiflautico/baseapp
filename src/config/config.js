/**
 * Central Configuration File
 *
 * This file contains all configurable constants for the app.
 * When cloning this base app for a new project, modify these values
 * to customize the app behavior without touching core logic.
 */

const config = {
  // ===== WebView Configuration =====

  /**
   * The URL that will be loaded in the WebView as the main interface
   * Change this to your web application URL for each new app
   * @example 'https://example.com'
   */
  WEB_URL: 'http://127.0.0.1:8084/iap-test.html',

  // ===== App Information =====

  /**
   * The display name of the application
   * This is used in native screens and can be different from the app name in stores
   */
  APP_TITLE: 'Base App',

  /**
   * App slug (lowercase, no spaces, used in URLs and paths)
   * @example 'myapp'
   */
  APP_SLUG: 'app-base',

  /**
   * App version (keep in sync with package.json)
   */
  APP_VERSION: '1.0.0',

  /**
   * iOS Bundle Identifier (reverse domain notation)
   * @example 'com.yourcompany.appname'
   */
  IOS_BUNDLE_ID: 'com.nebulio.baseapp',

  /**
   * Android Package Name (reverse domain notation)
   * @example 'com.yourcompany.appname'
   */
  ANDROID_PACKAGE: 'com.nebulio.baseapp',

  // ===== Feature Flags =====

  /**
   * Master switch to enable/disable all native features
   * Set to false to run app in pure WebView mode (useful for testing)
   */
  ALLOW_NATIVE_FEATURES: true,

  /**
   * Enable/disable specific native features
   * These can be toggled individually even when ALLOW_NATIVE_FEATURES is true
   */
  FEATURES: {
    PUSH_NOTIFICATIONS: true,
    SHARING: true,
    DEEP_LINKING: true,
    IN_APP_PURCHASES: true, // Set to true to enable subscription/payment features
  },

  // ===== Authentication =====

  /**
   * SecureStore keys for authentication data
   */
  AUTH_STORAGE_KEYS: {
    USER_ID: 'user_id',
    USER_TOKEN: 'user_token',
    IS_LOGGED_IN: 'is_logged_in',
    PUSH_TOKEN_ENDPOINT: 'push_token_endpoint',
  },

  // ===== Push Notifications =====

  /**
   * Expo Project ID for push notifications
   * Get this from: https://expo.dev > Your Project > Project settings
   * Required for push notifications to work in production
   * @example 'abc123-def456-ghi789'
   */
  EXPO_PROJECT_ID: '0275949e-9705-4237-bef3-6d0a4225dde2',

  /**
   * Push notification retry configuration
   */
  PUSH_TOKEN_RETRY: {
    MAX_RETRIES: 3,
    INITIAL_DELAY_MS: 1000,
    MAX_DELAY_MS: 10000,
  },

  // ===== In-App Purchases (IAP) =====
  // IMPORTANT: This section is ONLY used if FEATURES.IN_APP_PURCHASES is set to true
  // If IAP is disabled, no code or dependencies related to payments will be included in the build

  /**
   * In-App Purchases Configuration
   *
   * SETUP STEPS WHEN ENABLING IAP:
   * 1. Set FEATURES.IN_APP_PURCHASES to true
   * 2. Install dependencies: npm install react-native-purchases
   * 3. Configure RevenueCat API keys below
   * 4. Create products in App Store Connect and Google Play Console
   * 5. Configure products in RevenueCat dashboard
   * 6. See IAP_COMPLETE_GUIDE.md for full documentation
   */
  IAP: {
    /**
     * RevenueCat API Keys
     * Get these from: https://app.revenuecat.com > Project Settings > API Keys
     *
     * IMPORTANT: Keep these keys secure. Consider using environment variables in production.
     * For development, you can use the sandbox keys from RevenueCat.
     *
     * @example 'appl_xxxxxxxxxxxxxxxxxxxxxx' (iOS)
     * @example 'goog_xxxxxxxxxxxxxxxxxxxxxx' (Android)
     */
    REVENUECAT_API_KEY_IOS: 'test_NpIFfDEYscPbGSqdbUBlopzMVaa', // Test/Development key
    REVENUECAT_API_KEY_ANDROID: 'test_NpIFfDEYscPbGSqdbUBlopzMVaa', // Test/Development key

    /**
     * App User ID mode
     * - 'custom': Use your own user ID (recommended for apps with authentication)
     * - 'anonymous': Let RevenueCat generate anonymous IDs
     *
     * When using 'custom', the app will use the userId from AuthContext
     */
    USER_ID_MODE: 'custom',

    /**
     * Subscription Product IDs
     * These must match exactly with the Product IDs created in:
     * - iOS: App Store Connect > Your App > In-App Purchases
     * - Android: Play Console > Your App > Monetize > Subscriptions
     *
     * Product ID naming convention: {duration}_{tier}
     * @example ['monthly_premium', 'yearly_premium', 'monthly_basic']
     */
    SUBSCRIPTION_PRODUCTS: [
      'monthly_premium',
      'yearly_premium',
    ],

    /**
     * One-Time Purchase Product IDs (Non-consumable)
     * For lifetime access or permanent unlocks
     *
     * @example ['lifetime_access', 'remove_ads']
     */
    ONE_TIME_PRODUCTS: [
      // Add your one-time purchase product IDs here
      // 'lifetime_access',
    ],

    /**
     * Consumable Product IDs
     * For products that can be purchased multiple times (credits, coins, etc.)
     *
     * @example ['100_coins', '500_coins', '1000_coins']
     */
    CONSUMABLE_PRODUCTS: [
      // Add your consumable product IDs here
      // '100_coins',
      // '500_coins',
    ],

    /**
     * RevenueCat Offering ID
     * Offerings allow you to group products and A/B test pricing
     * Configure offerings in RevenueCat dashboard
     *
     * @default 'default'
     */
    DEFAULT_OFFERING: 'default',

    /**
     * Entitlement IDs
     * Entitlements represent access levels, not products
     * Configure in RevenueCat dashboard under Entitlements
     *
     * @example { PREMIUM: 'premium_access', PRO: 'pro_access' }
     */
    ENTITLEMENTS: {
      PREMIUM: 'premium', // Users with active subscription
      // Add more entitlement IDs as needed
    },

    /**
     * Backend API Configuration for IAP
     * Endpoints to sync purchase state with your backend
     * See BACKEND_IAP_ENDPOINTS.md for API specification
     */
    BACKEND_API: {
      /**
       * Base URL for your backend API
       * @example 'https://api.yourapp.com'
       */
      BASE_URL: '',

      /**
       * API endpoints for IAP operations
       * These endpoints will receive purchase updates from the app
       * See BACKEND_IAP_ENDPOINTS.md for request/response formats
       */
      ENDPOINTS: {
        // Validate and sync subscription status
        SYNC_SUBSCRIPTION: '/api/users/:userId/subscription/sync',

        // Get current subscription status from backend
        GET_SUBSCRIPTION_STATUS: '/api/users/:userId/subscription/status',

        // Get purchase history
        GET_PURCHASE_HISTORY: '/api/users/:userId/subscription/history',
      },

      /**
       * RevenueCat Webhook URL (configured in RevenueCat dashboard)
       * Your backend should expose this endpoint to receive purchase events
       * See IAP_WEBHOOKS.md for implementation details
       *
       * @example 'https://api.yourapp.com/api/webhooks/revenuecat'
       */
      WEBHOOK_URL: '',
    },

    /**
     * Storage keys for IAP data in SecureStore
     */
    STORAGE_KEYS: {
      SUBSCRIPTION_STATUS: 'iap_subscription_status',
      CUSTOMER_INFO: 'iap_customer_info',
      ACTIVE_ENTITLEMENTS: 'iap_active_entitlements',
      LAST_SYNC: 'iap_last_sync',
    },

    /**
     * Feature flags for IAP behavior
     */
    FEATURES: {
      // Show restore purchases button in UI
      ALLOW_RESTORE_PURCHASES: true,

      // Automatically sync with backend after purchase
      AUTO_SYNC_BACKEND: true,

      // Show purchase history in app
      SHOW_PURCHASE_HISTORY: false,

      // Enable promotional offers (iOS only)
      ENABLE_PROMOTIONAL_OFFERS: true,
    },

    /**
     * Error messages for IAP operations
     */
    ERROR_MESSAGES: {
      PURCHASE_CANCELLED: 'Purchase was cancelled.',
      PURCHASE_FAILED: 'Purchase failed. Please try again.',
      RESTORE_FAILED: 'Failed to restore purchases. Please try again.',
      NETWORK_ERROR: 'Network error. Please check your connection.',
      PRODUCT_NOT_AVAILABLE: 'This product is currently unavailable.',
      ALREADY_SUBSCRIBED: 'You already have an active subscription.',
      INVALID_PRODUCT: 'Invalid product. Please contact support.',
    },

    /**
     * Success messages for IAP operations
     */
    SUCCESS_MESSAGES: {
      PURCHASE_SUCCESS: 'Purchase successful! Thank you.',
      RESTORE_SUCCESS: 'Purchases restored successfully.',
      SUBSCRIPTION_ACTIVE: 'Your subscription is active.',
    },
  },

  // ===== Deep Linking & Sharing =====

  /**
   * URL scheme for deep linking
   * This allows opening the app with URLs like: yourscheme://path
   * @example 'myapp' allows myapp://calendar to open your app
   * Change this to match your app name (lowercase, no spaces)
   */
  DEEP_LINK_SCHEME: 'baseapp',

  /**
   * Associated domains for Universal Links (iOS) and App Links (Android)
   * These domains must serve the required association files:
   * - iOS: /.well-known/apple-app-site-association
   * - Android: /.well-known/assetlinks.json
   *
   * When configured, URLs like https://yourdomain.com/path will open your app
   * See DEEP_LINKING.md for server-side configuration
   *
   * @example ['feelith.com', 'www.feelith.com']
   */
  ASSOCIATED_DOMAINS: [
    // Add your production domains here
    // 'yourdomain.com',
    // 'www.yourdomain.com',
  ],

  /**
   * Deep link URL prefixes
   * Used to extract paths from incoming deep links
   */
  DEEP_LINK_PREFIXES: [
    // Will be automatically populated based on DEEP_LINK_SCHEME and ASSOCIATED_DOMAINS
  ],

  // ===== UI Configuration =====

  /**
   * Theme colors (used in native screens like Error and Loading)
   */
  COLORS: {
    PRIMARY: '#007AFF',
    SECONDARY: '#5856D6',
    BACKGROUND: '#FFFFFF',
    ERROR: '#FF3B30',
    SUCCESS: '#34C759',
    TEXT_PRIMARY: '#000000',
    TEXT_SECONDARY: '#8E8E93',
  },

  /**
   * Error messages
   */
  ERROR_MESSAGES: {
    NO_CONNECTION: 'No internet connection. Please check your network and try again.',
    FAILED_TO_LOAD: 'Failed to load the application. Please try again.',
    GENERIC_ERROR: 'Something went wrong. Please try again later.',
  },

  // ===== Development =====

  /**
   * Enable debug logging (set to false in production)
   */
  DEBUG: typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production',

  /**
   * Show detailed error information in UI (only in dev mode)
   */
  SHOW_DEV_ERRORS: typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production',
};

module.exports = config;
