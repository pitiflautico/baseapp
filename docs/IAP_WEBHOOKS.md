# RevenueCat Webhooks Configuration

This document explains how to configure and validate webhooks from RevenueCat to your backend.

## Overview

RevenueCat sends webhook events to your backend when subscription events occur (purchase, renewal, cancellation, etc.). This ensures your backend database stays in sync with the actual subscription state.

---

## 🔧 Setup in RevenueCat Dashboard

### Step 1: Access Webhook Settings

1. Log in to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Select your project
3. Navigate to **Project Settings** → **Integrations** → **Webhooks**
4. Click **+ Add Webhook**

### Step 2: Configure Webhook URL

**Webhook URL:** `https://your-api.com/api/webhooks/revenuecat`

**Important:**
- Must be HTTPS (HTTP not allowed in production)
- Must be publicly accessible
- Should respond within 5 seconds
- Must return `200 OK` on success

**For Development:**
Use ngrok to expose your local server:
```bash
ngrok http 3000
# Use: https://abc123.ngrok.io/api/webhooks/revenuecat
```

### Step 3: Select Events

Check the events you want to receive:

**Recommended Events:**
- ✅ `INITIAL_PURCHASE` - First subscription
- ✅ `RENEWAL` - Subscription renewed
- ✅ `CANCELLATION` - User cancelled (still active until expiry)
- ✅ `UNCANCELLATION` - User re-enabled auto-renew
- ✅ `EXPIRATION` - Subscription expired
- ✅ `BILLING_ISSUE` - Payment failed
- ✅ `PRODUCT_CHANGE` - Upgrade/downgrade

**Optional Events:**
- `NON_RENEWING_PURCHASE` - One-time purchases
- `SUBSCRIBER_ALIAS` - User ID changed
- `TRANSFER` - Subscription transferred

### Step 4: Get Authorization Header

RevenueCat will show you an **Authorization header** like:
```
Bearer sk_1234567890abcdef
```

**Save this securely** - you'll need it to validate webhook signatures.

---

## 🔐 Webhook Signature Validation

### Why Validate?

- Prevent fake webhook calls from attackers
- Ensure events are from RevenueCat
- Protect your backend from malicious data

### How RevenueCat Signs Webhooks

RevenueCat includes a signature in the `Authorization` header:
```
Authorization: Bearer sk_1234567890abcdef
```

This is a **shared secret** between you and RevenueCat.

### Validation Implementation

#### Node.js/Express

```javascript
const crypto = require('crypto');

function validateRevenueCatWebhook(req) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    console.error('Missing Authorization header');
    return false;
  }

  // Extract token
  const token = authHeader.replace('Bearer ', '');

  // Compare with your saved authorization header from RevenueCat
  const expectedToken = process.env.REVENUECAT_WEBHOOK_TOKEN; // sk_1234567890abcdef

  if (token !== expectedToken) {
    console.error('Invalid webhook token');
    return false;
  }

  return true;
}

// Usage in endpoint
app.post('/api/webhooks/revenuecat', (req, res) => {
  if (!validateRevenueCatWebhook(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Process webhook...
  res.json({ success: true });
});
```

#### Python/Flask

```python
import os
from flask import Flask, request, jsonify

app = Flask(__name__)

def validate_revenuecat_webhook():
    auth_header = request.headers.get('Authorization')

    if not auth_header:
        return False

    token = auth_header.replace('Bearer ', '')
    expected_token = os.environ.get('REVENUECAT_WEBHOOK_TOKEN')

    return token == expected_token

@app.route('/api/webhooks/revenuecat', methods=['POST'])
def revenuecat_webhook():
    if not validate_revenuecat_webhook():
        return jsonify({'error': 'Unauthorized'}), 401

    # Process webhook...
    return jsonify({'success': True})
```

