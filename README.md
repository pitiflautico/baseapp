# Universal Base App - Expo + WebView

A production-ready Expo template for building universal iOS and Android apps that load web applications through WebView with native functionality.

## 🎯 What is This?

This is a **reusable base application** that allows you to wrap any web application in a native iOS/Android shell with:

- ✅ **WebView Integration** - Load any web app URL
- ✅ **Push Notifications** - Native push via Expo
- ✅ **Deep Linking** - Universal links and custom URL schemes
- ✅ **Native Sharing** - Share content from your app
- ✅ **In-App Purchases** (optional) - Subscriptions and one-time purchases via RevenueCat
- ✅ **Authentication Storage** - Secure token storage with SecureStore
- ✅ **Error Handling** - Graceful fallbacks and error screens
- ✅ **Cross-Platform** - Single codebase for iOS and Android

**Perfect for:**
- Converting existing web apps to native apps
- Building MVPs quickly with web tech
- Apps that need native features but web-based UI
- Testing app store viability before full native development

---

## 📁 Project Structure

```
app-base/
├── app.config.js                # Expo configuration (dynamic)
├── src/
│   ├── config/
│   │   └── config.js            # ⚙️ Central configuration (edit this!)
│   ├── services/
│   │   ├── notificationService.js  # Push notifications
│   │   ├── authService.js          # Authentication storage
│   │   ├── deepLinkService.js      # Deep linking
│   │   └── iapService.js           # In-app purchases (optional)
│   ├── contexts/
│   │   ├── AuthContext.js          # Global auth state
│   │   └── SubscriptionContext.js  # Global subscription state (optional)
│   ├── features/
│   │   └── purchaseHandler.js      # IAP event handlers (optional)
│   ├── screens/
│   │   ├── WebViewScreen.js        # Main WebView screen
│   │   ├── ErrorScreen.js          # Error fallback
│   │   └── LoadingScreen.js        # Loading state
│   └── App.js                      # App entry point
└── docs/
    ├── IN_APP_PURCHASES.md         # IAP system overview
    ├── IAP_COMPLETE_GUIDE.md       # IAP setup guide (start here)
    ├── IAP_API.md                  # Web ↔ Native communication
    ├── BACKEND_IAP_ENDPOINTS.md    # Backend API spec
    ├── IAP_WEBHOOKS.md             # Webhook configuration
    ├── STORE_SETUP.md              # Store configuration
    └── IAP_TESTING.md              # Testing procedures
```

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone this base app
cp -r app-base my-new-app
cd my-new-app

# Install dependencies
npm install
```

### 2. Configure Your App

Edit `src/config/config.js`:

```javascript
const config = {
  // Your web application URL
  WEB_URL: 'https://your-web-app.com',

  // App information
  APP_TITLE: 'My App',
  APP_SLUG: 'myapp',
  APP_VERSION: '1.0.0',

  // iOS bundle identifier
  IOS_BUNDLE_ID: 'com.yourcompany.myapp',

  // Android package name
  ANDROID_PACKAGE: 'com.yourcompany.myapp',

  // Feature flags
  FEATURES: {
    PUSH_NOTIFICATIONS: true,
    SHARING: true,
    DEEP_LINKING: true,
    IN_APP_PURCHASES: false, // Enable if needed
  },

  // ... more configuration
};
```

### 3. Run Development Build

```bash
# Start Expo dev server
npx expo start

# Build development builds
npx expo run:ios      # iOS
npx expo run:android  # Android
```

---

## ⚙️ Configuration

All app configuration is centralized in `src/config/config.js`. Edit this file to customize your app without touching core logic.

### Essential Settings

```javascript
// WebView URL - the web app to load
WEB_URL: 'https://your-app.com'

// App identity
APP_TITLE: 'My App'
APP_SLUG: 'myapp'
IOS_BUNDLE_ID: 'com.yourcompany.myapp'
ANDROID_PACKAGE: 'com.yourcompany.myapp'

// Deep linking scheme
DEEP_LINK_SCHEME: 'myapp' // Allows myapp://path URLs

// Theme colors (for native screens)
COLORS: {
  PRIMARY: '#007AFF',
  BACKGROUND: '#FFFFFF',
  ERROR: '#FF3B30',
  // ...
}
```

### Feature Flags

Enable/disable features without changing code:

```javascript
FEATURES: {
  PUSH_NOTIFICATIONS: true,  // Native push notifications
  SHARING: true,             // Native share sheet
  DEEP_LINKING: true,        // URL schemes + universal links
  IN_APP_PURCHASES: false,   // Subscriptions (requires setup)
}
```

**Important:** When a feature is disabled, **zero traces** of that feature appear in the build. This prevents App Store/Play Store issues with features you don't use.

---

## 🔔 Push Notifications

Push notifications are powered by Expo's push notification service.

### Setup

1. Get your Expo Project ID:
   - Go to [expo.dev](https://expo.dev)
   - Select your project → Project settings
   - Copy **Project ID**

2. Configure in `config.js`:
   ```javascript
   EXPO_PROJECT_ID: 'your-project-id-here'
   ```

3. Your web app can send push tokens to backend:
   ```javascript
   // Native sends token to web via postMessage
   window.addEventListener('message', (event) => {
     const data = JSON.parse(event.data);
     if (data.pushToken) {
       // Send token to your backend
       sendTokenToBackend(data.pushToken);
     }
   });
   ```

4. Send push notifications from backend:
   ```bash
   curl -X POST https://exp.host/--/api/v2/push/send \
     -H "Content-Type: application/json" \
     -d '{
       "to": "ExponentPushToken[xxx]",
       "title": "Hello",
       "body": "World",
       "data": {"url": "/notifications"}
     }'
   ```

---

## 🔗 Deep Linking

Deep linking allows URLs to open your app.

### Custom URL Schemes

**Configuration:**
```javascript
DEEP_LINK_SCHEME: 'myapp'
```

**Usage:**
- `myapp://calendar` opens your app at `/calendar`
- `myapp://profile/123` opens `/profile/123`

