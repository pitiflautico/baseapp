# Store Setup Guide (App Store Connect & Google Play Console)

This guide walks you through creating subscription and purchase products in Apple App Store Connect and Google Play Console for use with RevenueCat.

## Overview

Before your app can sell subscriptions or in-app purchases, you must:
1. Create products in App Store Connect (iOS)
2. Create products in Google Play Console (Android)
3. Configure these products in RevenueCat dashboard
4. Add product IDs to your app configuration

**Important:** Product IDs must be EXACTLY the same across iOS, Android, and RevenueCat for RevenueCat to work correctly.

---

## 🍎 iOS Setup (App Store Connect)

### Prerequisites

- Apple Developer Program membership ($99/year)
- App registered in App Store Connect
- Bundle ID configured (e.g., `com.yourcompany.appname`)

### Step 1: Access In-App Purchases

1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Go to **My Apps** → Select your app
3. Click **In-App Purchases** in the left sidebar
4. Click the **+** button to create a new in-app purchase

### Step 2: Choose Product Type

**For Subscriptions:**
- Choose **Auto-Renewable Subscription**
- Best for: Monthly/yearly premium access, recurring services

**For One-Time Purchases:**
- Choose **Non-Consumable**
- Best for: Lifetime access, permanent unlocks

**For Credits/Coins:**
- Choose **Consumable**
- Best for: Virtual currency, credits that can be purchased multiple times

### Step 3: Create Auto-Renewable Subscription

#### Reference Name
- **Example:** "Premium Monthly"
- **Note:** Internal only, users don't see this

#### Product ID
- **Format:** `monthly_premium` (lowercase, underscores, no spaces)
- **Important:** Must match exactly in Android and RevenueCat
- **Example IDs:**
  - `monthly_premium`
  - `yearly_premium`
  - `monthly_basic`
  - `lifetime_access`

#### Subscription Group
- Create a new subscription group or select existing
- **Example:** "Premium Subscriptions"
- Users can only have one subscription per group

#### Subscription Duration
- Choose: 1 week, 1 month, 2 months, 3 months, 6 months, or 1 year
- **Example:** 1 month

#### Price
- Select price tier (e.g., $9.99 USD)
- Apple handles currency conversion automatically

### Step 4: Add Localized Information

**Display Name:**
- **Example:** "Premium Monthly"
- Shown to users in App Store

**Description:**
- **Example:** "Get unlimited access to all premium features for 1 month."
- Explain what the subscription includes

**Add for all regions** where you plan to sell the app.

### Step 5: Configure Free Trial (Optional)

1. Under **Subscription Prices**, click **Set Up Offer**
2. Select **Introductory Offer**
3. Choose:
   - **Free Trial:** 3 days, 1 week, 2 weeks, 1 month, 2 months, 3 months, 6 months, or 1 year
   - **Pay As You Go:** Discounted price for first period(s)
   - **Pay Up Front:** One-time discounted payment

**Recommendation:** 7-day free trial is common and converts well.

### Step 6: Add App Store Promotional Image (Optional)

- Upload 1024x1024px image
- Shown when promoting subscription in App Store

### Step 7: Submit for Review

1. Click **Save**
2. Click **Submit for Review**
3. Provide review notes if needed
4. Wait for approval (usually 24-48 hours)

**Note:** You can test in sandbox mode before approval.

---

## 🤖 Android Setup (Google Play Console)

### Prerequisites

- Google Play Developer account ($25 one-time fee)
- App registered in Play Console
- Package name configured (e.g., `com.yourcompany.appname`)

### Step 1: Access Monetization

1. Log in to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Click **Monetize** → **Subscriptions** in left sidebar
4. Click **Create subscription**

### Step 2: Create Subscription

#### Product ID
- **Must match iOS Product ID exactly**
- **Example:** `monthly_premium`
- Cannot be changed after creation

#### Name
- **Example:** "Premium Monthly"
- Shown to users in payment flow

#### Description
- **Example:** "Get unlimited access to all premium features."
- Explain what's included

### Step 3: Configure Billing Period

