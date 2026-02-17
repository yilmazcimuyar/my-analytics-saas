# MyAnalytics - Multi-Tenant SaaS Analytics Platform

<p align="center">
  <i>A complete multi-tenant SaaS analytics platform built on Umami - privacy-focused, GDPR-compliant, and production-ready.</i>
</p>

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Stripe Configuration](#stripe-configuration)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

---

## ✨ Features

### Core Analytics (From Umami)
- ✅ Privacy-focused, GDPR-compliant analytics
- ✅ No cookies or invasive tracking
- ✅ Real-time visitor tracking
- ✅ UTM parameter tracking
- ✅ Custom events and properties
- ✅ Revenue tracking
- ✅ Beautiful, fast dashboard

### SaaS Features (New)
- ✅ **Multi-Tenancy**: Complete data isolation between teams
- ✅ **Subscription Plans**: Hobby (FREE - 100K events/month), Pro ($19/month - unlimited), Enterprise (custom)
- ✅ **Stripe Billing**: Checkout, Customer Portal, Webhooks, and usage tracking
- ✅ **White-Label Support**: Custom branding (logo, colors, domain)
- ✅ **Team Collaboration**: Invite users with role-based access (Owner, Admin, Viewer)
- ✅ **API Keys**: Custom API for sending events programmatically
- ✅ **Usage Tracking**: Real-time event counting and limit enforcement
- ✅ **Advanced Analytics**: Funnels, retention, cohort analysis
- ✅ **OAuth Support**: Google OAuth and Supabase Auth integration

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 19, TypeScript
- **Backend**: Node.js, Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Analytics Data**: ClickHouse (optional)
- **Billing**: Stripe API
- **Auth**: Supabase Auth + Google OAuth
- **Styling**: Tailwind CSS
- **UI Components**: Custom + Shadcn UI tools
- **Real-time**: WebSocket support (optional)
- **Deployment**: Vercel, Docker, or self-hosted

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18.18+ (we recommend 20+)
- PostgreSQL 12.14+
- Stripe Account (for billing features)
- npm, pnpm, or yarn package manager

### Clone & Setup

```bash
# Clone the forked repository
git clone https://github.com/YOUR-USERNAME/my-analytics-saas.git
cd my-analytics-saas

# Install dependencies
npm install --legacy-peer-deps
# or
pnpm install

# Copy environment template
cp .env.example .env.local
```

### Configure Environment Variables

Edit `.env.local` with your settings:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/myanalytics_saas

# App
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development

# Stripe (Get keys from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_your_test_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key_here
STRIPE_WEBHOOK_SECRET=whsec_test_webhook_secret_here

# Supabase (Optional - for auth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OAuth (Optional)
GOOGLE_OAUTH_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret

# JWT
JWT_SECRET=your_random_jwt_secret_change_me
```

### Database Setup

```bash
# Create PostgreSQL database
createdb myanalytics_saas

# Run migrations and seed database
npm run build-db
npm run update-db

# Create admin user (if needed)
npm run change-password
```

### Development

```bash
# Start development server
npm run dev

# Server will run on http://localhost:3001
```

### Testing

```bash
# Run tests
npm test

# Run e2e tests
npm run cypress-run

# Open Cypress UI
npm run cypress-open
```

---

## 🔑 Stripe Configuration

### Setup Stripe Products

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** section
3. Create three products:

#### Hobby Plan (Free)
- No Stripe product needed (handled in code)

#### Pro Plan ($19/month)
- Product Name: "Pro Plan"
- Pricing: $19.99/month (recurring)
- Copy the **Price ID** to `.env.local`:
  ```
  STRIPE_PRODUCT_PRO=price_test_pro_id
  ```

#### Enterprise Plan (Custom)
- Create with custom pricing

### Setup Webhooks

1. Go to **Developers** > **Webhooks**
2. Create endpoint for: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
   - `checkout.session.completed`
4. Copy the **Signing Secret** to `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_secret
   ```

### Test Stripe Locally

Use [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
# Login
stripe login

# Forward webhooks to local development
stripe listen --forward-to http://localhost:3001/api/webhooks/stripe

# Get webhook signing secret and add to .env.local
```

---

## 🐳 Docker Setup

```bash
# Build image
docker build -t my-analytics-saas .

# Run with docker-compose
docker compose up -d

# Run migrations
docker compose exec web npm run update-db
```

---

## 📡 API Documentation

### Authentication

Most API endpoints require the `x-team-id` header:

```bash
curl -H "x-team-id: team-uuid" http://localhost:3001/api/endpoint
```

### Subscriptions

#### Get Subscription
```bash
GET /api/subscriptions
Headers: x-team-id: {teamId}

Response:
{
  "subscription": {
    "id": "sub-123",
    "plan": "PRO",
    "status": "ACTIVE",
    "currentPeriodEnd": "2024-03-18T..."
  },
  "usage": {
    "eventCount": 50000
  },
  "usagePercentage": 47.6
}
```

#### Create Subscription
```bash
POST /api/subscriptions
Headers: x-team-id: {teamId}, Content-Type: application/json

Body:
{
  "action": "create",
  "plan": "HOBBY",
  "email": "user@example.com",
  "teamName": "My Company"
}
```

#### Upgrade Plan
```bash
POST /api/subscriptions
Headers: x-team-id: {teamId}, Content-Type: application/json

Body:
{
  "action": "upgrade",
  "plan": "PRO"
}
```

#### Create Checkout Session
```bash
POST /api/subscriptions/checkout
Headers: x-team-id: {teamId}, Content-Type: application/json

Body:
{
  "plan": "PRO"
}

Response:
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

### Branding

#### Get Branding Settings
```bash
GET /api/branding
Headers: x-team-id: {teamId}

Response:
{
  "id": "brand-123",
  "teamId": "team-123",
  "primaryColor": "#0066CC",
  "secondaryColor": "#F0F4F8",
  "logoUrl": "https://...",
  "customDomain": "analytics.example.com",
  "faviconUrl": "https://..."
}
```

#### Update Branding Settings
```bash
PUT /api/branding
Headers: x-team-id: {teamId}, Content-Type: application/json

Body:
{
  "primaryColor": "#FF6B35",
  "secondaryColor": "#F7F7F7",
  "logoUrl": "https://example.com/logo.png",
  "customDomain": "analytics.mycompany.com"
}
```

### API Keys

#### List API Keys
```bash
GET /api/api-keys
Headers: x-team-id: {teamId}

Response:
[
  {
    "id": "key-123",
    "name": "Production",
    "key": "ak_prod_...",
    "isActive": true,
    "lastUsedAt": "2024-02-15T...",
    "createdAt": "2024-02-01T..."
  }
]
```

#### Create API Key
```bash
POST /api/api-keys
Headers: x-team-id: {teamId}, Content-Type: application/json

Body:
{
  "name": "Production API Key"
}

Response:
{
  "id": "key-123",
  "name": "Production API Key",
  "key": "ak_prod_...",
  "secret": "sk_prod_...",  // Only shown once!
  "isActive": true,
  "createdAt": "2024-02-16..."
}
```

#### Delete API Key
```bash
DELETE /api/api-keys?id=key-123
Headers: x-team-id: {teamId}
```

---

## 📊 Usage Tracking

The platform automatically tracks monthly usage per team:

- **Free Plan**: 100K events/month
- **Pro Plan**: Unlimited
- **Enterprise**: Unlimited

When a team reaches their limit:
1. New events return HTTP 429 (Too Many Requests)
2. User sees an upgrade banner in dashboard
3. Usage is not counted until upgrade

### Reset Usage

Usage automatically resets on the 1st of each month. For testing:

```bash
npm run reset-usage  # (Optional helper script)
```

---

## 🚀 Production Deployment

### Deploy to Vercel

```bash
# Push to GitHub
git push origin main

# Go to vercel.com, import the repository
# Add environment variables in project settings
# Deployment is automatic on push

# Vercel Deploy Button
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyilmazcimuyar%2Fmy-analytics-saas&env=DATABASE_URL,STRIPE_SECRET_KEY,STRIPE_PUBLISHABLE_KEY,STRIPE_WEBHOOK_SECRET,NEXT_PUBLIC_APP_URL&envDescription=Required%20environment%20variables&envLink=https%3A%2F%2Fgithub.com%2Fyilmazcimuyar%2Fmy-analytics-saas%23environment-setup)

