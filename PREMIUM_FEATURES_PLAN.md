# Premium Features Implementation Plan

## Overview
TypingPeak premium tier - additional features to monetize the platform.

---

## Premium Features Ideas

### 1. **Ad-Free Experience**
- Remove all ads for premium users
- Better UI/UX without ad spaces

### 2. **Unlimited Tests**
- Free: 5 tests/day
- Premium: Unlimited tests

### 3. **Advanced Analytics**
- Detailed statistics dashboard
- WPM progress tracking
- Weak areas identification
- Export reports (PDF/CSV)

### 4. **Custom Tests**
- Upload custom text
- Create custom lessons
- Custom word lists

### 5. **Multiplayer Racing** (Paid)
- Real-time multiplayer typing race
- Leaderboards
- Global competitions

### 6. **AI-Powered Coaching**
- Personalized recommendations
- Weak key detection
- Practice suggestions

### 7. **Certification Expedited**
- Faster certificate generation
- Premium certificate design
- Unlimited certificates

### 8. **Themed Practice Packs**
- Tech terminology
- Business writing
- Coding syntax practice

### 9. **Performance Boosters**
- Extended test durations (600+ seconds)
- Slow-motion playback
- Detailed keystroke analysis

---

## Technical Implementation

### Database Schema Changes

```sql
-- Add premium_subscription table
CREATE TABLE premium_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  plan TEXT NOT NULL, -- 'monthly', 'yearly', 'lifetime'
  stripe_subscription_id TEXT UNIQUE,
  start_date TEXT NOT NULL,
  end_date TEXT,
  price_paid REAL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'expired'
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Add features_used tracking
CREATE TABLE premium_features_used (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  feature TEXT NOT NULL, -- 'custom_tests', 'ai_coaching', etc.
  used_count INTEGER DEFAULT 0,
  last_used_at TEXT,
  reset_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Add feature limits
CREATE TABLE feature_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan TEXT NOT NULL, -- 'free', 'premium_monthly', etc.
  feature TEXT NOT NULL,
  limit INTEGER, -- null = unlimited
  UNIQUE(plan, feature)
);
```

### API Endpoints Needed

```
GET  /api/premium/status              -- Check user premium status
POST /api/premium/subscribe           -- Create subscription
GET  /api/premium/plans               -- List available plans
POST /api/premium/cancel              -- Cancel subscription
GET  /api/premium/features            -- List premium features
POST /api/premium/features/use        -- Track feature usage
```

### Frontend Changes

```tsx
// 1. Premium badge/indicator
<PremiumBadge user={user} />

// 2. Feature gate component
<PremiumFeature 
  feature="custom_tests"
  fallback={<UpgradePrompt />}
>
  <CustomTestBuilder />
</PremiumFeature>

// 3. Upgrade modal/page
<UpgradePage plans={plans} />

// 4. Premium settings
<PremiumSettings user={user} />
```

### Backend Logic

```typescript
// Check if user has access to feature
async function hasFeatureAccess(userId: number, feature: string) {
  const subscription = await db
    .select()
    .from(premiumSubscriptions)
    .where(eq(premiumSubscriptions.user_id, userId))
    .limit(1);
  
  if (!subscription || subscription.status !== 'active') {
    return feature === 'free'; // Only free features
  }
  return true; // All features for premium
}

// Check feature usage limits
async function checkFeatureLimit(userId: number, feature: string) {
  const subscription = await getPremiumSubscription(userId);
  const plan = subscription?.plan || 'free';
  
  const limit = await getFeatureLimit(plan, feature);
  const used = await getFeatureUsage(userId, feature);
  
  return used < limit;
}

// Middleware to protect premium features
async function requirePremium(req, res, next) {
  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  
  const isPremium = await isPremiumUser(user.id);
  if (!isPremium) return res.status(403).json({ error: 'Premium required' });
  
  next();
}
```

---

## Payment Integration Options

### Option 1: Stripe (Recommended)
- **Cost**: 2.9% + $0.30 per transaction
- **Setup**: Easy integration with webhooks
- **Features**: Recurring billing, invoices, refunds
- **Countries**: 195+ supported

```bash
npm install stripe @stripe/react-stripe-js
```

### Option 2: Razorpay (India-focused)
- **Cost**: 2% + GST
- **Setup**: Simple API
- **Features**: Recurring, subscriptions
- **Best for**: India/South Asia

```bash
npm install razorpay
```

### Option 3: PayPal
- **Cost**: 2.9% + $0.30
- **Setup**: Moderate complexity
- **Features**: Subscriptions, invoicing
- **Global**: Yes

### Recommended: Stripe (most flexible)

---

## Pricing Strategy

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | 5 tests/day, basic analytics |
| Premium Monthly | $4.99 | Unlimited tests, advanced analytics, custom tests, no ads |
| Premium Yearly | $39.99 | All monthly + AI coaching, multiplayer |
| Premium Lifetime | $99.99 | Everything, lifetime access |

---

## Implementation Phases

### Phase 1: Database & Backend (1-2 days)
- [ ] Create subscription tables
- [ ] Add premium check middleware
- [ ] Create subscription API endpoints
- [ ] Implement feature access control

### Phase 2: Payment Integration (2-3 days)
- [ ] Setup Stripe account
- [ ] Create Stripe webhook handlers
- [ ] Implement subscription creation/cancellation
- [ ] Add payment UI

### Phase 3: Frontend (2-3 days)
- [ ] Create upgrade modal
- [ ] Add feature gates throughout app
- [ ] Build premium settings page
- [ ] Update dashboard for premium users

### Phase 4: Analytics & Monitoring (1 day)
- [ ] Track conversion rates
- [ ] Monitor subscription health
- [ ] Setup refund/cancellation tracking

---

## File Changes Needed

```
lib/db/src/schema/
  ├── premium_subscriptions.ts (NEW)
  └── feature_limits.ts (NEW)

artifacts/api-server/src/
  ├── routes/
  │   └── premium.ts (NEW)
  └── lib/
      └── premium.ts (NEW - feature checking)

artifacts/traffic-peak/src/
  ├── components/
  │   ├── PremiumBadge.tsx (NEW)
  │   ├── PremiumFeature.tsx (NEW)
  │   └── UpgradeModal.tsx (NEW)
  └── pages/
      └── premium/
          ├── plans.tsx (NEW)
          ├── settings.tsx (NEW)
          └── success.tsx (NEW)
```

---

## Security Considerations

1. **Verify subscriptions server-side** - Never trust client-side premium checks
2. **Webhook signature verification** - Validate Stripe/payment webhooks
3. **Rate limiting** - Prevent abuse of premium features
4. **Audit logs** - Track all subscription changes
5. **GDPR compliance** - Allow data export/deletion for premium users

---

## Metrics to Track

```
- Conversion rate (free → premium)
- Churn rate (cancellations/month)
- LTV (Lifetime value per user)
- Feature adoption (which features used most)
- Revenue per user
- Refund rate
```

---

## Next Steps When Ready

1. Decide on payment processor (recommend Stripe)
2. Choose pricing strategy
3. Create Stripe/payment account
4. Implement database schema
5. Build backend endpoints
6. Create payment UI
7. Add feature gates
8. Test payment flow
9. Go live!

---

## Resources

- Stripe Docs: https://stripe.com/docs
- Razorpay: https://razorpay.com/developers
- React Payment UI: https://react-stripe-js.com
- Drizzle Schema Ref: https://orm.drizzle.team/docs/sql-schema-declaration