1. Select **Billing period:** 1 week, 1 month, 3 months, 6 months, 1 year
2. **Example:** Every 1 month

### Step 4: Set Price

1. Click **Set price**
2. Enter base price in USD (e.g., $9.99)
3. Google auto-converts to all currencies
4. Or manually set prices for specific countries

### Step 5: Configure Free Trial (Optional)

1. Under **Free trial**, toggle **Offer free trial**
2. Select duration: 3, 7, 14, 30, 60, or 90 days
3. **Example:** 7 days

### Step 6: Add Benefits (Optional)

- List specific benefits users get with subscription
- **Example:**
  - Unlimited access to premium features
  - Ad-free experience
  - Priority support

### Step 7: Save and Activate

1. Click **Save**
2. Click **Activate**
3. Subscription is now active and can be tested

**Note:** Unlike iOS, Google doesn't require review before testing.

---

## 🎯 Product ID Naming Convention

Use consistent naming across both platforms:

### Format: `{duration}_{tier}`

**Examples:**

| Product ID | Description |
|------------|-------------|
| `monthly_premium` | Premium subscription, billed monthly |
| `yearly_premium` | Premium subscription, billed yearly |
| `monthly_basic` | Basic subscription, billed monthly |
| `lifetime_access` | One-time purchase for lifetime access |
| `100_coins` | Consumable, 100 coins pack |
| `500_coins` | Consumable, 500 coins pack |

### Best Practices:
- ✅ Use lowercase
- ✅ Use underscores for spaces
- ✅ Be descriptive but concise
- ✅ Include duration for subscriptions
- ✅ Include quantity for consumables
- ❌ No spaces
- ❌ No special characters (except underscore)
- ❌ No uppercase letters

---

## 💎 RevenueCat Configuration

After creating products in both stores, configure them in RevenueCat:

### Step 1: Add Products to RevenueCat

1. Log in to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Select your project
3. Go to **Products** in left sidebar
4. Click **+ New**

### Step 2: Enter Product Details

**Product Identifier:** `monthly_premium` (must match both stores)

**Store Product IDs:**
- **App Store:** `monthly_premium`
- **Play Store:** `monthly_premium`

**Type:** Subscription (or Non-Consumable, Consumable)

Click **Save**.

### Step 3: Create Offering

1. Go to **Offerings** in left sidebar
2. Click **+ New Offering**
3. **Identifier:** `default`
4. **Description:** Default offering shown to all users

### Step 4: Add Products to Offering

1. Click **+ Add Package**
2. Select **Package Type:**
   - **Monthly** - for monthly subscriptions
   - **Annual** - for yearly subscriptions
   - **Lifetime** - for one-time purchases
   - **Custom** - for other durations

3. Select your product from dropdown
4. Click **Save**

### Step 5: Make Offering Current

1. Click **Make Current** next to your offering
2. This offering will be returned when app calls `getOfferings()`

---

## 🔄 Sync with App Configuration

Update your app's `config.js` with the product IDs:

```javascript
IAP: {
  SUBSCRIPTION_PRODUCTS: [
    'monthly_premium',
    'yearly_premium',
  ],

  ONE_TIME_PRODUCTS: [
    'lifetime_access',
  ],

  CONSUMABLE_PRODUCTS: [
    '100_coins',
    '500_coins',
  ],

  DEFAULT_OFFERING: 'default',

  ENTITLEMENTS: {
    PREMIUM: 'premium',
  },
}
```

---

## 🧪 Testing Products

### iOS Sandbox Testing

**Create Sandbox Tester:**
1. App Store Connect → **Users and Access** → **Sandbox Testers**
2. Click **+** to add tester
3. Enter email (can be fake: `test@example.com`)
4. Set password and region
5. Click **Save**

**Test Purchase:**
1. Sign out of App Store on test device
2. Run your app (development build)
3. Attempt purchase
4. Sign in with sandbox tester when prompted
5. Complete purchase (no real charge)

**Note:** Purchases in sandbox auto-renew every 5 minutes for testing.

