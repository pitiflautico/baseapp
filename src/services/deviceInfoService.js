import { Platform, Dimensions } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import config from '../config/config';

/**
 * Device Info Service
 *
 * Collects device and app information to send to the web app.
 * This allows the web app to adapt UI/features based on device capabilities.
 */

/**
 * Get comprehensive device and app information
 *
 * @returns {Object} Device info object
 */
export const getDeviceInfo = async () => {
  if (!config.FEATURES.DEVICE_INFO) {
    return null;
  }

  const { width, height } = Dimensions.get('window');
  const { INCLUDE } = config.DEVICE_INFO;

  const deviceInfo = {};

  try {
    // App information
    if (INCLUDE.APP_VERSION) {
      deviceInfo.appVersion = config.APP_VERSION;
    }

    if (INCLUDE.BUILD_NUMBER) {
      deviceInfo.buildNumber = Constants.expoConfig?.version || config.APP_VERSION;
    }

    if (INCLUDE.BUNDLE_ID) {
      deviceInfo.bundleId = Platform.OS === 'ios'
        ? config.IOS_BUNDLE_ID
        : config.ANDROID_PACKAGE;
    }

    // Platform information
    if (INCLUDE.PLATFORM) {
      deviceInfo.platform = Platform.OS; // 'ios' | 'android'
    }

    if (INCLUDE.OS_VERSION) {
      deviceInfo.osVersion = Platform.Version;
    }

    // Device information
    if (INCLUDE.DEVICE_MODEL) {
      deviceInfo.deviceModel = Device.modelName || 'Unknown';
      deviceInfo.deviceBrand = Device.brand || 'Unknown';
    }

    if (INCLUDE.DEVICE_ID) {
      // Generate a unique device ID (can be used for analytics)
      deviceInfo.deviceId = Constants.sessionId || 'unknown';
      deviceInfo.installationId = Constants.installationId || null;
    }

    // Screen information
    if (INCLUDE.SCREEN_SIZE) {
      deviceInfo.screenWidth = Math.round(width);
      deviceInfo.screenHeight = Math.round(height);
      deviceInfo.screenScale = Dimensions.get('window').scale;
    }

    // Additional useful info
    deviceInfo.isDevice = Device.isDevice; // false if simulator/emulator
    deviceInfo.deviceYearClass = Device.deviceYearClass || null;

    if (config.DEBUG) {
      console.log('[Device Info Service] Device info collected:', deviceInfo);
    }

    return deviceInfo;
  } catch (error) {
    console.error('[Device Info Service] Failed to collect device info:', error);
    return deviceInfo; // Return partial info if some fields fail
  }
};

/**
 * Format device info for sending to web app via postMessage
 *
 * @returns {Promise<Object>} Message object ready to send
 */
export const getDeviceInfoMessage = async () => {
  const deviceInfo = await getDeviceInfo();

  if (!deviceInfo) {
    return null;
  }

  return {
    action: 'deviceInfo',
    data: deviceInfo,
  };
};

/**
 * Listen for screen dimension changes (rotation, etc.)
 *
 * @param {Function} callback - Called when dimensions change
 * @returns {Object} Subscription object with remove() method
 */
export const subscribeToScreenChanges = (callback) => {
  if (!config.FEATURES.DEVICE_INFO || !config.DEVICE_INFO.INCLUDE.SCREEN_SIZE) {
    return { remove: () => {} };
  }

  return Dimensions.addEventListener('change', ({ window }) => {
    if (config.DEBUG) {
      console.log('[Device Info Service] Screen dimensions changed:', {
        width: Math.round(window.width),
        height: Math.round(window.height),
      });
    }

    callback({
      screenWidth: Math.round(window.width),
      screenHeight: Math.round(window.height),
      screenScale: window.scale,
    });
  });
};
