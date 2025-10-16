# IAP Pre-Build Checklist

**Complete verification checklist before building production apps with In-App Purchases enabled.**

Use this checklist to ensure all IAP components are properly configured before submitting your app to the App Store or Play Store.

---

## 📋 Quick Reference

**Status Indicators:**
- ✅ Required (app won't work without it)
- ⚠️ Recommended (app works but not optimal)
- 🔵 Optional (nice to have)

---

## 🔧 Configuration (`src/config/config.js`)

### Feature Flag

- [ ] ✅ `FEATURES.IN_APP_PURCHASES` set to `true`
- [ ] ✅ All unused features disabled (to minimize app size)

### RevenueCat API Keys

- [ ] ✅ `REVENUECAT_API_KEY_IOS` contains production key (starts with `appl_`)
- [ ] ✅ `REVENUECAT_API_KEY_ANDROID` contains production key (starts with `goog_`)
- [ ] ✅ Test keys removed (no `test_` keys in production)
- [ ] ⚠️ API keys stored securely (consider environment variables)

### Product IDs

- [ ] ✅ `SUBSCRIPTION_PRODUCTS` contains at least one product ID
- [ ] ✅ Product IDs match exactly with iOS and Android stores
- [ ] ✅ Product IDs use lowercase and underscores only
- [ ] ⚠️ `ONE_TIME_PRODUCTS` configured if using lifetime purchases
- [ ] ⚠️ `CONSUMABLE_PRODUCTS` configured if using coins/credits

### User ID Mode

- [ ] ✅ `USER_ID_MODE` set to `'custom'` (recommended) or `'anonymous'`
- [ ] ✅ If `'custom'`: AuthContext provides valid user IDs

### Entitlements

- [ ] ✅ `ENTITLEMENTS.PREMIUM` configured with entitlement ID
- [ ] ✅ Entitlement ID matches RevenueCat dashboard
- [ ] ⚠️ Additional entitlements configured if using multiple tiers

### Backend API

- [ ] ✅ `BACKEND_API.BASE_URL` points to production server
- [ ] ✅ `BACKEND_API.WEBHOOK_URL` is publicly accessible HTTPS URL
- [ ] ✅ Endpoint paths configured correctly
- [ ] ⚠️ `AUTO_SYNC_BACKEND` set to `true` (recommended)

### Storage Keys

- [ ] ✅ Storage keys don't conflict with other app data
- [ ] ✅ Keys are unique to your app

### Error Messages

- [ ] ⚠️ Error messages customized for your app's tone
- [ ] ⚠️ Messages localized if supporting multiple languages

---

## 📱 iOS Configuration

### App Store Connect

- [ ] ✅ Apple Developer account active ($99/year paid)
- [ ] ✅ App created in App Store Connect
- [ ] ✅ Bundle ID matches `config.js` (`IOS_BUNDLE_ID`)
- [ ] ✅ In-App Purchases capability enabled
- [ ] ✅ At least one subscription product created
- [ ] ✅ All products **approved** by Apple
- [ ] ✅ Subscription group created and configured
- [ ] ✅ Products have localized names and descriptions
- [ ] ⚠️ Free trial configured (increases conversions)
- [ ] ⚠️ Promotional images added (for App Store marketing)
- [ ] ⚠️ Subscription benefits clearly described

### App-Specific Shared Secret

- [ ] ✅ App-Specific Shared Secret generated in App Store Connect
- [ ] ✅ Shared Secret added to RevenueCat iOS app configuration
- [ ] ✅ Shared Secret not committed to version control

### Sandbox Testing

- [ ] ✅ Sandbox tester account created
- [ ] ✅ Tested purchase flow with sandbox account
- [ ] ✅ Tested restore purchases
- [ ] ✅ Subscription status syncs correctly
- [ ] ⚠️ Tested subscription renewal (wait 5+ minutes in sandbox)
- [ ] ⚠️ Tested subscription cancellation

### Xcode Project

- [ ] ✅ In-App Purchase capability enabled in Xcode
- [ ] ✅ Correct bundle ID in Xcode matches App Store Connect
- [ ] ✅ Correct team selected
- [ ] ✅ App builds without errors
- [ ] ⚠️ react-native-purchases dependency installed

---

## 🤖 Android Configuration

### Google Play Console

- [ ] ✅ Google Play Developer account active ($25 paid)
- [ ] ✅ App created in Play Console
- [ ] ✅ Package name matches `config.js` (`ANDROID_PACKAGE`)
- [ ] ✅ At least one subscription product created
- [ ] ✅ All products **activated** in Play Console
- [ ] ✅ Product IDs match exactly with iOS
- [ ] ✅ Products have descriptions and pricing
- [ ] ⚠️ Free trial configured (increases conversions)
- [ ] ⚠️ Subscription benefits listed

### Service Account Credentials

- [ ] ✅ Google Cloud service account created
- [ ] ✅ Service account JSON key downloaded
- [ ] ✅ Service account granted permissions in Play Console
- [ ] ✅ JSON key uploaded to RevenueCat Android app configuration
- [ ] ✅ JSON key not committed to version control

### Internal Testing

- [ ] ✅ Internal test track created
- [ ] ✅ Test users added to license testing
- [ ] ✅ Tested purchase flow with test account
- [ ] ✅ Tested restore purchases
- [ ] ✅ Subscription status syncs correctly
- [ ] ⚠️ Tested with closed testing (production billing)

### Android Manifest

- [ ] ✅ Billing permission in AndroidManifest.xml
- [ ] ✅ Correct package name in manifest
- [ ] ✅ App builds without errors
- [ ] ⚠️ react-native-purchases dependency installed

---

## 🌐 RevenueCat Dashboard

### Project Setup

- [ ] ✅ RevenueCat project created
- [ ] ✅ iOS app added and configured
- [ ] ✅ Android app added and configured
- [ ] ✅ Both apps use same project

### Products

- [ ] ✅ All products added to RevenueCat dashboard
- [ ] ✅ Product IDs match exactly across:
  - App Store Connect
  - Play Console
  - RevenueCat
  - config.js
- [ ] ✅ Product types set correctly (subscription, non-consumable, consumable)

### Offerings

- [ ] ✅ At least one offering created
- [ ] ✅ Offering marked as **Current**
- [ ] ✅ Products added to offering as packages
- [ ] ✅ Package types set correctly (MONTHLY, ANNUAL, LIFETIME, etc.)
- [ ] ⚠️ Offering ID matches `config.js` (`DEFAULT_OFFERING`)

### Entitlements

- [ ] ✅ Entitlement created (e.g., "premium")
- [ ] ✅ Entitlement ID matches `config.js` (`ENTITLEMENTS.PREMIUM`)
- [ ] ✅ Products linked to entitlements
- [ ] ⚠️ Multiple entitlements configured if using tiers

### Webhooks

- [ ] ✅ Webhook URL configured
- [ ] ✅ Webhook URL is publicly accessible HTTPS
- [ ] ✅ All recommended events selected:
  - INITIAL_PURCHASE
  - RENEWAL
  - CANCELLATION
  - UNCANCELLATION
  - EXPIRATION
  - BILLING_ISSUE
- [ ] ✅ Webhook authorization token saved securely
- [ ] ✅ Webhook tested with sandbox purchase
- [ ] ⚠️ Webhook delivery logs show successful deliveries

### API Keys

- [ ] ✅ Production iOS API key copied to config.js
- [ ] ✅ Production Android API key copied to config.js
- [ ] ✅ API keys not exposed in client-side code (only in config)
- [ ] ⚠️ Keys stored in environment variables (for backend)

---

## 🖥️ Backend Implementation

### Database Schema

- [ ] ✅ `user_subscriptions` table created
- [ ] ✅ Table has required columns:
  - user_id
  - product_id
  - status
  - entitlements
  - expires_at
  - store
- [ ] ⚠️ `subscription_events` table created (for audit log)
- [ ] ⚠️ Indexes created on user_id and expires_at

### Webhook Endpoint

- [ ] ✅ Endpoint created: `POST /api/webhooks/revenuecat`
- [ ] ✅ Endpoint is publicly accessible
- [ ] ✅ HTTPS configured (not HTTP)
- [ ] ✅ Webhook signature validation implemented
- [ ] ✅ Authorization token checked correctly
- [ ] ✅ Event deduplication implemented (check event.id)
- [ ] ✅ Endpoint responds within 5 seconds
- [ ] ✅ Endpoint returns 200 OK on success
- [ ] ✅ Error handling implemented
- [ ] ⚠️ Async processing implemented (don't block response)
- [ ] ⚠️ Logging implemented for debugging
- [ ] ⚠️ Monitoring/alerting configured for failures

### Subscription Status Endpoint

- [ ] ✅ Endpoint created: `GET /api/users/:userId/subscription/status`
- [ ] ✅ Requires authentication (Bearer token)
- [ ] ✅ Validates user ID matches authenticated user
- [ ] ✅ Returns correct subscription data
- [ ] ✅ Returns `isSubscribed: false` when no subscription
- [ ] ⚠️ Caching implemented to reduce DB load

### Subscription Sync Endpoint

- [ ] ✅ Endpoint created: `POST /api/users/:userId/subscription/sync`
- [ ] ✅ Requires authentication
- [ ] ✅ Updates subscription status in database
- [ ] ✅ Returns current subscription data
- [ ] ⚠️ Rate limiting implemented (prevent abuse)

### Purchase History Endpoint (Optional)

- [ ] 🔵 Endpoint created: `GET /api/users/:userId/subscription/history`
- [ ] 🔵 Returns purchase history
- [ ] 🔵 Requires authentication

### Security

- [ ] ✅ All endpoints use HTTPS
- [ ] ✅ Authentication required on user endpoints
- [ ] ✅ Webhook signature validated
- [ ] ✅ Input validation implemented
- [ ] ✅ SQL injection prevention (parameterized queries)
- [ ] ✅ Error messages don't expose sensitive data
- [ ] ⚠️ Rate limiting implemented
- [ ] ⚠️ Request logging for security audit

### Testing

- [ ] ✅ Webhook tested with sandbox purchase
- [ ] ✅ Status endpoint tested
- [ ] ✅ Sync endpoint tested
- [ ] ⚠️ Load testing performed (can handle expected traffic)

---

## 🌐 Web Application Integration

### postMessage Implementation

- [ ] ✅ Web app checks for `window.ReactNativeWebView`
- [ ] ✅ Purchase button sends `purchase` message
- [ ] ✅ Restore button sends `restorePurchases` message
- [ ] ✅ Status requested on page load (`getSubscriptionStatus`)
- [ ] ✅ Products requested for pricing page (`getProducts`)
- [ ] ✅ Message listener implemented
- [ ] ✅ All IAP actions handled:
  - subscriptionUpdated
  - purchaseFailed
  - purchasesRestored
  - subscriptionStatus
  - availableProducts
- [ ] ⚠️ Fallback implemented for non-native (web browser)

### UI/UX

- [ ] ✅ Subscription page exists
- [ ] ✅ Pricing displayed clearly
- [ ] ✅ Benefits listed
- [ ] ✅ Purchase buttons functional
- [ ] ✅ Restore purchases button visible
- [ ] ✅ Loading states implemented
- [ ] ✅ Error messages shown to user
- [ ] ✅ Success messages shown after purchase
- [ ] ⚠️ Free trial prominently displayed (if offering)
- [ ] ⚠️ Cancellation policy linked
- [ ] ⚠️ Privacy policy linked
- [ ] ⚠️ Terms of service linked

### Backend Verification

- [ ] ✅ Premium features check subscription status via backend
- [ ] ✅ Backend status is source of truth (not client-side)
- [ ] ✅ Access denied if subscription expired
- [ ] ⚠️ Grace period handling implemented

---

## 🧪 Testing Completed

### Sandbox Testing (iOS)

- [ ] ✅ New purchase tested
- [ ] ✅ Restore purchases tested
- [ ] ✅ Subscription status updates in app
- [ ] ✅ Premium features unlock
- [ ] ✅ Cancel subscription tested
- [ ] ⚠️ Subscription renewal tested (wait 5+ minutes)
- [ ] ⚠️ Subscription expiration tested

### Internal Testing (Android)

- [ ] ✅ New purchase tested
- [ ] ✅ Restore purchases tested
- [ ] ✅ Subscription status updates in app
- [ ] ✅ Premium features unlock
- [ ] ✅ Cancel subscription tested
- [ ] ⚠️ Subscription renewal tested
- [ ] ⚠️ Subscription expiration tested

### Backend Testing

- [ ] ✅ Webhook receives events
- [ ] ✅ Database updates correctly
- [ ] ✅ Status endpoint returns correct data
- [ ] ✅ Sync endpoint works
- [ ] ⚠️ Webhook retries tested (simulate timeout)

### Edge Cases

- [ ] ✅ Purchase cancellation (user backs out) handled gracefully
- [ ] ✅ Network error during purchase handled
- [ ] ✅ Invalid product ID handled
- [ ] ✅ Multiple simultaneous purchases prevented
- [ ] ⚠️ Subscription upgrade/downgrade tested
- [ ] ⚠️ Subscription cancellation → reactivation tested

### Cross-Platform

- [ ] ✅ Purchase on iOS, restore on Android (and vice versa)
- [ ] ✅ Subscription status syncs across platforms
- [ ] ✅ Same user ID used on both platforms

---

## 📱 App Store / Play Store Submission

### iOS App Store

- [ ] ✅ App builds successfully for production
- [ ] ✅ Archive uploaded to App Store Connect
- [ ] ✅ TestFlight build tested (production mode)
- [ ] ✅ In-App Purchases enabled in app submission
- [ ] ✅ Privacy policy URL provided
- [ ] ✅ Terms of service URL provided
- [ ] ✅ Screenshots include subscription UI
- [ ] ✅ App description mentions premium features
- [ ] ⚠️ Subscription benefits clearly described in store listing

### Android Play Store

- [ ] ✅ App builds successfully for production
- [ ] ✅ AAB uploaded to Play Console
- [ ] ✅ Closed testing completed (production mode)
- [ ] ✅ Subscription products reviewed and active
- [ ] ✅ Privacy policy URL provided
- [ ] ✅ Terms of service URL provided
- [ ] ✅ Screenshots include subscription UI
- [ ] ✅ App description mentions premium features
- [ ] ⚠️ Subscription benefits clearly described in store listing

---

## 🚨 Final Pre-Flight Checks

### Code Review

- [ ] ✅ No test API keys in code
- [ ] ✅ No hardcoded credentials
- [ ] ✅ Debug logging disabled in production
- [ ] ✅ Error logging enabled
- [ ] ✅ Analytics tracking implemented (optional but recommended)
- [ ] ⚠️ Code reviewed by second developer

### Documentation

- [ ] ✅ README updated with IAP setup instructions
- [ ] ✅ Backend team briefed on webhook handling
- [ ] ✅ Support team briefed on subscription management
- [ ] ⚠️ User-facing documentation created (FAQ, help center)

### Monitoring

- [ ] ✅ RevenueCat dashboard access configured for team
- [ ] ✅ Backend error logging configured
- [ ] ✅ Webhook delivery monitoring configured
- [ ] ⚠️ Alerts configured for:
  - Failed webhook deliveries
  - High refund rates
  - Backend errors
- [ ] ⚠️ Analytics tracking for:
  - Purchase funnel conversion
  - Subscription churn rate
  - Revenue metrics

### Legal & Compliance

- [ ] ✅ Privacy policy mentions in-app purchases
- [ ] ✅ Terms of service includes subscription terms
- [ ] ✅ Cancellation policy clearly stated
- [ ] ✅ Refund policy clearly stated
- [ ] ⚠️ Legal review completed (especially for EU, California)
- [ ] ⚠️ GDPR compliance verified (if serving EU users)

---

## ✅ Sign-Off

Once all required (✅) items are checked:

**Developer Sign-Off:**
- [ ] All required configuration completed
- [ ] All required testing completed
- [ ] No known blockers

**Date:** _______________
**Name:** _______________

**Backend Lead Sign-Off:**
- [ ] Backend endpoints implemented and tested
- [ ] Webhook handling verified
- [ ] Monitoring configured

**Date:** _______________
**Name:** _______________

**QA Sign-Off:**
- [ ] All test scenarios passed
- [ ] Edge cases tested
- [ ] Cross-platform tested

**Date:** _______________
**Name:** _______________

---

## 📊 Checklist Summary

Count your checkmarks:

**Required Items (✅):** ____ / ____
**Recommended Items (⚠️):** ____ / ____
**Optional Items (🔵):** ____ / ____

**Minimum to proceed:** All required items (✅) must be checked.

---

## 🚀 Post-Launch Checklist

After launching to production:

**First 24 Hours:**
- [ ] Monitor RevenueCat dashboard for purchases
- [ ] Check webhook delivery logs
- [ ] Verify subscriptions appear in backend database
- [ ] Monitor app reviews for IAP-related issues
- [ ] Check support tickets for purchase problems

**First Week:**
- [ ] Review conversion rates
- [ ] Check refund requests
- [ ] Analyze failed purchases
- [ ] Monitor subscription churn
- [ ] Review error logs

**First Month:**
- [ ] Analyze subscription renewals
- [ ] Review pricing effectiveness
- [ ] Consider A/B testing different offers
- [ ] Evaluate promotional strategies
- [ ] Plan improvements based on data

---

## 🔗 Related Documentation

- [IAP_COMPLETE_GUIDE.md](./IAP_COMPLETE_GUIDE.md) - Complete setup walkthrough
- [IAP_TESTING.md](./IAP_TESTING.md) - Testing procedures
- [BACKEND_IAP_ENDPOINTS.md](./BACKEND_IAP_ENDPOINTS.md) - Backend implementation
- [IAP_WEBHOOKS.md](./IAP_WEBHOOKS.md) - Webhook configuration

---

## 💡 Tips

- **Don't rush:** IAP setup is complex. Take time to verify each step.
- **Test thoroughly:** Sandbox testing prevents production issues.
- **Monitor closely:** Watch for issues in first week after launch.
- **Iterate:** Use data to improve conversion and retention.
- **Support users:** Be responsive to subscription-related support requests.

---

**Last Updated:** 2025-10-16

**Version:** 1.0
