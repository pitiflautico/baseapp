# In-App Purchases (IAP) - Setup Guide

This guide covers the complete setup process for enabling In-App Purchases in your app using RevenueCat.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [RevenueCat Setup](#revenuecat-setup)
3. [App Store Connect Setup (iOS)](#app-store-connect-setup-ios)
4. [Google Play Console Setup (Android)](#google-play-console-setup-android)
5. [App Configuration](#app-configuration)
6. [Testing](#testing)

---

## Prerequisites

Before starting, ensure you have:

- ✅ An Apple Developer account ($99/year)
- ✅ A Google Play Developer account ($25 one-time)
- ✅ A RevenueCat account (free tier available)
- ✅ Your app uploaded to App Store Connect and Google Play Console

---

## RevenueCat Setup

### 1. Create a RevenueCat Account

1. Go to [https://app.revenuecat.com](https://app.revenuecat.com)
2. Sign up for a free account
3. Create a new project

### 2. Configure App in RevenueCat

1. **Add your app:**
   - Click "Add app"
   - Enter your app name
   - Select platform (iOS/Android)
   - Enter Bundle ID (iOS) or Package Name (Android)

2. **Get API Keys:**
   - Go to **Project Settings > API Keys**
   - Copy your **iOS API Key** (starts with `appl_`)
   - Copy your **Android API Key** (starts with `goog_`)
   - For testing, you can use the **Test Store API Key** (starts with `test_`)

3. **Configure Products (Offerings):**

   Go to **Products > Offerings**:

   - Click "Create Offering"
   - Name it "default" (or any identifier you prefer)
   - Click "Add Package" and create your subscription packages:
     - **Monthly Package**: Link to your monthly product
     - **Annual Package**: Link to your yearly product

4. **Configure Entitlements (Optional but Recommended):**

   Go to **Products > Entitlements**:

   - Click "Create Entitlement"
   - Name it "premium" (matches `config.IAP.ENTITLEMENTS.PREMIUM`)
   - Link this entitlement to your subscription products

   **Note:** Entitlements are access levels, not products. Multiple products can grant the same entitlement.

---

## App Store Connect Setup (iOS)

### 1. Create In-App Purchase Products

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app
3. Go to **Features > In-App Purchases**
4. Click the "+" button to create a new product

### 2. Create Auto-Renewable Subscriptions

For each subscription tier:

1. Click **"Auto-Renewable Subscription"**
2. Configure:
   - **Product ID**: `monthly_premium` (must match `config.IAP.SUBSCRIPTION_PRODUCTS`)
   - **Reference Name**: "Monthly Premium Subscription"
   - **Subscription Group**: Create or select a group (e.g., "Premium Subscriptions")
   - **Subscription Duration**: 1 month (or your desired duration)
   - **Price**: Set your price

3. Add localized information:
   - **Display Name**: "Monthly Premium"
   - **Description**: "Premium features with monthly billing"

4. Review and submit for approval

5. Repeat for other tiers:
   - Product ID: `yearly_premium`
   - Duration: 1 year
   - Adjust price accordingly

### 3. Configure Subscription Groups

1. Go to **Subscriptions > Subscription Groups**
2. Create a group if you haven't (e.g., "Premium Subscriptions")
3. Ensure all your subscriptions are in the same group
4. This allows users to upgrade/downgrade between tiers

### 4. Link RevenueCat to App Store Connect

1. In RevenueCat, go to **Project Settings > Apple App Store**
2. Click "Set up"
3. Follow instructions to generate and upload:
   - **App Store Server API Key** (for server-to-server notifications)
   - This enables RevenueCat to receive purchase events

---

## Google Play Console Setup (Android)

### 1. Create In-App Purchase Products

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Go to **Monetize > Subscriptions**
4. Click "Create subscription"

### 2. Configure Subscriptions

For each subscription:

1. **Product ID**: `monthly_premium` (must match `config.IAP.SUBSCRIPTION_PRODUCTS`)
2. **Name**: "Monthly Premium"
3. **Description**: "Premium features with monthly billing"
4. **Billing period**: 1 month
5. **Price**: Set your price
6. **Save and activate**

Repeat for other tiers.

### 3. Link RevenueCat to Google Play

1. In RevenueCat, go to **Project Settings > Google Play Store**
2. Click "Set up"
3. Follow instructions to:
   - Create a service account in Google Cloud Console
   - Grant necessary permissions
   - Upload the JSON key to RevenueCat

---

## App Configuration

### 1. Update `src/config/config.js`

```javascript
const config = {
  // Enable IAP feature
  FEATURES: {
    IN_APP_PURCHASES: true,
  },

  // IAP Configuration
  IAP: {
    // RevenueCat API Keys
    REVENUECAT_API_KEY_IOS: 'appl_XXXxxxXXXxxx',     // Your iOS key
    REVENUECAT_API_KEY_ANDROID: 'goog_XXXxxxXXXxxx', // Your Android key

    // App User ID mode
    USER_ID_MODE: 'custom', // or 'anonymous'

    // Product IDs (must match exactly with App Store/Play Store)
    SUBSCRIPTION_PRODUCTS: [
      'monthly_premium',
      'yearly_premium',
    ],

    // Entitlement IDs (must match RevenueCat dashboard)
    ENTITLEMENTS: {
      PREMIUM: 'premium', // The entitlement ID from RevenueCat
    },

    // Offering ID (must match RevenueCat dashboard)
    DEFAULT_OFFERING: 'default',
  },
};
```

### 2. Install Dependencies

Dependencies are already installed if you used this template. If not:

```bash
npm install react-native-purchases
npx expo prebuild --clean
```

### 3. Configure App Identifiers

Ensure your `app.json` or `app.config.js` has correct identifiers:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp"
    },
    "android": {
      "package": "com.yourcompany.yourapp"
    }
  }
}
```

---

## Testing

### 1. Test Store (Development)

For quick testing without real purchases:

1. In `src/config/config.js`, use the Test Store API key:
   ```javascript
   REVENUECAT_API_KEY_IOS: 'test_NpIFfDEYscPbGSqdbUBlopzMVaa',
   ```

2. RevenueCat Test Store simulates purchases without StoreKit
3. **Important:** Never ship with a Test Store key

### 2. Sandbox Testing (iOS)

1. **Create a Sandbox Tester:**
   - Go to App Store Connect > Users and Access > Sandbox Testers
   - Create a test account with a unique email

2. **Configure StoreKit Config File (Simulator):**
   - In Xcode, create a StoreKit Configuration file
   - Add your products with the same Product IDs
   - Select this config in scheme settings

3. **Test on Device:**
   - Sign out of App Store on the device
   - Run your app
   - When prompted, sign in with sandbox tester account
   - Make test purchases (they're free)

### 3. Internal Testing (Android)

1. **Create Internal Test Track:**
   - Go to Google Play Console > Testing > Internal testing
   - Create a release and upload your app
   - Add testers by email

2. **Test Purchases:**
   - Install app from Play Store (via internal test link)
   - Make purchases with test account
   - Purchases are real but immediately canceled/refunded

### 4. Test the Flow

Use the IAP test page to verify:

```javascript
// In src/config/config.js, temporarily set:
WEB_URL: 'http://127.0.0.1:8084/iap-test.html'

// Start local server:
python3 -m http.server 8084
```

Then:
1. Click "Load Products" → Should show your products
2. Click "Check Subscription" → Should show subscription status
3. Click "Subscribe" → Should trigger purchase flow
4. After purchase → Should show "Subscribed: true"

---

## Production Checklist

Before launching:

- [ ] Replace Test Store API key with production keys
- [ ] Set up RevenueCat webhooks for your backend (see `IAP_WEBHOOKS.md`)
- [ ] Configure server-to-server notifications (iOS & Android)
- [ ] Test subscription lifecycle (purchase, renewal, cancellation)
- [ ] Test restore purchases on new device
- [ ] Verify entitlements are correctly configured
- [ ] Update privacy policy with subscription terms
- [ ] Test on physical devices (not just simulator)

---

## Troubleshooting

### Products not loading

- Verify Product IDs match exactly (case-sensitive)
- Check products are "Ready to Submit" in App Store Connect
- Ensure StoreKit Configuration is selected (simulator)
- Wait up to 24 hours after creating products

### Purchases failing

- Check RevenueCat API keys are correct
- Verify app Bundle ID matches App Store Connect
- Ensure subscription group is configured
- Check user has valid payment method

### Subscription not showing as active

- Verify entitlements are linked to products in RevenueCat
- Check `activeSubscriptions` array in logs
- Ensure product is active and not expired

### Getting "Invalid Product ID" error

- Product IDs must match exactly between:
  - `config.js`
  - App Store Connect / Play Console
  - RevenueCat dashboard

---

## Next Steps

- [IAP Web Integration Guide](./IAP_WEB_INTEGRATION.md) - How to integrate IAP in your web app
- [IAP API Reference](./IAP_API_REFERENCE.md) - Complete API documentation
- [IAP Backend Integration](./IAP_WEBHOOKS.md) - Server-side setup

---

## Support

- RevenueCat Docs: https://docs.revenuecat.com
- Apple In-App Purchase: https://developer.apple.com/in-app-purchase/
- Google Play Billing: https://developer.android.com/google/play/billing