### Universal Links (iOS) / App Links (Android)

**Configuration:**
```javascript
ASSOCIATED_DOMAINS: [
  'myapp.com',
  'www.myapp.com',
]
```

**Requirements:**
- Serve `.well-known/apple-app-site-association` (iOS)
- Serve `.well-known/assetlinks.json` (Android)

**Usage:**
- `https://myapp.com/calendar` opens your app (if installed)
- Otherwise opens in browser

---

## 💳 In-App Purchases (Optional)

**Status:** ⚠️ Disabled by default

Enable subscriptions and one-time purchases for premium features.

### Quick Enable

1. Set feature flag:
   ```javascript
   FEATURES: {
     IN_APP_PURCHASES: true
   }
   ```

2. Install dependency:
   ```bash
   npm install react-native-purchases
   ```

3. Follow complete setup guide:
   **[📖 docs/IAP_COMPLETE_GUIDE.md](./docs/IAP_COMPLETE_GUIDE.md)**

### What You Get

- ✅ Cross-platform subscriptions (iOS + Android)
- ✅ RevenueCat integration (handles receipts, validation)
- ✅ Web ↔ Native communication for purchases
- ✅ Backend webhook integration
- ✅ Sandbox testing support
- ✅ Production-ready code

### IAP Documentation

- **[IAP_COMPLETE_GUIDE.md](./docs/IAP_COMPLETE_GUIDE.md)** - Start here: Complete setup walkthrough
- **[IN_APP_PURCHASES.md](./docs/IN_APP_PURCHASES.md)** - System architecture overview
- **[IAP_API.md](./docs/IAP_API.md)** - Web ↔ Native communication protocol
- **[BACKEND_IAP_ENDPOINTS.md](./docs/BACKEND_IAP_ENDPOINTS.md)** - Backend API implementation
- **[IAP_WEBHOOKS.md](./docs/IAP_WEBHOOKS.md)** - Webhook setup and validation
- **[STORE_SETUP.md](./docs/STORE_SETUP.md)** - App Store & Play Console configuration
- **[IAP_TESTING.md](./docs/IAP_TESTING.md)** - Testing with sandbox environments

**Estimated setup time:** 4-6 hours

---

## 🌐 Web ↔ Native Communication

Your web app can communicate with the native layer via `postMessage`.

### Web → Native

```javascript
// Check if running in native app
if (window.ReactNativeWebView) {
  // Send message to native
  window.ReactNativeWebView.postMessage(JSON.stringify({
    action: 'share',
    title: 'Check this out!',
    url: 'https://example.com'
  }));
}
```

### Native → Web

```javascript
// Listen for messages from native
window.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);

  if (data.action === 'deepLink') {
    // Handle deep link
    navigateTo(data.url);
  }
});
```

### Supported Actions

**Web → Native:**
- `share` - Open native share sheet
- `purchase` - Initiate IAP purchase (if enabled)
- `restorePurchases` - Restore IAP purchases (if enabled)
- `getSubscriptionStatus` - Query IAP status (if enabled)
- `getProducts` - Get available IAP products (if enabled)

**Native → Web:**
- `deepLink` - App opened via deep link
- `pushToken` - Push notification token registered
- `subscriptionUpdated` - IAP subscription changed (if enabled)
- `purchaseFailed` - IAP purchase failed (if enabled)

---

## 🔐 Authentication

Secure authentication token storage using Expo SecureStore.

### Save Tokens (Native)

```javascript
import * as authService from './services/authService';

// Save authentication
await authService.saveAuthData({
  userId: '123',
  token: 'jwt-token-here'
});
```

### Read Tokens (Native)

```javascript
const authData = await authService.getAuthData();
if (authData) {
  console.log('User ID:', authData.userId);
  console.log('Token:', authData.token);
}
```

### Web Integration

```javascript
// Native auto-injects token into URL
// Your web app receives it as query param
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (token) {
  // Use token for API calls
  setAuthToken(token);
}
```

---

## 🎨 Customization

### Native Screens

The app includes minimal native screens that you can customize:

**LoadingScreen.js** - Shown while WebView loads
**ErrorScreen.js** - Shown if WebView fails to load

Colors are configured in `config.js`:

