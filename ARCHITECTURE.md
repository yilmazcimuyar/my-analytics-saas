# SaaS Architecture & Data Models

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                        │
│  - Pages: Auth, Dashboard, Pricing, Settings, Reports          │
│  - Components: Charts, Tables, Modals                           │
│  - State: React Query, Zustand                                  │
└────────────────┬────────────────────────────────────────────────┘
                 │ HTTP/WebSocket
┌────────────────▼────────────────────────────────────────────────┐
│              Next.js API Routes + Middleware                    │
│  ├─ /api/subscriptions/* (Billing)                             │
│  ├─ /api/branding/* (White-label)                              │
│  ├─ /api/api-keys/* (Custom events)                            │
│  ├─ /api/webhooks/stripe (Webhooks)                            │
│  └─ /api/v1/* (Original Umami APIs)                            │
└────────────────┬────────────────────────────────────────────────┘
                 │
        ┌────────────────┐
        │ Auth Middleware│
        │ (JWT/Session)  │
        └────────┬───────┘
                 │
   ┌─────────────┼─────────────┐
   │             │             │
   ▼             ▼             ▼
┌────────┐ ┌──────────┐ ┌──────────┐
│Postgres│ │ Stripe   │ │ Redis    │
│(Main DB)   │ API      │ │(Cache)   │
└────────┘ └──────────┘ └──────────┘
   │             │
   └─────────────┴──────────────────┐
                                    │
                            ┌───────▼───────┐
                            │ Data Layer    │
                            │(Prisma ORM)   │
                            └───────────────┘
```

## Data Models

### Core Models (Multi-Tenancy)

#### Team (Tenant)
```prisma
model Team {
  id         String      @id @unique @map("team_id")
  name       String      @db.VarChar(50)
  accessCode String?     @unique
  logoUrl    String?
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
  deletedAt  DateTime?
  
  // Relations
  websites      Website[]
  members       TeamUser[]
  subscription  Subscription?
  branding      TenantBranding?
  apiKeys       ApiKey[]
}
```

**Key Points:**
- Each tenant is completely isolated
- Team name is unique per tenant
- Soft delete support (deletedAt field)

#### TeamUser (Team Members)
```prisma
model TeamUser {
  id        String  @id @unique
  teamId    String
  userId    String
  role      String  // "owner", "admin", "viewer"
  createdAt DateTime
  
  team Team @relation(fields: [teamId], references: [id])
  user User @relation(fields: [userId], references: [id])
}
```

**Roles:**
- `owner`: Full access, can invite users, change settings
- `admin`: Can create websites, manage team members
- `viewer`: Read-only access to reports

---

### Subscription & Billing Models

#### Subscription
```prisma
model Subscription {
  id                    String   @id @unique
  teamId                String   @unique
  plan                  String   // "HOBBY", "PRO", "ENTERPRISE"
  status                String   // "ACTIVE", "CANCELLED", "EXPIRED"
  stripeCustomerId      String?  @unique
  stripeSubscriptionId  String?  @unique
  currentPeriodStart    DateTime?
  currentPeriodEnd      DateTime?
  cancelledAt           DateTime?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  team  Team   @relation(fields: [teamId], references: [id], onDelete: Cascade)
  usage Usage[]
}
```

**Plan Limits:**
| Plan | Price | Monthly Events | Team Members | Features |
|------|-------|-----------------|--------------|----------|
| HOBBY | FREE | 100K | 1 | Basic |
| PRO | $19.99 | Unlimited | 10 | Advanced |
| ENTERPRISE | Custom | Unlimited | Unlimited | All + Support |

#### Usage
```prisma
model Usage {
  id              String   @id @unique
  subscriptionId  String
  teamId          String
  month           Int      // 1-12
  year            Int      // 2024, 2025, etc.
  eventCount      BigInt   @default(0)
  limitReached    Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  subscription    Subscription @relation(...)
  
  @@unique([subscriptionId, year, month])
}
```

**Example:**
```json
{
  "subscriptionId": "sub-123",
  "teamId": "team-456",
  "month": 2,
  "year": 2024,
  "eventCount": 47500,
  "limitReached": false
}
```

---

### Branding Models

#### TenantBranding
```prisma
model TenantBranding {
  id              String   @id @unique
  teamId          String   @unique
  primaryColor    String   @default("#0066CC")     // Hex color
  secondaryColor  String   @default("#F0F4F8")
  logoUrl         String?
  customDomain    String?  @unique
  faviconUrl      String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  team            Team     @relation(...)
}
```

**Usage:**
- Applied to dashboard UI
- Applied to public share links
- Custom domain routing

---

### API Management Models

#### ApiKey
```prisma
model ApiKey {
  id          String   @id @unique
  teamId      String
  name        String   @db.VarChar(100)  // "Production API", etc.
  key         String   @unique           // ak_prod_xxx
  secret      String                     // sk_prod_xxx (hashed in DB)
  lastUsedAt  DateTime?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  team        Team     @relation(...)
}
```

**Format:**
- Key format: `ak_` + random hex (displayed to user)
- Secret format: `sk_` + random hex (stored securely, never shown again)
- Only show secret once on creation

---

### Analytics Data Models (Unchanged from Umami)

#### Website
```prisma
model Website {
  id        String   @id @unique
  name      String
  domain    String?
  shareId   String?  @unique
  teamId    String   // Multi-tenancy key
  userId    String?
  ...
  
  team      Team     @relation(...)
  // Relations to events, sessions, etc.
}
```

**Multi-Tenancy:**
- Every Website must belong to a Team
- Queries filtered by `teamId` and `teamUser.role`

#### Session, WebsiteEvent, EventData, etc.
- Same structure as original Umami
- Filtered by website -> team isolation

---

## Multi-Tenancy Implementation

### Row-Level Security (RLS) Strategy

#### 1. Authentication Layer
```typescript
// middleware.ts - Extract team from JWT or session
export async function middleware(request: NextRequest) {
  const teamId = await extractTeamId(request);
  request.headers.set('x-team-id', teamId);
  return NextResponse.next();
}
```

#### 2. Database Queries
```typescript
// Always filter by team
async function getUserWebsites(teamId: string) {
  return db.website.findMany({
    where: {
      team: {
        id: teamId,
        members: {
          some: {
            userId: currentUserId,
            role: { in: ['owner', 'admin', 'viewer'] }
          }
        }
      }
    }
  });
}
```

#### 3. API Endpoints
```typescript
// All API routes check team authorization
export async function GET(request: NextRequest) {
  const teamId = request.headers.get('x-team-id');
  if (!teamId) return unauthorized();
  
  // Verify user is in team
  const member = await db.teamUser.findUnique({
    where: { teamId_userId: { teamId, userId } }
  });
  
  if (!member) return forbidden();
  // Process request...
}
```

---

## Request Flow Example

### 1. User Upgrades from Hobby to Pro

```
┌─ Frontend
│  └─ POST /api/subscriptions/checkout
│     ├─ Header: x-team-id = "team-123"
│     └─ Body: { plan: "PRO" }
│
├─ API Handler
│  ├─ Verify team exists
│  ├─ Create Stripe session
│  └─ Return { sessionId, redirectUrl }
│
├─ Frontend
│  └─ Redirect to -> Stripe Checkout URL
│
├─ Stripe
│  ├─ Process payment
│  ├─ Create subscription
│  └─ Send webhook to /api/webhooks/stripe
│
├─ Webhook Handler
│  ├─ Verify Stripe signature
│  ├─ Update Subscription.status = "ACTIVE"
│  └─ Update Subscription.plan = "PRO"
│
└─ Frontend
   └─ Redirect back to dashboard
      └─ Display success message
```

---

## Usage Tracking Flow

### 1. Event Is Collected

```
┌─ Tracking Script (JavaScript)
│  └─ POST /api/collect
│     ├─ websiteId: "web-123"
│     ├─ sessionId: "sess-456"
│     └─ eventName: "button_clicked"
│
├─ API Handler
│  ├─ Extract teamId from websiteId
│  ├─ Call validateAndTrackEvent(teamId, websiteId)
│  │  ├─ Check usage limit
│  │  ├─ Verify website belongs to team
│  │  └─ Increment usage counter
│  ├─ Save event to WebsiteEvent
│  └─ Return 200 OK
│
├─ Usage Increment
│  ├─ Get current month/year
│  ├─ Find Usage record
│  ├─ Increment eventCount
│  ├─ Check if limit exceeded
│  └─ Update limitReached flag
│
└─ Response
   └─ If limit reached:
      ├─ Return 429 Too Many Requests
      ├─ Header: Retry-After = 86400
      └─ Frontend: Show upgrade banner
```

---

## Data Isolation Guarantees

### 1. Database Level
- `teamId` foreign key enforces relationships
- Queries always filtered by `teamId`
- No cross-tenant data leaks possible

### 2. API Level
- Every endpoint verifies `x-team-id` header
- Unauthorized teamId = 403 Forbidden
- API keys scoped to single team

### 3. Authentication Level
- JWT token contains teamId
- User can only access teams they're members of
- Team members checked via TeamUser relation

### 4. Stripe Level
- Subscription.teamId ensures billing isolation
- Customer metadata contains teamId
- Webhook verifies team ownership

---

##Billing Cycles

### Monthly Reset
- Usage resets on 1st of each month at 00:00 UTC
- Previous month's Usage records archived
- New Usage record created automatically

### Subscription Renewal
- 30 days before expiration: Send email notification
- On renewal date: Stripe charges customer
- Webhook updates `currentPeriodEnd`

### Cancellation
- User clicks Cancel on Subscription settings
- API calls `stripe.subscriptions.del()`
- Subscription.status = "CANCELLED"
- Subscription.cancelledAt = now()
- Data retained for 30 days before deletion

---

## Security Considerations

1. **API Keys**: Stored hashed, uses bcrypt
2. **Stripe Keys**: Environment only, never in logs
3. **Team Isolation**: Every query filtered by teamId
4. **HTTPS Only**: Enforced in production
5. **CORS**: Configured for trusted domains
6. **Rate Limiting**: Implement per team/IP
7. **Audit Logs**: Log subscription changes
8. **PII**: Don' t store customer passwords

