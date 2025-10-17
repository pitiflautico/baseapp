# In-App Purchases - Backend Integration (Webhooks)

This guide explains how to integrate RevenueCat webhooks with your backend to keep subscription state synchronized.

## Table of Contents

1. [Overview](#overview)
2. [Why Use Webhooks](#why-use-webhooks)
3. [Webhook Setup](#webhook-setup)
4. [Webhook Events](#webhook-events)
5. [Backend Implementation](#backend-implementation)

---

## Overview

RevenueCat sends webhooks to your backend when subscription events occur. This allows real-time subscription synchronization.

## Webhook Events

| Event | Description |
|-------|-------------|
| `INITIAL_PURCHASE` | First subscription purchase |
| `RENEWAL` | Subscription renewed |
| `CANCELLATION` | Subscription cancelled |
| `EXPIRATION` | Subscription expired |

See complete documentation at: https://docs.revenuecat.com/docs/webhooks