#### PHP/Laravel

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class WebhookController extends Controller
{
    public function revenueCat(Request $request)
    {
        if (!$this->validateRevenueCatWebhook($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Process webhook...
        return response()->json(['success' => true]);
    }

    private function validateRevenueCatWebhook(Request $request)
    {
        $authHeader = $request->header('Authorization');

        if (!$authHeader) {
            return false;
        }

        $token = str_replace('Bearer ', '', $authHeader);
        $expectedToken = env('REVENUECAT_WEBHOOK_TOKEN');

        return $token === $expectedToken;
    }
}
```

---

## 📦 Webhook Event Structure

### Common Event Format

```json
{
  "api_version": "1.0",
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "INITIAL_PURCHASE",
    "app_user_id": "user_123",
    "aliases": ["user_123"],
    "original_app_user_id": "user_123",
    "product_id": "monthly_premium",
    "period_type": "NORMAL",
    "purchased_at_ms": 1699564800000,
    "expiration_at_ms": 1702243200000,
    "environment": "PRODUCTION",
    "entitlement_ids": ["premium"],
    "entitlement_id": "premium",
    "presented_offering_id": "default",
    "transaction_id": "1000000123456789",
    "original_transaction_id": "1000000123456789",
    "is_family_share": false,
    "country_code": "US",
    "app_id": "1234567890",
    "currency": "USD",
    "price": 9.99,
    "price_in_purchased_currency": 9.99,
    "subscriber_attributes": {
      "$email": "user@example.com"
    },
    "store": "APP_STORE"
  }
}
```

### Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique event ID (use for deduplication) |
| `type` | string | Event type (INITIAL_PURCHASE, RENEWAL, etc.) |
| `app_user_id` | string | Your user ID |
| `product_id` | string | Product identifier |
| `purchased_at_ms` | number | Purchase timestamp (milliseconds) |
| `expiration_at_ms` | number | Expiration timestamp (null for lifetime) |
| `environment` | string | PRODUCTION or SANDBOX |
| `entitlement_ids` | array | List of active entitlements |
| `store` | string | APP_STORE or PLAY_STORE |
| `price` | number | Price in USD |
| `currency` | string | Currency code |

---

## 📝 Event Types and Handling

### INITIAL_PURCHASE

**When:** User purchases a subscription for the first time

**Action:**
- Create subscription record in database
- Grant premium access
- Send welcome email (optional)

```javascript
async function handleInitialPurchase(event) {
  await db.subscriptions.create({
    userId: event.app_user_id,
    productId: event.product_id,
    status: 'active',
    purchasedAt: new Date(event.purchased_at_ms),
    expiresAt: new Date(event.expiration_at_ms),
    store: event.store,
  });

  await grantPremiumAccess(event.app_user_id);
  await sendWelcomeEmail(event.app_user_id);
}
```

### RENEWAL

**When:** Subscription automatically renewed

**Action:**
- Update expiration date
- Ensure premium access continues

```javascript
async function handleRenewal(event) {
  await db.subscriptions.update(
    { userId: event.app_user_id },
    {
      expiresAt: new Date(event.expiration_at_ms),
      status: 'active',
    }
  );
}
```

### CANCELLATION

**When:** User cancelled auto-renewal (subscription still active until expiry)

**Action:**
- Mark as cancelled but keep active
- Schedule reminder before expiration

```javascript
async function handleCancellation(event) {
  await db.subscriptions.update(
    { userId: event.app_user_id },
    {
      status: 'cancelled',
      willRenew: false,
      cancelledAt: new Date(),
    }
  );

  // Schedule email before expiration
  await scheduleExpirationReminder(event.app_user_id, event.expiration_at_ms);
}
```

### UNCANCELLATION

**When:** User re-enabled auto-renewal

**Action:**
- Mark as active again

```javascript
async function handleUncancellation(event) {
  await db.subscriptions.update(
    { userId: event.app_user_id },
    {
      status: 'active',
      willRenew: true,
    }
  );
}
```

### EXPIRATION

**When:** Subscription expired (no longer active)

**Action:**
- Revoke premium access
- Send resubscribe email

```javascript
async function handleExpiration(event) {
  await db.subscriptions.update(
    { userId: event.app_user_id },
    { status: 'expired' }
  );

  await revokePremiumAccess(event.app_user_id);
  await sendResubscribeEmail(event.app_user_id);
}
```

### BILLING_ISSUE

**When:** Payment failed (grace period)

**Action:**
- Mark as grace period
- Notify user to update payment method

```javascript
async function handleBillingIssue(event) {
  await db.subscriptions.update(
    { userId: event.app_user_id },
    { status: 'grace_period' }
  );

  await sendPaymentFailedEmail(event.app_user_id);
}
```

### PRODUCT_CHANGE

**When:** User upgraded/downgraded subscription

**Action:**
- Update product ID
- Adjust pricing

```javascript
async function handleProductChange(event) {
  await db.subscriptions.update(
    { userId: event.app_user_id },
    {
      productId: event.product_id,
      expiresAt: new Date(event.expiration_at_ms),
    }
  );
}
```

---

## 🔄 Idempotency (Prevent Duplicate Processing)

### Why Idempotency Matters

RevenueCat may send the same webhook multiple times if:
- Your server took too long to respond
- Network issue during response
- RevenueCat retries

### Implementation

```javascript
async function processWebhook(event) {
  // Check if event already processed
  const existingEvent = await db.webhookEvents.findOne({
    revenueCatEventId: event.id,
  });

  if (existingEvent) {
    console.log(`Event ${event.id} already processed, skipping`);
    return { success: true, skipped: true };
  }

  // Process event...
  await handleEvent(event);

  // Save event to prevent reprocessing
  await db.webhookEvents.create({
    revenueCatEventId: event.id,
    eventType: event.type,
    userId: event.app_user_id,
    processedAt: new Date(),
    eventData: event,
  });

  return { success: true };
}
```

---

## 🧪 Testing Webhooks

### Test in Sandbox

1. Make a sandbox purchase in your app
2. RevenueCat sends webhook to your configured URL
3. Check your server logs

### Manually Trigger Test Webhook

RevenueCat dashboard allows sending test webhooks:

1. Go to **Integrations** → **Webhooks**
2. Click **Test** next to your webhook
3. Select event type
4. Click **Send Test**

### Example Test Event

RevenueCat will send:
```json
{
  "api_version": "1.0",
  "event": {
    "id": "test-event-123",
    "type": "TEST",
    "app_user_id": "test_user",
    "environment": "SANDBOX",
    ...
  }
}
```

---

## ⚠️ Error Handling

### Retry Logic

If your endpoint fails (status ≠ 200), RevenueCat will retry:
- Retry up to 3 times
- With exponential backoff (1s, 5s, 15s)

### Your Endpoint Should:

```javascript
app.post('/api/webhooks/revenuecat', async (req, res) => {
  try {
    // 1. Validate signature FIRST
    if (!validateRevenueCatWebhook(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 2. Respond FAST (within 5 seconds)
    // Don't do heavy processing here
    const { event } = req.body;

    // 3. Queue event for async processing (optional)
    await queue.add('process-webhook', event);

    // 4. Return success immediately
    res.json({ success: true });

    // 5. Process event asynchronously
    // (do NOT wait for this to finish before responding)
  } catch (error) {
    console.error('Webhook error:', error);

    // Return error status so RevenueCat retries
    res.status(500).json({ error: 'Internal error' });
  }
});
```

---

## 📊 Monitoring

### Log All Webhooks

```javascript
async function logWebhook(event) {
  await db.webhookLogs.create({
    eventId: event.id,
    eventType: event.type,
    userId: event.app_user_id,
    receivedAt: new Date(),
    payload: event,
  });
}
```

### Set Up Alerts

Monitor for:
- Failed webhook validations
- Processing errors
- Unusual event patterns

### RevenueCat Dashboard

Check webhook delivery status:
- **Integrations** → **Webhooks** → **Delivery Logs**

---

## 🔍 Troubleshooting

### Webhook Not Received

**Check:**
1. URL is correct in RevenueCat dashboard
2. Server is publicly accessible (not localhost)
3. HTTPS is configured correctly
4. Firewall allows RevenueCat IPs

**RevenueCat IPs (whitelist these):**
- Check latest IPs in RevenueCat docs

### Signature Validation Failing

**Check:**
1. Authorization token matches exactly
2. No extra spaces or newlines
3. Environment variable is set correctly

### Events Duplicated

**Solution:** Implement idempotency (see above)

---

## 📚 Related Documentation

- [BACKEND_IAP_ENDPOINTS.md](./BACKEND_IAP_ENDPOINTS.md) - Backend API implementation
- [IAP_COMPLETE_GUIDE.md](./IAP_COMPLETE_GUIDE.md) - Complete setup guide

---

## 💡 Best Practices

1. ✅ **Always validate** webhook signatures
2. ✅ **Respond quickly** (< 5 seconds)
3. ✅ **Be idempotent** (handle duplicate events)
4. ✅ **Log everything** for debugging
5. ✅ **Use queues** for heavy processing
6. ✅ **Monitor** webhook delivery
7. ✅ **Test in sandbox** before production

---

**Last Updated:** 2025-10-16
