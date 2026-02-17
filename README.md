<p align="center">
  <img src="https://content.umami.is/website/images/umami-logo.png" alt="Umami Logo" width="100">
</p>

<h1 align="center">MyAnalytics - Multi-Tenant SaaS Platform</h1>

<p align="center">
  <i>A complete multi-tenant SaaS analytics platform based on Umami - privacy-first, GDPR-compliant, production-ready.</i>
</p>

<p align="center">
  <a href="https://github.com/yilmazcimuyar/my-analytics-saas/releases"><img src="https://img.shields.io/github/release/yilmazcimuyar/my-analytics-saas.svg" alt="GitHub Release" /></a>
  <a href="https://github.com/yilmazcimuyar/my-analytics-saas/blob/main/LICENSE"><img src="https://img.shields.io/github/license/yilmazcimuyar/my-analytics-saas.svg" alt="MIT License" /></a>
  <a href="https://github.com/yilmazcimuyar/my-analytics-saas/actions"><img src="https://img.shields.io/github/actions/workflow/status/yilmazcimuyar/my-analytics-saas/ci-cd.yml" alt="Build Status" /></a>
</p>

---

## 🎯 What is MyAnalytics?

MyAnalytics is a **complete SaaS implementation** of [Umami Analytics](https://umami.is) with enterprise-grade features:

- ✅ **Multi-tenancy**: Complete data isolation between teams/customers
- ✅ **Stripe Billing**: Subscription management with usage limits and quotas
- ✅ **White-Label**: Custom branding, domains, and UI per tenant
- ✅ **Team Collaboration**: Role-based access control and team management
- ✅ **Privacy-First**: GDPR compliant, no cookies, no tracking pixels
- ✅ **Production-Ready**: Docker, Kubernetes, Vercel compatible
- ✅ **Real-Time Analytics**: Live visitor tracking and custom events
- ✅ **Advanced Features**: Funnels, retention, UTM tracking, API keys

---

## 📚 Quick Links

- 🚀 **[Get Started](#quick-start)** - Run locally in 5 minutes
- 📖 **[Full Documentation](./README_SAAS.md)** - Complete API & feature docs
- 🏗️ **[Architecture Guide](./ARCHITECTURE.md)** - Data models & system design
- 🚢 **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Deploy to production
- 📋 **[Setup Instructions](./SETUP.md)** - Detailed setup for all environments
- 🔗 **[Umami Original](https://github.com/umami-software/umami)** - Based on this

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18.18+
- PostgreSQL 12.14+
- npm/pnpm

### 5-Minute Setup

```bash
# Clone and setup
git clone https://github.com/yilmazcimuyar/my-analytics-saas.git
cd my-analytics-saas
npm install --legacy-peer-deps

# Configure environment
cp .env.example .env.local 

# Setup database
npm run build-db
npm run update-db

# Start development
npm run dev
# Open http://localhost:3001
```

See **[Full Setup Guide](./SETUP.md)** for detailed instructions.

---

## 🎯 Key Features

### Analytics (From Umami)
- Privacy-focused tracking (no cookies)
- Real-time visitors
- Custom events
- UTM parameters
- Revenue tracking
- Beautiful dashboard

### SaaS Features (New)
| Feature | Hobby | Pro | Enterprise |
|---------|-------|-----|-----------|
| Monthly Events | 100K | Unlimited | Unlimited |
| Team Members | 1 | 10 | Unlimited |
| Custom Domain | ❌ | ✅ | ✅ |
| White Label | ❌ | ✅ | ✅ |
| API Keys | ✅ | ✅ | ✅ |
| Support | Community | Email | Priority |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│ Frontend (Next.js 14 + React 19)        │
│ Dashboard, Pricing, Settings            │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│ API Layer (Next.js App Router)          │
│ /api/subscriptions, /api/branding, etc  │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│ Services                                │
│ Stripe, Supabase, Database, Cache      │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│ PostgreSQL + Prisma ORM                 │
│ Multi-tenant data with RLS              │
└─────────────────────────────────────────┘
```

See **[Full Architecture](./ARCHITECTURE.md)** for detailed diagrams.

---

## 🔧 Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript,  Tailwind CSS
- **Backend**: Node.js, Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Billing**: Stripe API
- **Auth**: JWT + Supabase Auth (optional)
- **Deployment**: Vercel, Docker, Kubernetes
- **Tests**: Jest, Cypress

---

## 📦 Deployment

Deployment options for every use case:

1. **Vercel** (Recommended)
   - Zero-config deployment
   - Auto-scaling
   - Global CDN
   - Starting at $20/month

2. **Docker**
   - Full control
   - Scale anywhere
   - Self-hosted

3. **Kubernetes**
   - Enterprise-grade
   - High availability
   - Advanced scaling

See **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** for step-by-step instructions.

---

## 🔌 API Examples

### Create Subscription
```bash
curl -X POST http://localhost:3001/api/subscriptions \
  -H "x-team-id: team-123" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "plan": "PRO",
    "email": "user@example.com",
    "teamName": "My Company"
  }'
```

### Get Branding Settings
```bash
curl http://localhost:3001/api/branding \
  -H "x-team-id: team-123"
```

### Create API Key
```bash
curl -X POST http://localhost:3001/api/api-keys \
  -H "x-team-id: team-123" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Production" }'
```

See **[API Documentation](./README_SAAS.md#-api-documentation)** for complete reference.

---

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run cypress-run

# Coverage
npm test -- --coverage
```

---

## 🚢 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection |
| `STRIPE_SECRET_KEY` | ✅ | Stripe API secret (live or test) |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe webhook signing secret |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your app URL (https://yourdomain.com) |
| `JWT_SECRET` | ✅ | Secret for JWT signing |
| `NODE_ENV` | ✅ | production, development |

See **[.env.example](./.env.example)** for all variables.

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details.

This project is a SaaS fork of [Umami](https://github.com/umami-software/umami) by Umami Software, Inc.

---

## 🙏 Credits

Built on top of [Umami Analytics](https://umami.is) - the excellent open-source analytics platform.

Enhanced with:
- Multi-tenant architecture
- Stripe billing integration  
- White-label support
- Production deployment infrastructure
- Comprehensive documentation

---

## 💬 Support

- 📖 **[Full Documentation](./README_SAAS.md)**
- 🏗️ **[Architecture Guide](./ARCHITECTURE.md)**
- 🚢 **[Deployment Guide](./DEPLOYMENT_GUIDE.md)**
- 🐛 **[Report Issues](https://github.com/yilmazcimuyar/my-analytics-saas/issues)**
- 💡 **[Discussions](https://github.com/yilmazcimuyar/my-analytics-saas/discussions)**

---

**Ready to launch your analytics platform?** Start with the **[Quick Start](#quick-start)** or dive into the **[Full Documentation](./README_SAAS.md)**!

To update the Docker image, simply pull the new images and rebuild:

```bash
docker compose pull
docker compose up --force-recreate -d
```

---

## 🛟 Support

<p align="center">
  <a href="https://github.com/umami-software/umami"><img src="https://img.shields.io/badge/GitHub--blue?style=social&logo=github" alt="GitHub" /></a>
  <a href="https://twitter.com/umami_software"><img src="https://img.shields.io/badge/Twitter--blue?style=social&logo=twitter" alt="Twitter" /></a>
  <a href="https://linkedin.com/company/umami-software"><img src="https://img.shields.io/badge/LinkedIn--blue?style=social&logo=linkedin" alt="LinkedIn" /></a>
  <a href="https://umami.is/discord"><img src="https://img.shields.io/badge/Discord--blue?style=social&logo=discord" alt="Discord" /></a>
</p>

[release-shield]: https://img.shields.io/github/release/umami-software/umami.svg
[releases-url]: https://github.com/umami-software/umami/releases
[license-shield]: https://img.shields.io/github/license/umami-software/umami.svg
[license-url]: https://github.com/umami-software/umami/blob/master/LICENSE
[build-shield]: https://img.shields.io/github/actions/workflow/status/umami-software/umami/ci.yml
[build-url]: https://github.com/umami-software/umami/actions
[github-shield]: https://img.shields.io/badge/GitHub--blue?style=social&logo=github
[github-url]: https://github.com/umami-software/umami
[twitter-shield]: https://img.shields.io/badge/Twitter--blue?style=social&logo=twitter
[twitter-url]: https://twitter.com/umami_software
[linkedin-shield]: https://img.shields.io/badge/LinkedIn--blue?style=social&logo=linkedin
[linkedin-url]: https://linkedin.com/company/umami-software
[discord-shield]: https://img.shields.io/badge/Discord--blue?style=social&logo=discord
[discord-url]: https://discord.com/invite/4dz4zcXYrQ