```javascript
COLORS: {
  PRIMARY: '#007AFF',
  SECONDARY: '#5856D6',
  BACKGROUND: '#FFFFFF',
  ERROR: '#FF3B30',
  TEXT_PRIMARY: '#000000',
}
```

### Error Messages

Customize error messages in `config.js`:

```javascript
ERROR_MESSAGES: {
  NO_CONNECTION: 'No internet connection. Please check your network.',
  FAILED_TO_LOAD: 'Failed to load the application. Please try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again later.',
}
```

---

## 🧪 Development Workflow

### Local Development

```bash
# Start Expo dev server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Run on physical device
# Scan QR code with Expo Go app
```

### Testing with Local Web Server

Point `WEB_URL` to your local server:

```javascript
WEB_URL: 'http://192.168.1.100:3000' // Your local IP
```

### Debug Logging

Enable detailed logs in development:

```javascript
DEBUG: __DEV__, // Automatically true in dev mode
SHOW_DEV_ERRORS: __DEV__,
```

---

## 📦 Building for Production

### iOS (App Store)

```bash
# Build with EAS
eas build --platform ios --profile production

# Or local build
npx expo run:ios --configuration Release
```

**Requirements:**
- Apple Developer account ($99/year)
- Configured bundle ID in `config.js`
- App created in App Store Connect

### Android (Play Store)

```bash
# Build with EAS
eas build --platform android --profile production

# Or local build
npx expo run:android --variant release
```

**Requirements:**
- Google Play Developer account ($25 one-time)
- Configured package name in `config.js`
- App created in Play Console
- Signed APK/AAB

---

## 🚨 Pre-Build Checklist

Before building for production, verify:

### Configuration
- [ ] `WEB_URL` points to production URL
- [ ] `APP_TITLE`, `APP_SLUG` configured
- [ ] `IOS_BUNDLE_ID`, `ANDROID_PACKAGE` configured
- [ ] `APP_VERSION` is correct
- [ ] `EXPO_PROJECT_ID` set for push notifications
- [ ] `DEEP_LINK_SCHEME` configured
- [ ] `ASSOCIATED_DOMAINS` configured (if using universal links)

### Features
- [ ] Unused features disabled in `FEATURES`
- [ ] IAP configured if enabled (see IAP checklist in docs)
- [ ] Push notifications tested
- [ ] Deep linking tested

### App Store / Play Store
- [ ] App created in App Store Connect (iOS)
- [ ] App created in Play Console (Android)
- [ ] Icons and splash screens added
- [ ] Privacy policy URL ready
- [ ] Terms of service URL ready

---

## 📝 Git Workflow Recommendation

Since this is a reusable base:

### Option 1: Branch Per App

```bash
# Keep main branch clean (template)
git checkout -b app/my-new-app

# Make app-specific changes
# Configure, test, deploy

# Merge only generic improvements back to main
git checkout main
git merge app/my-new-app --no-commit
# Selectively stage only template improvements
```

### Option 2: Fork Per App

```bash
# Clone base for each new app
cp -r app-base my-new-app
cd my-new-app
git init
git remote add upstream ../app-base

# Pull template updates later
git fetch upstream
git merge upstream/main
```

---

## 🐛 Troubleshooting

### WebView Not Loading

**Check:**
- `WEB_URL` is correct and accessible
- Network connection available
- No CORS issues (native WebView ignores CORS)

**Solution:** Check console logs and error screen

### Push Notifications Not Working

**Check:**
- `EXPO_PROJECT_ID` configured correctly
- Permissions granted on device
- Token registered successfully

**Solution:** Check `notificationService.js` logs

### Deep Links Not Working

**iOS:**
- Associated domains file served correctly
- Bundle ID matches

**Android:**
- Asset links file served correctly
- Package name matches

**Solution:** Test with `npx uri-scheme open myapp://test`

### IAP Issues

See [IAP_TESTING.md](./docs/IAP_TESTING.md) troubleshooting section.

---

## 📚 Additional Resources

### Expo Documentation
- [Expo Docs](https://docs.expo.dev/)
- [WebView](https://docs.expo.dev/versions/latest/sdk/webview/)
- [Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Deep Linking](https://docs.expo.dev/guides/linking/)

### App Store Submission
- [iOS App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Android Play Store Policies](https://play.google.com/about/developer-content-policy/)

### This Project
- [IAP Complete Guide](./docs/IAP_COMPLETE_GUIDE.md)
- [All IAP Documentation](./docs/)

---

## 🤝 Contributing

Since this is a base template, improvements are welcome:

**Bug fixes:** Always merge to main
**Feature additions:** Consider if it's generic enough for all apps
**App-specific code:** Keep in your app's branch/fork

---

## 📄 License

MIT License - Use this base app for any project, commercial or personal.

---

## 🎉 You're Ready!

1. Configure `src/config/config.js`
2. Run `npm install`
3. Test with `npx expo start`
4. Build and deploy

**Questions?** Check the [docs/](./docs/) folder for detailed guides.

**Need IAP?** Start with [IAP_COMPLETE_GUIDE.md](./docs/IAP_COMPLETE_GUIDE.md)

---

**Last Updated:** 2025-10-16
