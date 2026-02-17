# SaaS Setup Guide

This guide walks you through setting up MyAnalytics SaaS locally and for production.

## Local Development Setup

### Step 1: Prerequisites

```bash
# Check versions
node --version    # 18.18+
npm --version     # 9+
postgres --version # 12.14+
```

### Step 2: Clone & Install

```bash
git clone https://github.com/yilmazcimuyar/my-analytics-saas.git
cd my-analytics-saas

npm install --legacy-peer-deps
```

### Step 3: Database Setup

```bash
# Create database
createdb myanalytics_saas

# Create .env.local
cat > .env.local << 'EOF'
DATABASE_URL=postgresql://username:password@localhost:5432/myanalytics_saas
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development

# Stripe (Test Keys)
STRIPE_SECRET_KEY=sk_test_51234567890
STRIPE_PUBLISHABLE_KEY=pk_test_51234567890
STRIPE_WEBHOOK_SECRET=whsec_test_secret

# JWT
JWT_SECRET=your_random_secret_change_me
EOF

# Setup database schema
npm run build-db
npm run update-db
```

### Step 4: Stripe Setup for Local Development

```bash
# Install Stripe CLI
# macOS:
brew install stripe/stripe-cli/stripe

# Test API keys (use test keys from dashboard)
export STRIPE_SECRET_KEY=sk_test_xxx
export STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Start Stripe webhook forwarding
stripe listen --forward-to http://localhost:3001/api/webhooks/stripe

# Copy the signing secret and add to .env.local
# STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Step 5: Run Development Server

```bash
npm run dev

# Open http://localhost:3001
# Login with: admin / umami (default credentials)
```

---

## Production Deployment

### Option 1: Deploy to Vercel

```bash
# 1. Push code to GitHub
git push origin production-ready

# 2. Go to https://vercel.com
# 3. Import the my-analytics-saas repository
# 4. Add environment variables:

DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
JWT_SECRET=your_production_secret

# 5. Deploy!
```

### Option 2: Docker Deployment

```bash
# Build image
docker build -t my-analytics-saas:latest .

# Run container
docker run -d \
  -e DATABASE_URL="postgresql://..." \
  -e STRIPE_SECRET_KEY="sk_live_..." \
  -e STRIPE_WEBHOOK_SECRET="whsec_..." \
  -e NEXT_PUBLIC_APP_URL="https://yourdomain.com" \
  -p 3000:3000 \
  my-analytics-saas:latest

# Or use docker-compose
docker compose -f docker-compose.prod.yml up -d
```

### Option 3: Self-Hosted VPS

```bash
# 1. SSH into server
ssh user@your-server.com

# 2. Install dependencies
sudo apt update
sudo apt install -y nodejs npm postgresql

# 3. Clone repository
git clone https://github.com/yilmazcimuyar/my-analytics-saas.git
cd my-analytics-saas

# 4. Setup environment
cp .env.example .env
# Edit .env with production values

# 5. Install and build
npm install --legacy-peer-deps
npm run build
npm run update-db

# 6. Setup PM2
npm install -g pm2
pm2 start npm --name "my-analytics" -- start
pm2 save
pm2 startup

# 7. Setup Nginx reverse proxy
sudo apt install -y nginx

# 8. Create /etc/nginx/sites-available/my-analytics:
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 9. Enable site and restart Nginx
sudo ln -s /etc/nginx/sites-available/my-analytics /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 10. Setup SSL with Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Stripe Configuration Checklist

- [ ] Create Stripe account at stripe.com
- [ ] Get API keys (test and live)
- [ ] Create Pro product and price
- [ ] Create webhook at `/api/webhooks/stripe`
- [ ] Add webhook secret to environment
- [ ] Test webhook forwarding locally
- [ ] Test checkout flow
- [ ] Test upgrade/downgrade flow
- [ ] Test invoice payment
- [ ] Switch to live keys for production

---

## Environment Variables Reference

```bash
# Database (Required)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Application (Required)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
PORT=3000

# Stripe (Required for billing)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRODUCT_PRO=price_xxx

# Auth (Required)
JWT_SECRET=your_random_secret

# Optional: Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Optional: Google OAuth
GOOGLE_OAUTH_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=xxx

# Optional: Email/SMTP
EMAIL_FROM=noreply@yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASSWORD=xxx
```

---

## Monitoring & Maintenance

### Database Backups

```bash
# Backup PostgreSQL
pg_dump myanalytics_saas > backup_$(date +%Y%m%d).sql

# Restore from backup
psql myanalytics_saas < backup_20240216.sql
```

### Logs

```bash
# Vercel: Check live logs at https://vercel.com
# PM2: pm2 logs my-analytics
# Docker: docker logs container_id
```

### Performance

```bash
# Monitor database
npm run analyze-db

# Check API health
curl https://yourdomain.com/api/health
```

---

## Testing

### Unit Tests

```bash
npm test
npm test -- --coverage
```

### E2E Tests

```bash
npm run cypress-run
npm run cypress-open
```

### Load Testing

```bash
# Using Artillery
npm install -g artillery

artillery quick --count 100 --num 1000 https://yourdomain.com/api/track
```

---

## Troubleshooting

### Issue: Database connection error

```bash
# Check DATABASE_URL format
# Should be: postgresql://user:pass@host:port/dbname

# Test connection
psql $DATABASE_URL
```

### Issue: Stripe webhook not receiving events

```bash
# Check webhook secret matches
# Check endpoint URL is publicly accessible
# Check Server logs for errors
# Use Stripe CLI: stripe logs

# Retry webhook manually from Stripe Dashboard
```

### Issue: Build fails with peer dependency warning

```bash
# Use --legacy-peer-deps flag
npm install --legacy-peer-deps
npm run build --legacy-peer-deps
```

### Issue: Port already in use

```bash
# Check what's using the port
lsof -i :3000

# Kill process
kill -9 PID

# Or use different port
PORT=3002 npm start
```

---

## Next Steps

1. ✅ Setup local development environment
2. ✅ Configure Stripe test keys
3. ✅ Deploy to staging (GitHub Pages / Vercel)
4. ✅ Get Stripe production keys
5. ✅ Deploy to production
6. ✅ Setup monitoring and alerts
7. ✅ Create backup strategy

---

For more help, see the [main README](README_SAAS.md) or [GitHub Issues](https://github.com/yilmazcimuyar/my-analytics-saas/issues).
