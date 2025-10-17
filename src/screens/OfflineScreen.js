import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import config from '../config/config';

/**
 * OfflineScreen Component
 *
 * Displayed when there's no internet connection.
 * Shows a friendly message and retry button.
 *
 * @param {Object} props
 * @param {Function} props.onRetry - Callback when user taps "Try Again"
 */
const OfflineScreen = ({ onRetry }) => {
  if (!config.FEATURES.OFFLINE_MODE) {
    return null;
  }

  const { TITLE, MESSAGE, ICON } = config.OFFLINE_MODE.UI;
  const { ENABLED, BUTTON_TEXT } = config.OFFLINE_MODE.RETRY;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        {ICON && (
          <Text style={styles.icon}>{ICON}</Text>
        )}

        {/* Title */}
        <Text style={styles.title}>{TITLE}</Text>

        {/* Message */}
        <Text style={styles.message}>{MESSAGE}</Text>

        {/* Retry Button */}
        {ENABLED && onRetry && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRetry}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>{BUTTON_TEXT}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: config.COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: config.COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: config.COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    maxWidth: 300,
  },
  retryButton: {
    backgroundColor: config.COLORS.PRIMARY,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 160,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OfflineScreen;