### Android Internal Testing

**Set Up Internal Test:**
1. Play Console → **Release** → **Testing** → **Internal testing**
2. Click **Create new release**
3. Upload APK/AAB
4. Add test users' email addresses
5. Save and publish

**Test Purchase:**
1. Add tester email to **License testing** → **License testers**
2. Install app from Play Store (internal test track)
3. Make purchase
4. Complete with real/test payment method
5. Charges are automatically refunded in sandbox

---

## 💰 Pricing Recommendations

### Subscription Pricing

| Duration | Price | Notes |
|----------|-------|-------|
| Monthly | $9.99 | Standard monthly rate |
| Yearly | $99.99 | ~17% discount (2 months free) |
| Lifetime | $299.99 | 2.5-3x yearly price |

### Pricing Psychology

- ✅ End prices in .99 (e.g., $9.99 instead of $10)
- ✅ Show yearly savings clearly ("Save $20/year")
- ✅ Offer 7-day free trial to increase conversions
- ✅ Consider regional pricing (lower prices in developing countries)

---

## 📋 Checklist: Before Going Live

### iOS Checklist
- [ ] Products created in App Store Connect
- [ ] Products submitted for review and approved
- [ ] Product IDs match exactly with Android and RevenueCat
- [ ] Subscription group configured
- [ ] Localized descriptions added for all regions
- [ ] Free trial configured (if applicable)
- [ ] Tested with sandbox tester account
- [ ] Purchases working in TestFlight

### Android Checklist
- [ ] Products created in Google Play Console
- [ ] Products activated
- [ ] Product IDs match exactly with iOS and RevenueCat
- [ ] Prices set for all regions
- [ ] Free trial configured (if applicable)
- [ ] Tested with internal test track
- [ ] Purchases working in closed testing

### RevenueCat Checklist
- [ ] Products added to RevenueCat dashboard
- [ ] Store product IDs configured correctly
- [ ] Offering created and set as current
- [ ] Packages added to offering
- [ ] Entitlements configured
- [ ] API keys added to app config
- [ ] Webhook configured and tested
- [ ] Tested purchases syncing correctly

---

## ⚠️ Common Issues

### Product ID Mismatch
**Problem:** iOS product works but Android doesn't (or vice versa)
**Solution:** Ensure Product IDs are EXACTLY the same on both platforms and RevenueCat

### Products Not Found
**Problem:** App can't load products
**Solution:**
- Check API keys are correct
- Verify products are active/approved
- Ensure offering is set as current in RevenueCat

### "Cannot connect to iTunes Store" (iOS)
**Problem:** Sandbox purchase fails
**Solution:**
- Sign out of App Store completely
- Restart device
- Try again with sandbox credentials

### "Item already owned" (Android)
**Problem:** Can't purchase again after testing
**Solution:**
- Go to Play Store → Account → Payments & subscriptions → Budget & history
- Cancel test subscription
- Or use different test account

---

## 📚 Related Documentation

- [IAP_TESTING.md](./IAP_TESTING.md) - Complete testing guide
- [IAP_COMPLETE_GUIDE.md](./IAP_COMPLETE_GUIDE.md) - Master setup guide
- [IN_APP_PURCHASES.md](./IN_APP_PURCHASES.md) - System overview

---

## 🔗 External Resources

**Apple:**
- [App Store Connect](https://appstoreconnect.apple.com)
- [In-App Purchase Documentation](https://developer.apple.com/in-app-purchase/)
- [Subscription Best Practices](https://developer.apple.com/app-store/subscriptions/)

**Google:**
- [Google Play Console](https://play.google.com/console)
- [In-App Products Documentation](https://developer.android.com/google/play/billing)
- [Subscription Documentation](https://developer.android.com/google/play/billing/subscriptions)

**RevenueCat:**
- [RevenueCat Dashboard](https://app.revenuecat.com)
- [RevenueCat Documentation](https://docs.revenuecat.com)
- [Product Setup Guide](https://docs.revenuecat.com/docs/entitlements)

---

**Last Updated:** 2025-10-16