### Self-Hosted Deployment

```bash
# Build production bundle
npm run build

# Start production server
npm start

# Use process manager (PM2, systemd, etc.)
pm2 start npm --name "my-analytics" -- start
```

---

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run cypress-run

# Coverage report
npm test -- --coverage
```

---

## 📚 File Structure

```
my-analytics-saas/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/
│   │   │   ├── subscriptions/  # Subscription APIs
│   │   │   ├── branding/       # Branding APIs
│   │   │   ├── api-keys/       # API key management
│   │   │   ├── webhooks/       # Stripe webhooks
│   │   │   └── (main)/         # Original Umami APIs
│   │   └── (main)/             # Dashboard pages
│   ├── components/
│   │   ├── pricing/            # Pricing components
│   │   ├── subscription/       # Subscription UI
│   │   ├── branding/           # Branding settings
│   │   ├── api-keys/           # API key management
│   │   ├── marketing/          # Landing page components
│   │   └── ...                 # Original Umami components
│   ├── lib/
│   │   ├── stripe.ts           # Stripe utilities
│   │   ├── subscription.ts     # Subscription logic
│   │   ├── usage.ts            # Usage tracking
│   │   ├── eventTracking.ts    # Event validation
│   │   └── ...                 # Original Umami lib
│   └── middleware.ts           # Request middleware
├── prisma/
│   └── schema.prisma           # Enhanced with SaaS models
├── .env.example                # Environment template
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## 🔐 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Always rotate API keys periodically
3. **Database**: Use strong passwords and restrict access
4. **Stripe**: Keep webhook secrets secure
5. **HTTPS**: Always use HTTPS in production
6. **CORS**: Configure CORS properly for your domains
7. **Rate Limiting**: Consider adding rate limiting middleware
8. **Data Encryption**: Consider encrypting sensitive data at rest

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

The project is based on [Umami](https://github.com/umami-software/umami) by Umami Software, Inc.

---

## 🙋 Support

- 📖 [Documentation](./docs)
- 🐛 [Report Issues](https://github.com/yilmazcimuyar/my-analytics-saas/issues)
- 💬 [Discussions](https://github.com/yilmazcimuyar/my-analytics-saas/discussions)

---

## 🚀 Coming Soon

- [ ] AI-powered insights
- [ ] Advanced cohort analysis
- [ ] A/B testing support
- [ ] Data export features
- [ ] Slack/Email notifications
- [ ] Custom SQL queries (Enterprise)
- [ ] Advanced permissions

---

**Built with ❤️ as a SaaS version of [Umami](https://umami.is)**

