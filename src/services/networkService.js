import NetInfo from '@react-native-community/netinfo';
import config from '../config/config';

/**
 * Network Service
 *
 * Manages network connection detection and monitoring.
 * Used to show offline screen when there's no internet connection.
 */

let unsubscribe = null;

/**
 * Check if device is connected to internet
 *
 * @param {boolean} forceRefresh - Force a fresh check instead of using cached state
 * @returns {Promise<boolean>} True if connected, false otherwise
 */
export const isConnected = async (forceRefresh = false) => {
  try {
    // Force NetInfo to refresh by calling fetch with a small delay
    if (forceRefresh) {
      // Wait a bit to ensure network state is fresh
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const state = await NetInfo.fetch();
    const connected = state.isConnected && state.isInternetReachable !== false;

    return connected;
  } catch (error) {
    console.error('[Network Service] Failed to check connection:', error);
    // If we can't check, assume connected to avoid blocking the app
    return true;
  }
};

/**
 * Subscribe to network state changes
 *
 * @param {Function} callback - Called when connection state changes
 * @returns {Function} Unsubscribe function
 */
export const subscribeToNetworkChanges = (callback) => {
  if (!config.FEATURES.OFFLINE_MODE) {
    return () => {}; // No-op if offline mode is disabled
  }

  unsubscribe = NetInfo.addEventListener((state) => {
    const connected = state.isConnected && state.isInternetReachable !== false;
    callback(connected);
  });

  return () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };
};

/**
 * Unsubscribe from network state changes
 */
export const unsubscribeFromNetworkChanges = () => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
};

/**
 * Get detailed network information
 *
 * @returns {Promise<Object>} Network state object
 */
export const getNetworkState = async () => {
  try {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      details: state.details,
    };
  } catch (error) {
    console.error('[Network Service] Failed to get network state:', error);
    return {
      isConnected: true,
      isInternetReachable: true,
      type: 'unknown',
      details: null,
    };
  }
};
