# Backend IAP Endpoints

This document describes the backend API endpoints needed to support In-App Purchases with RevenueCat.

## Overview

Your backend needs to implement these endpoints to:
- Receive webhook events from RevenueCat
- Sync subscription status with your database
- Provide subscription status to the web application
- Handle subscription-related operations

---

## 🔗 Required Endpoints

### 1. RevenueCat Webhook Endpoint

**Endpoint:** `POST /api/webhooks/revenuecat`

**Purpose:** Receive purchase events from RevenueCat (initial purchase, renewal, cancellation, etc.)

**Authentication:** RevenueCat webhook signature validation (see IAP_WEBHOOKS.md)

**Request Body Example:**
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

**Event Types to Handle:**
- `INITIAL_PURCHASE` - First subscription purchase
- `RENEWAL` - Subscription renewed
- `CANCELLATION` - Subscription cancelled (but still active until expiry)
- `UNCANCELLATION` - User re-enabled auto-renew
- `NON_RENEWING_PURCHASE` - One-time purchase
- `EXPIRATION` - Subscription expired
- `BILLING_ISSUE` - Payment failed
- `PRODUCT_CHANGE` - User upgraded/downgraded

**Response:**
```json
{
  "success": true
}
```

**Implementation Example (Node.js/Express):**
```javascript
app.post('/api/webhooks/revenuecat', async (req, res) => {
  try {
    // 1. Validate webhook signature (see IAP_WEBHOOKS.md)
    if (!validateRevenueCatWebhook(req)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { event } = req.body;
    const userId = event.app_user_id;
    const eventType = event.type;

    // 2. Update user subscription in database
    await updateUserSubscription(userId, {
      productId: event.product_id,
      entitlements: event.entitlement_ids,
      purchasedAt: new Date(event.purchased_at_ms),
      expiresAt: event.expiration_at_ms ? new Date(event.expiration_at_ms) : null,
      status: getStatusFromEventType(eventType),
      environment: event.environment,
      store: event.store,
    });

    // 3. Handle specific event types
    switch (eventType) {
      case 'INITIAL_PURCHASE':
        await handleInitialPurchase(userId, event);
        break;
      case 'RENEWAL':
        await handleRenewal(userId, event);
        break;
      case 'CANCELLATION':
        await handleCancellation(userId, event);
        break;
      case 'EXPIRATION':
        await handleExpiration(userId, event);
        break;
      // ... handle other events
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

---

### 2. Sync Subscription Status

**Endpoint:** `POST /api/users/:userId/subscription/sync`

**Purpose:** App calls this after successful purchase to ensure backend is in sync

**Authentication:** Bearer token (user must be authenticated)

**Request Body:**
```json
{
  "customerId": "user_123",
  "activeEntitlements": ["premium"],
  "subscriptions": ["monthly_premium"]
}
```

**Response:**
```json
{
  "success": true,
  "subscription": {
    "isActive": true,
    "productId": "monthly_premium",
    "expiresAt": "2024-12-01T00:00:00Z",
    "entitlements": ["premium"]
  }
}
```

**Implementation Example:**
```javascript
app.post('/api/users/:userId/subscription/sync', authenticateUser, async (req, res) => {
  const { userId } = req.params;
  const { customerId, activeEntitlements, subscriptions } = req.body;

  // Verify user matches authenticated user
  if (req.user.id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    // Update subscription in database
    const subscription = await updateUserSubscription(userId, {
      customerId,
      entitlements: activeEntitlements,
      productIds: subscriptions,
      lastSyncedAt: new Date(),
    });

    res.json({
      success: true,
      subscription: {
        isActive: subscription.isActive,
        productId: subscription.productId,
        expiresAt: subscription.expiresAt,
        entitlements: subscription.entitlements,
      },
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Failed to sync subscription' });
  }
});
```

---

### 3. Get Subscription Status

**Endpoint:** `GET /api/users/:userId/subscription/status`

**Purpose:** Web application queries current subscription status

**Authentication:** Bearer token (user must be authenticated)

**Response:**
```json
{
  "isSubscribed": true,
  "subscription": {
    "productId": "monthly_premium",
    "status": "active",
    "expiresAt": "2024-12-01T00:00:00Z",
    "willRenew": true,
    "entitlements": ["premium"],
    "purchasedAt": "2024-11-01T00:00:00Z",
    "store": "APP_STORE"
  }
}
```

**Possible Status Values:**
- `active` - Subscription is active
- `cancelled` - Cancelled but still active until expiry
- `expired` - Subscription has expired
- `grace_period` - Payment failed, in grace period
- `trial` - In trial period

**Implementation Example:**
```javascript
app.get('/api/users/:userId/subscription/status', authenticateUser, async (req, res) => {
  const { userId } = req.params;

  if (req.user.id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const subscription = await getUserSubscription(userId);

    if (!subscription) {
      return res.json({
        isSubscribed: false,
        subscription: null,
      });
    }

    const now = new Date();
    const isActive = subscription.expiresAt && subscription.expiresAt > now;

    res.json({
      isSubscribed: isActive,
      subscription: {
        productId: subscription.productId,
        status: subscription.status,
        expiresAt: subscription.expiresAt,
        willRenew: subscription.willRenew,
        entitlements: subscription.entitlements,
        purchasedAt: subscription.purchasedAt,
        store: subscription.store,
      },
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});
```

---

### 4. Get Purchase History

**Endpoint:** `GET /api/users/:userId/subscription/history`

**Purpose:** (Optional) Get user's purchase history

**Authentication:** Bearer token

**Response:**
```json
{
  "purchases": [
    {
      "id": "purchase_1",
      "productId": "monthly_premium",
      "purchasedAt": "2024-11-01T00:00:00Z",
      "expiresAt": "2024-12-01T00:00:00Z",
      "store": "APP_STORE",
      "price": 9.99,
      "currency": "USD",
      "status": "active"
    },
    {
      "id": "purchase_2",
      "productId": "monthly_premium",
      "purchasedAt": "2024-10-01T00:00:00Z",
      "expiresAt": "2024-11-01T00:00:00Z",
      "store": "APP_STORE",
      "price": 9.99,
      "currency": "USD",
      "status": "expired"
    }
  ]
}
```

---

## 📊 Database Schema Recommendation

**Table: `user_subscriptions`**

```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  revenue_cat_customer_id VARCHAR(255),
  product_id VARCHAR(255),
  status VARCHAR(50), -- active, cancelled, expired, grace_period, trial
  entitlements JSONB, -- ["premium"]
  purchased_at TIMESTAMP,
  expires_at TIMESTAMP,
  will_renew BOOLEAN DEFAULT true,
  store VARCHAR(50), -- APP_STORE, PLAY_STORE
  environment VARCHAR(50), -- PRODUCTION, SANDBOX
  last_synced_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);
```

**Table: `subscription_events` (optional, for audit trail)**

```sql
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(100), -- INITIAL_PURCHASE, RENEWAL, etc.
  product_id VARCHAR(255),
  revenue_cat_event_id VARCHAR(255) UNIQUE,
  event_data JSONB,
  received_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscription_events_user_id ON subscription_events(user_id);
```

---

## 🔐 Authentication & Security

### User Authentication
All endpoints (except webhook) must validate:
1. Valid JWT/session token
2. User ID in token matches `:userId` in URL
3. Token hasn't expired

### Webhook Validation
The RevenueCat webhook endpoint must:
1. Validate webhook signature (see IAP_WEBHOOKS.md)
2. Check event hasn't been processed before (use `event.id`)
3. Be idempotent (same event processed multiple times = same result)

---

## 🧪 Testing

### Test Webhook Locally

1. Use RevenueCat Sandbox mode
2. Make a test purchase in sandbox
3. Use ngrok to expose local server:
   ```bash
   ngrok http 3000
   ```
4. Configure webhook URL in RevenueCat:
   ```
   https://your-ngrok-url.ngrok.io/api/webhooks/revenuecat
   ```

### Test Endpoints

```bash
# Sync subscription
curl -X POST http://localhost:3000/api/users/user_123/subscription/sync \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "user_123",
    "activeEntitlements": ["premium"],
    "subscriptions": ["monthly_premium"]
  }'

# Get status
curl http://localhost:3000/api/users/user_123/subscription/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden",
  "message": "You don't have access to this resource"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "Failed to process request"
}
```

---

## 🔄 Sync Strategy

### When to Sync

**App should sync with backend:**
1. After successful purchase
2. After restore purchases
3. On app launch (if last sync > 24 hours)
4. Before accessing premium features

**Backend should update:**
1. On webhook event from RevenueCat
2. On explicit sync request from app

### Conflict Resolution

If app and webhook update at same time:
- Use `last_synced_at` timestamp
- Webhook data is source of truth
- App sync is best-effort

---

## 📚 Related Documentation

- [IAP_WEBHOOKS.md](./IAP_WEBHOOKS.md) - Webhook configuration and validation
- [IAP_API.md](./IAP_API.md) - Web ↔ Native communication protocol
- [IAP_COMPLETE_GUIDE.md](./IAP_COMPLETE_GUIDE.md) - Complete setup guide

---

## 💡 Best Practices

1. **Idempotency:** Handle duplicate webhook events gracefully
2. **Validation:** Always validate webhook signatures
3. **Logging:** Log all subscription events for debugging
4. **Monitoring:** Set up alerts for failed webhooks
5. **Testing:** Test with sandbox before production
6. **Security:** Never trust client-side subscription status alone
7. **Performance:** Cache subscription status to avoid DB lookups

---

**Last Updated:** 2025-10-16
