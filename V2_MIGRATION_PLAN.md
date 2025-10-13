# Blockchain-Ads Platform V2: Migration & Architecture Plan (Fastify)

## Executive Summary

Migration from Firebase Functions monolith to Google Cloud Run microservices architecture with Fastify framework, managed databases, and modern frontend stack.

**Timeline:** 6 months
**Team:** 2-3 developers
**Cost Impact:** 15-50% reduction
**Performance:** 2-3x faster than NestJS

---

## ⚠️ Important Naming Convention

**TrafficEngine Service** (formerly named "PropellerAds" in V1 codebase)

The service referred to as "PropellerAds" throughout the V1 codebase is **NOT** the external PropellerAds network. This is our **internal ad traffic routing and campaign distribution system**. The name "PropellerAds" was kept from when we initially used the external PropellerAds service, but we have since stopped using it and built our own system.

**V2 Migration Renaming:**
- ❌ Old: `PropellerAds`, `propellerAds`, `campaignsPropellers`
- ✅ New: `TrafficEngine`, `trafficEngine`, `campaignsTrafficEngine`

This document uses the new naming convention (TrafficEngine) to avoid confusion.

---

## 1. Current State (V1)

### Backend Architecture
- **Runtime:** Node.js 18, JavaScript
- **Framework:** Express.js 4.18.2
- **Hosting:** Firebase Functions (mixed v1/v2)
- **Database:** Firestore only
- **Cache:** None
- **Search:** Meilisearch 0.49.0
- **Background Jobs:** Firestore triggers
- **Deployment:** `firebase deploy --only functions`

### Frontend Architecture
- **Framework:** React 18.2.0 (Create React App)
- **Language:** JavaScript
- **State:** Context API
- **Styling:** Sass + Material-UI
- **Routing:** React Router DOM
- **Build:** react-scripts
- **Deployment:** Firebase Hosting

### Infrastructure
- **Cold Starts:** 2-5 seconds
- **Timeout Limit:** 9 minutes
- **Memory Limit:** 8GB
- **Scaling:** Limited by Firebase Functions
- **Monitoring:** Telegram bot notifications
- **Secrets:** Google Secret Manager (production), .env files (development)

### Cost Structure
```
Firebase Functions: $1,400/month
Firebase Firestore: $900/month
Firebase Hosting: $150/month
External Services: $700/month
Total: $3,150/month
```

---

## 2. Target State (V2)

### Backend Architecture
- **Runtime:** Node.js 20 LTS, TypeScript
- **Framework:** Fastify 5+
- **Security:** @fastify/helmet
- **Validation:** Zod (fastify-type-provider-zod)
- **Query Builder:** Knex.js
- **Hosting:** Google Cloud Run
- **Primary Database:** Cloud SQL (PostgreSQL 15)
- **Document Database:** Firestore (reduced usage)
- **Cache:** Memorystore (Redis)
- **Analytics Database:** BigQuery
- **Search:** TypeSense / Elasticsearch
- **Background Jobs:** Cloud Tasks + Pub/Sub
- **Deployment:** `gcloud run deploy --source .`

### Frontend Architecture
- **Framework:** Next.js 14
- **Language:** TypeScript
- **State:** Zustand + TanStack Query
- **Styling:** Tailwind CSS + shadcn/ui
- **Build:** Turbopack / Vite
- **Deployment:** Firebase Hosting (same as V1)

### Infrastructure
- **Cold Starts:** <10ms (min instances)
- **Timeout Limit:** 60 minutes
- **Memory Limit:** 32GB
- **Scaling:** 0 to 1000+ instances per service
- **Monitoring:** Cloud Logging + Cloud Monitoring
- **Secrets:** Secret Manager

### Cost Structure
```
Cloud Run: $300-480/month
Cloud SQL: $150-250/month
Memorystore Redis: $100-150/month
Firestore (reduced): $150-250/month
BigQuery: $100-200/month
API Gateway: $50-100/month
Cloud Tasks/Pub/Sub: $30-70/month
Cloud Storage: $80-160/month
Firebase Hosting: $25-50/month
Cloud Logging: $30-60/month
Secret Manager: $10/month
External Services: $500-700/month
Total: $1,550-2,695/month

Savings: $500-1,600/month (15-50%)
```

---

## 3. Architecture Comparison

### V1 Architecture
```
React (CRA) → Firebase Hosting
     ↓
Firebase Functions (Express monolith)
     ↓
Firestore + Meilisearch
     ↓
External APIs (TrafficEngine, Revive, Stripe)
```

### V2 Architecture
```
Next.js → Firebase Hosting
     ↓
API Gateway
     ↓
Cloud Run Services (6 microservices - Fastify)
├── Auth Service
├── Campaign Service
├── Payment Service
├── Analytics Service
├── Pixel Tracking Service (Go)
└── Publisher Service
     ↓
Databases
├── Cloud SQL (PostgreSQL + Knex.js)
├── Memorystore (Redis)
├── Firestore (reduced)
└── BigQuery (analytics)
     ↓
External APIs
```

---

## 4. Technology Stack Changes

### Backend Changes

| Component | V1 | V2 | Reason |
|-----------|----|----|--------|
| Language | JavaScript | TypeScript | Type safety, fewer bugs |
| Framework | Express.js | **Fastify 5+** | 2-3x faster, native TypeScript, schema validation |
| Security | None | **@fastify/helmet** | Security headers, OWASP protection |
| Validation | Joi | **Zod + fastify-type-provider-zod** | TypeScript-first, automatic inference |
| Query Builder | None | **Knex.js** | SQL migrations, transactions |
| Runtime | Node.js 18 | Node.js 20 LTS | Latest LTS, better performance |
| Deployment | Firebase Functions | Cloud Run | No cold starts, better scaling |
| Primary DB | Firestore | PostgreSQL + Knex.js | Complex queries, ACID transactions |
| Cache | None | Redis | Faster response times |
| Analytics | Firestore | BigQuery | Better analytics, lower cost |
| Jobs | Firestore triggers | Cloud Tasks + Pub/Sub | More reliable, better retry logic |
| Date Library | Moment.js | date-fns | Maintained, tree-shakeable |
| Secrets | Secret Manager | Secret Manager | Continue using |

### Why Fastify Over NestJS?

| Feature | **Fastify** | NestJS |
|---------|-------------|--------|
| **Performance** | ✅ **76,000 req/s** | 25,000 req/s |
| **Cold Start** | ✅ **<10ms** | ~50ms |
| **Bundle Size** | ✅ **1MB** | 20+ MB |
| **Learning Curve** | ✅ **2-3 days** | 1-2 weeks |
| **Architecture** | ✅ **Feature-based (your pattern)** | Decorator-heavy |
| **Knex.js Integration** | ✅ **Direct, simple** | Needs adapter |
| **TypeScript** | ✅ Native support | TypeScript-first |
| **JSON Schema** | ✅ Native validation | class-validator |

### Frontend Changes

| Component | V1 | V2 | Reason |
|-----------|----|----|--------|
| Build Tool | Create React App | Next.js 14 | SSR/SSG, better performance |
| Language | JavaScript | TypeScript | Type safety |
| State | Context API | Zustand | Better performance |
| Data Fetching | Axios | TanStack Query | Caching, optimistic updates |
| Styling | Sass + MUI | Tailwind + shadcn/ui | Smaller bundles, modern |
| Forms | Custom | React Hook Form | Better performance |
| Deployment | Firebase Hosting | Firebase Hosting (same) | Keep existing deployment |

---

## 5. Fastify Service Architecture

### Service Breakdown

#### Auth Service
```typescript
Purpose: Authentication & authorization
Tech: Fastify + TypeScript + Knex.js
Database: PostgreSQL + Redis (sessions)
Structure:
  src/
  ├── features/
  │   ├── auth/
  │   │   ├── auth.routes.ts
  │   │   ├── auth.controller.ts
  │   │   ├── auth.service.ts
  │   │   ├── auth.repository.ts
  │   │   └── auth.validation.ts
  │   └── users/
  │       ├── users.routes.ts
  │       ├── users.controller.ts
  │       ├── users.service.ts
  │       └── users.repository.ts
  ├── middleware/
  │   ├── authMiddleware.ts
  │   └── permissionsMiddleware.ts
  ├── db/
  │   ├── knex.ts
  │   └── migrations/
  ├── index.ts
  └── server.ts

Endpoints:
  - POST /auth/login
  - POST /auth/signup
  - POST /auth/refresh
  - GET /auth/profile
  - POST /auth/logout
```

#### Campaign Service
```typescript
Purpose: Campaign management
Tech: Fastify + TypeScript + Knex.js
Database: PostgreSQL + Redis (cache)
Structure:
  src/
  ├── features/
  │   ├── campaigns/
  │   │   ├── campaigns.routes.ts
  │   │   ├── campaigns.controller.ts
  │   │   ├── campaigns.service.ts
  │   │   ├── campaigns.repository.ts
  │   │   └── campaigns.validation.ts
  │   └── integrations/
  │       ├── trafficEngine/
  │       └── revive/
  ├── jobs/
  │   └── campaignSync.ts
  └── server.ts

Endpoints:
  - POST /campaigns
  - GET /campaigns/:id
  - PUT /campaigns/:id
  - DELETE /campaigns/:id
  - POST /campaigns/:id/start
  - POST /campaigns/:id/pause
```

#### Payment Service
```typescript
Purpose: Payment processing
Tech: Fastify + TypeScript + Knex.js
Database: PostgreSQL
Integrations: Stripe, Crypto, Wise
Structure:
  src/
  ├── features/
  │   ├── payments/
  │   │   ├── payments.routes.ts
  │   │   ├── payments.controller.ts
  │   │   ├── payments.service.ts
  │   │   └── payments.repository.ts
  │   └── providers/
  │       ├── stripe.service.ts
  │       ├── crypto.service.ts
  │       └── wise.service.ts
  └── server.ts

Endpoints:
  - POST /payments/create
  - POST /payments/confirm
  - GET /payments/:id
  - POST /webhooks/stripe
```

#### Analytics Service
```typescript
Purpose: Analytics & reporting
Tech: Fastify + TypeScript
Database: BigQuery + Redis (cache)
Endpoints:
  - GET /analytics/campaigns/:id
  - GET /analytics/dashboard
  - POST /analytics/reports
  - GET /analytics/export
```

#### Pixel Tracking Service
```typescript
Purpose: High-performance tracking
Tech: Go (for maximum performance)
Database: BigQuery (write), Redis (cache)
Endpoints:
  - GET /track/pixel/:id
  - POST /track/conversion
  - POST /track/s2s
```

#### Publisher Service
```typescript
Purpose: Publisher management
Tech: Fastify + TypeScript + Knex.js
Database: PostgreSQL
Integration: Revive API
Endpoints:
  - GET /publishers/balances
  - POST /publishers/payout
  - GET /publishers/:id/stats
```

### Deployment Configuration

```bash
# Auth Service (Fastify)
gcloud run deploy auth-service \
  --source . \
  --region us-central1 \
  --min-instances 2 \
  --max-instances 20 \
  --memory 512Mi \
  --cpu 1

# Campaign Service (Fastify)
gcloud run deploy campaign-service \
  --source . \
  --region us-central1 \
  --min-instances 3 \
  --max-instances 50 \
  --memory 1Gi \
  --cpu 2

# Payment Service (Fastify)
gcloud run deploy payment-service \
  --source . \
  --region us-central1 \
  --min-instances 2 \
  --max-instances 20 \
  --memory 512Mi \
  --cpu 1

# Analytics Service (Fastify)
gcloud run deploy analytics-service \
  --source . \
  --region us-central1 \
  --min-instances 2 \
  --max-instances 30 \
  --memory 1Gi \
  --cpu 2

# Pixel Tracking (Go)
gcloud run deploy pixel-service \
  --source . \
  --region us-central1 \
  --min-instances 5 \
  --max-instances 100 \
  --memory 256Mi \
  --cpu 1

# Publisher Service (Fastify)
gcloud run deploy publisher-service \
  --source . \
  --region us-central1 \
  --min-instances 1 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1
```

---

## 6. Fastify Project Structure

### Feature-Based Architecture

```
campaign-service/
├── src/
│   ├── features/
│   │   ├── campaigns/
│   │   │   ├── campaigns.routes.ts       # Route definitions
│   │   │   ├── campaigns.controller.ts   # Request handlers
│   │   │   ├── campaigns.service.ts      # Business logic
│   │   │   ├── campaigns.repository.ts   # Database operations
│   │   │   └── campaigns.validation.ts   # Zod schemas
│   │   ├── integrations/
│   │   │   ├── trafficEngine/
│   │   │   │   └── trafficEngine.service.ts
│   │   │   └── revive/
│   │   │       └── revive.service.ts
│   │   └── jobs/
│   │       └── campaignSync.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts
│   │   ├── permissionsMiddleware.ts
│   │   └── errorHandler.ts
│   ├── db/
│   │   ├── knex.ts
│   │   ├── migrations/
│   │   └── seeds/
│   ├── config/
│   │   └── index.ts
│   ├── index.ts                          # Fastify app setup
│   └── server.ts                         # Server start
├── package.json
├── tsconfig.json
├── knexfile.ts
└── Dockerfile
```

### Example Fastify App Setup (Cloud Run Ready)

```typescript
// src/index.ts
import fastify from 'fastify';
import helmet from '@fastify/helmet';
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';

// Import routes
import campaignRoutes from '@/features/campaigns/campaigns.routes';
import integrationRoutes from '@/features/integrations/integrations.routes';

/**
 * This function builds and configures our Fastify server.
 * It's kept separate from the file that starts the server
 * to make testing easier.
 */
function buildServer() {
  // Initialize the server with default logging enabled
  const server = fastify({
    logger: true,
  });

  // Add Zod validation and serialization
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  // The helmet plugin adds important security headers to every response
  server.register(helmet);

  // This is our simple health check route
  server.get('/healthcheck', async () => {
    return { status: 'ok' };
  });

  // Register our feature routes
  server.register(campaignRoutes, { prefix: '/api/campaigns' });
  server.register(integrationRoutes, { prefix: '/api/integrations' });

  return server;
}

export default buildServer;
```

```typescript
// src/config/index.ts
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  // Add other config variables as needed
  nodeEnv: process.env.NODE_ENV || 'development',
  dbHost: process.env.DB_HOST,
  dbPassword: process.env.DB_PASSWORD,
};
```

```typescript
// src/server.ts
import buildServer from '@app/index';
import { config } from '@app/config';

const server = buildServer();

async function start() {
  try {
    // CRITICAL: Cloud Run requires host: '0.0.0.0' to accept external traffic
    await server.listen({ port: Number(config.port), host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
```

---

## 7. Database Architecture

### PostgreSQL Schema Design

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  firebase_uid VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID REFERENCES users(id),
  balance DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50),
  budget DECIMAL(10,2),
  spent DECIMAL(10,2) DEFAULT 0,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  external_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  amount DECIMAL(10,2),
  currency VARCHAR(10),
  provider VARCHAR(50),
  status VARCHAR(50),
  external_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Publishers table
CREATE TABLE publishers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  email VARCHAR(255),
  balance DECIMAL(10,2) DEFAULT 0,
  revive_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Roles table (new in V2)
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  level INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Permissions table (new in V2)
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  code INTEGER UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_permission_code (code)
);

-- Role permissions (many-to-many)
CREATE TABLE role_permissions (
  id SERIAL PRIMARY KEY,
  role_code VARCHAR(50) REFERENCES roles(code) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(role_code, permission_id)
);

-- User roles (user -> organization -> role)
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role_code VARCHAR(50) REFERENCES roles(code),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);
```

### Firestore Usage (Reduced 70%)

```javascript
// Keep Firestore for:
// 1. Real-time updates
// 2. User preferences/settings
// 3. Audit logs
// 4. Temporary data

// User preferences (simple documents, no joins)
user_preferences/{userId}
  - theme: string
  - language: string
  - notifications: boolean
  - dashboardLayout: object

// Audit logs (write-heavy, time-series)
audit_logs/{logId}
  - userId: string
  - action: string
  - timestamp: timestamp
  - metadata: object

// Real-time notifications
users/{userId}/notifications/{notificationId}
  - message: string
  - read: boolean
  - createdAt: timestamp

// Real-time campaign status (for live UI updates)
realtime_campaigns/{campaignId}
  - status: string
  - impressions: number
  - clicks: number
  - updatedAt: timestamp

// Temporary form data (sessions)
temp_data/{sessionId}
  - formData: object
  - expiresAt: timestamp
```

---

## 8. Knex.js Configuration

### Installation

```bash
npm install knex pg
npm install --save-dev @types/pg
```

### Knex Configuration

```typescript
// knexfile.ts
import type { Knex } from 'knex';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: {
      host: '127.0.0.1',
      port: 5432,
      user: 'postgres',
      password: 'your_password',
      database: 'blockchain_ads_dev'
    },
    pool: { min: 2, max: 10 },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/db/migrations'
    },
    seeds: {
      directory: './src/db/seeds'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false }
    },
    pool: { min: 2, max: 20 },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/db/migrations'
    }
  }
};

export default config;
```

```typescript
// src/db/knex.ts
import knex from 'knex';
import config from '../../knexfile';

const environment = process.env.NODE_ENV || 'development';
const knexConfig = config[environment];

export const db = knex(knexConfig);
```

### Example Migration

```typescript
// src/db/migrations/001_initial_schema.ts
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Users table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 255).notNullable().unique();
    table.string('firebase_uid', 255).notNullable().unique();
    table.string('name', 255);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('email');
    table.index('firebase_uid');
  });

  // Organizations table
  await knex.schema.createTable('organizations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.uuid('owner_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.decimal('balance', 10, 2).notNullable().defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('owner_id');
  });

  // Campaigns table
  await knex.schema.createTable('campaigns', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('organization_id').notNullable().references('id').inTable('organizations').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.string('status', 50);
    table.decimal('budget', 10, 2);
    table.decimal('spent', 10, 2).defaultTo(0);
    table.timestamp('start_date');
    table.timestamp('end_date');
    table.string('external_id', 255);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('organization_id');
    table.index('status');
    table.index('external_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('campaigns');
  await knex.schema.dropTableIfExists('organizations');
  await knex.schema.dropTableIfExists('users');
}
```

---

## 8.1. Database Architecture Decision: PostgreSQL + Firestore

### Why Two Databases?

**PostgreSQL (Primary)** + **Firestore (Reduced)** provides the best of both worlds:
- PostgreSQL: Structured data, complex queries, ACID transactions
- Firestore: Real-time updates, offline support, simple document storage

### Decision Matrix

| Feature | PostgreSQL | Firestore | Winner |
|---------|-----------|-----------|--------|
| **Complex Queries** | ✅ JOINs, aggregations | ❌ Limited, no JOINs | PostgreSQL |
| **ACID Transactions** | ✅ Full support | ⚠️ Limited (v4.0+) | PostgreSQL |
| **Real-time Updates** | ❌ Need custom setup | ✅ Built-in | Firestore |
| **Offline Support** | ❌ Manual implementation | ✅ Built-in | Firestore |
| **Foreign Keys** | ✅ Full support | ❌ None | PostgreSQL |
| **Cost for Transactional Data** | ✅ $150-250/month (PostgreSQL) | ❌ $900/month (V1) | PostgreSQL |
| **Cost for Analytics** | ✅ $100-200/month (BigQuery) | ❌ Included in $900/month above | PostgreSQL + BigQuery |
| **Query Performance** | ✅ Optimized indexes | ⚠️ Slower for complex queries | PostgreSQL |
| **Firebase Auth Integration** | ⚠️ Manual | ✅ Native | Firestore |

### Data Distribution Strategy

#### PostgreSQL Tables (Structured, Transactional Data)

**Core Business Data**
```sql
-- Users (joinable with organizations)
users: id, email, firebase_uid, name, created_at, updated_at

-- Organizations (foreign keys to users)
organizations: id, owner_id, name, balance, created_at, updated_at

-- Campaigns (complex queries, analytics)
campaigns: id, organization_id, name, status, budget, spent,
           start_date, end_date, external_id, created_at, updated_at

-- Payments (ACID transactions critical)
payments: id, organization_id, amount, currency, provider, status,
          external_id, created_at

-- Publishers (relational data)
publishers: id, name, email, balance, revive_id, created_at

-- User Roles (new in V2)
user_roles: id, user_id, organization_id, role_code, created_at

-- Permissions (seeded data)
permissions: id, code, name, description

-- Role Permissions (many-to-many)
role_permissions: id, role_code, permission_id
```

**Why PostgreSQL for these tables?**
- ✅ Complex queries with JOINs (campaigns + organizations + payments)
- ✅ Financial data needs ACID transactions
- ✅ Foreign key constraints prevent data corruption
- ✅ Efficient aggregations for analytics
- ✅ Role-based access control with JOINs

#### Firestore Collections (Real-time, Document Data)

**Real-Time & Preferences**
```javascript
// User preferences (simple documents, no joins)
user_preferences/{userId}
  - theme: string
  - language: string
  - notifications: boolean
  - dashboardLayout: object

// Audit logs (write-heavy, time-series)
audit_logs/{logId}
  - userId: string
  - action: string
  - timestamp: timestamp
  - metadata: object

// Real-time notifications
users/{userId}/notifications/{notificationId}
  - message: string
  - read: boolean
  - createdAt: timestamp

// Real-time campaign status (for live UI updates)
realtime_campaigns/{campaignId}
  - status: string
  - impressions: number
  - clicks: number
  - updatedAt: timestamp

// Temporary form data (sessions)
temp_data/{sessionId}
  - formData: object
  - expiresAt: timestamp
```

**Why Firestore for these collections?**
- ✅ Real-time updates to UI without polling
- ✅ Offline-first support for mobile apps
- ✅ Simple document structure (no JOINs needed)
- ✅ Already integrated with Firebase Auth
- ✅ Lower latency for preferences/settings

### Dual-Write Pattern Implementation (Fastify)

During migration, write to both databases:

```typescript
// campaigns.service.ts (Fastify version)
import { db } from '@/db/knex';
import { getFirestore } from 'firebase-admin/firestore';

export class CampaignService {
  private firestore = getFirestore();

  async createCampaign(data: CreateCampaignDto & { organizationId: string }) {
    // Write to PostgreSQL (primary, source of truth)
    const [campaign] = await db('campaigns')
      .insert({
        organization_id: data.organizationId,
        name: data.name,
        budget: data.budget,
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    // Write to Firestore (for real-time UI updates only)
    await this.firestore
      .collection('realtime_campaigns')
      .doc(campaign.id)
      .set({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        updatedAt: new Date()
      });

    return campaign;
  }

  async updateCampaignStatus(campaignId: string, status: string) {
    // Update PostgreSQL
    await db('campaigns')
      .where('id', campaignId)
      .update({
        status,
        updated_at: new Date()
      });

    // Update Firestore for real-time UI
    await this.firestore
      .collection('realtime_campaigns')
      .doc(campaignId)
      .update({
        status,
        updatedAt: new Date()
      });
  }

  // Read from PostgreSQL (complex queries)
  async getCampaignStats(campaignId: string) {
    return await db('campaigns as c')
      .select(
        'c.*',
        'o.name as organization_name',
        db.raw('COALESCE(SUM(p.amount), 0) as total_spent'),
        db.raw('COUNT(DISTINCT p.id) as payment_count')
      )
      .leftJoin('organizations as o', 'o.id', 'c.organization_id')
      .leftJoin('payments as p', 'p.campaign_id', 'c.id')
      .where('c.id', campaignId)
      .groupBy('c.id', 'o.name')
      .first();
  }
}
```

### Frontend Integration

```typescript
// Frontend - Listen to Firestore for real-time updates
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

function CampaignDashboard({ campaignId }) {
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    // Real-time updates from Firestore
    const unsubscribe = onSnapshot(
      doc(firestore, 'realtime_campaigns', campaignId),
      (snapshot) => {
        setCampaign(snapshot.data());
      }
    );

    return () => unsubscribe();
  }, [campaignId]);

  // Detailed data from PostgreSQL via API
  const { data: campaignStats } = useTanStackQuery({
    queryKey: ['campaign-stats', campaignId],
    queryFn: () => fetch(`/api/campaigns/${campaignId}/stats`)
  });

  return (
    <div>
      <h1>{campaign?.name}</h1>
      <Status status={campaign?.status} /> {/* Real-time */}
      <Stats data={campaignStats} /> {/* From PostgreSQL */}
    </div>
  );
}

// Real-time Notifications Example
function NotificationCenter({ userId }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listen to user's notifications collection
    const unsubscribe = onSnapshot(
      collection(firestore, `users/${userId}/notifications`),
      {
        // Order by creation time, limit to 50 most recent
        orderBy: 'createdAt',
        limit: 50
      },
      (snapshot) => {
        const notifs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setNotifications(notifs);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const markAsRead = async (notificationId) => {
    // Update in Firestore (instant UI update via listener)
    await updateDoc(
      doc(firestore, `users/${userId}/notifications/${notificationId}`),
      { read: true }
    );
  };

  return (
    <div>
      {notifications.map(notif => (
        <div key={notif.id} className={notif.read ? 'read' : 'unread'}>
          <p>{notif.message}</p>
          {!notif.read && (
            <button onClick={() => markAsRead(notif.id)}>Mark as Read</button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Cost Comparison

#### Option A: PostgreSQL + Firestore (Recommended)
```
PostgreSQL (Cloud SQL): $150-250/month
  - All transactional data
  - Complex queries, analytics
  - ACID transactions for payments

Firestore (reduced 70%): $150-250/month
  - Real-time features
  - User preferences
  - Audit logs
  - Notifications

Total: $300-500/month
Dev Time: 0 weeks (keeps existing real-time features)
```

#### Option B: PostgreSQL Only
```
PostgreSQL (Cloud SQL): $150-250/month
  - All data in PostgreSQL

Custom Real-Time Infrastructure:
  - WebSocket server (Cloud Run): $100-150/month
  - Redis Pub/Sub: $100-150/month
  - Load Balancer: $50/month
  - Development: 6-8 weeks

Total: $400-600/month
Dev Time: 6-8 weeks extra
Risk: Custom implementation bugs
```

#### Option C: Firestore Only (Current V1)
```
Firestore: $900/month
  - All data in Firestore
  - Expensive for complex queries
  - No JOIN support
  - Slow aggregations
  - No foreign keys

Total: $900/month ❌
Problems: High cost, limited querying
```

### Migration Timeline Impact

**With Dual-Write Strategy:**
- Week 6: Start dual-write for new records
- Week 17: Migrate historical data
- Week 18: Validate data consistency
- Week 20: Switch to PostgreSQL primary reads
- Month 6: Keep Firestore for real-time only

**Benefits:**
- ✅ Zero downtime migration
- ✅ Easy rollback (keep both databases active for 1 month)
- ✅ Gradual transition reduces risk
- ✅ Real-time features keep working

### Real-Time Campaign Data Flow

**How does `realtime_campaigns` get its data?**

#### 1. Status Updates (User Actions)

```typescript
// User creates/updates campaign → Dual-write to PostgreSQL + Firestore
async createCampaign(data: CreateCampaignDto) {
  // Write to PostgreSQL (source of truth)
  const campaign = await db('campaigns').insert(data).returning('*');

  // Write to Firestore (real-time UI)
  await firestore.collection('realtime_campaigns').doc(campaign.id).set({
    id: campaign.id,
    name: campaign.name,
    status: campaign.status,
    impressions: 0,
    clicks: 0,
    updatedAt: new Date()
  });
}
```

#### 2. Performance Metrics (Scheduled Jobs)

**Every 7 minutes**, sync campaign stats from external networks:

```typescript
// src/jobs/campaignStatsSync.ts (Cloud Scheduler)
import { db } from '@/db/knex';
import { getFirestore } from 'firebase-admin/firestore';
import { TrafficEngineAPI } from '@/integrations/trafficEngine';

export async function syncCampaignStats() {
  const firestore = getFirestore();

  // 1. Get active campaigns from PostgreSQL
  const activeCampaigns = await db('campaigns')
    .where('status', 'active')
    .select('id', 'external_id');

  for (const campaign of activeCampaigns) {
    // 2. Fetch stats from TrafficEngine API
    const stats = await TrafficEngineAPI.getCampaignStats(campaign.external_id);

    // 3. Update PostgreSQL (for complex queries/analytics)
    await db('campaigns')
      .where('id', campaign.id)
      .update({
        impressions: stats.impressions,
        clicks: stats.clicks,
        spent: stats.spent,
        updated_at: new Date()
      });

    // 4. Update Firestore (for real-time UI updates)
    await firestore
      .collection('realtime_campaigns')
      .doc(campaign.id)
      .update({
        impressions: stats.impressions,
        clicks: stats.clicks,
        spent: stats.spent,
        updatedAt: new Date()
      });
  }
}
```

**Cloud Scheduler Configuration:**

```bash
# Schedule every 7 minutes (matches V1 behavior)
gcloud scheduler jobs create http campaign-stats-sync \
  --schedule="*/7 * * * *" \
  --uri="https://campaign-service-xxx.run.app/jobs/sync-stats" \
  --http-method=POST \
  --oidc-service-account-email=scheduler@project.iam.gserviceaccount.com
```

#### 3. Complete Data Flow Diagram

```
External Ad Networks (TrafficEngine, Revive)
              ↓
  [Cloud Scheduler: Every 7 min]
              ↓
    Campaign Stats Sync Job (Fastify)
              ↓
      ┌───────┴───────┐
      ↓               ↓
  PostgreSQL      Firestore
  (analytics)   (realtime_campaigns/{id})
      ↓               ↓
   API calls     onSnapshot listener
      ↓               ↓
  Dashboard      Live UI updates
  (complex      (instant status,
   queries)      metrics, no polling!)
```

---

## 8.2. WHY Permissions MUST Stay in PostgreSQL

### Firestore vs PostgreSQL for Permissions

| Requirement | Firestore | PostgreSQL | Winner |
|-------------|-----------|------------|--------|
| **JOIN Queries** | ❌ No JOINs | ✅ Native support | PostgreSQL |
| **Query**: "Get user's permissions for org X" | ❌ Multiple queries + client-side joins | ✅ Single JOIN query | PostgreSQL |
| **ACID Transactions** | ⚠️ Limited | ✅ Full support | PostgreSQL |
| **Permission Checks (per request)** | ❌ ~100-200ms (multiple reads) | ✅ ~10-20ms (single JOIN) | PostgreSQL |
| **Role Changes** | ❌ Update multiple docs | ✅ Single UPDATE | PostgreSQL |
| **Cost at Scale** | ❌ $0.06 per 100k reads | ✅ Fixed monthly cost | PostgreSQL |
| **Data Integrity** | ❌ No foreign keys | ✅ Foreign key constraints | PostgreSQL |

### The Problem with Firestore Permissions

```javascript
// ❌ BAD: Firestore approach (requires 4 separate queries!)
async function checkPermissionFirestore(userId, orgId, permission) {
  // Query 1: Get user's role in org
  const userRole = await firestore
    .collection('user_roles')
    .where('userId', '==', userId)
    .where('orgId', '==', orgId)
    .get();

  // Query 2: Get role details
  const role = await firestore
    .collection('roles')
    .doc(userRole.roleCode)
    .get();

  // Query 3: Get role's permissions
  const rolePerms = await firestore
    .collection('role_permissions')
    .where('roleCode', '==', role.code)
    .get();

  // Query 4: Check if permission exists
  for (const rp of rolePerms.docs) {
    const perm = await firestore
      .collection('permissions')
      .doc(rp.permissionId)
      .get();

    if (perm.code === permission) return true;
  }

  return false;
}
// Result: 4+ Firestore reads per permission check
// Cost: $0.24 per 1000 API requests
// Latency: ~150-200ms
```

```typescript
// ✅ GOOD: PostgreSQL approach (single JOIN query!)
async function checkPermissionPostgres(userId, orgId, permission) {
  const result = await db('user_roles as ur')
    .select('p.code')
    .join('role_permissions as rp', 'rp.role_code', 'ur.role_code')
    .join('permissions as p', 'p.id', 'rp.permission_id')
    .where('ur.user_id', userId)
    .where('ur.organization_id', orgId)
    .where('p.code', permission)
    .first();

  return !!result;
}
// Result: 1 SQL query with JOINs
// Cost: Fixed monthly PostgreSQL cost
// Latency: ~10-20ms
```

### Cost Comparison at Scale

**Scenario: 10,000 API requests per day, 1 permission check per request**

**Firestore:**
```
10,000 requests × 4 Firestore reads = 40,000 reads/day
40,000 × 30 days = 1,200,000 reads/month
Cost: $7.20/month (just for permission checks!)
Latency: ~150ms per check
```

**PostgreSQL:**
```
10,000 requests × 1 SQL query = 10,000 queries/day
Included in fixed Cloud SQL cost
Cost: $0/month (included in $150-250 Cloud SQL)
Latency: ~10ms per check
```

### WHY PostgreSQL Wins for Permissions:

1. ✅ **15x faster** (10ms vs 150ms)
2. ✅ **75% cost reduction** ($0 vs $7.20 for permission checks alone)
3. ✅ **Data integrity** (foreign keys prevent invalid role/permission assignments)
4. ✅ **Atomic updates** (change role permissions atomically)
5. ✅ **Single query** (JOINs vs multiple round trips)
6. ✅ **Scalable** (fixed cost regardless of API request volume)

**Conclusion:** Permissions are **relational data with complex queries** = perfect for PostgreSQL!

---

## 8.3. Integer Permission Codes (Bitwise System)

### Why Integer Codes Instead of Strings?

| Feature | String Codes (`campaigns:create`) | **Integer Codes (110000)** |
|---------|----------------------------------|----------------------------|
| **Storage** | 20-30 bytes | 4 bytes |
| **Database Index** | Slower (string comparison) | ✅ Faster (integer comparison) |
| **Query Performance** | ~50ms | ✅ ~10ms (5x faster!) |
| **Bitwise Operations** | ❌ Not possible | ✅ Check multiple permissions instantly |
| **Future-proof** | ⚠️ Need to migrate strings | ✅ Add new codes easily |

### Permission Code Structure

```
Format: RRRAAA (6 digits)
  RRR = Resource code (100-999)
  AAA = Action code (000-999)

Examples:
  110100 = campaigns:read
  110200 = campaigns:create
  110300 = campaigns:update
  110400 = campaigns:delete
  110500 = campaigns:start
  110600 = campaigns:pause

  120100 = payments:read
  120200 = payments:create
  120300 = payments:approve

  130100 = users:read
  130200 = users:create
  130300 = users:update
  130400 = users:delete
```

### Resource Code Mapping

```typescript
// Resource codes (RRR)
export const RESOURCES = {
  CAMPAIGNS: 110,
  PAYMENTS: 120,
  USERS: 130,
  ORGANIZATIONS: 140,
  REPORTS: 150,
  PUBLISHERS: 160,
  ANALYTICS: 170,
  ADMIN: 900, // Special admin permissions
} as const;

// Action codes (AAA)
export const ACTIONS = {
  READ: 100,
  CREATE: 200,
  UPDATE: 300,
  DELETE: 400,
  START: 500,
  PAUSE: 600,
  APPROVE: 700,
  EXPORT: 800,
} as const;

// Helper to build permission code
export function buildPermissionCode(resource: number, action: number): number {
  return resource * 1000 + action;
}

// Examples
const PERMISSIONS = {
  CAMPAIGNS_READ: buildPermissionCode(RESOURCES.CAMPAIGNS, ACTIONS.READ),     // 110100
  CAMPAIGNS_CREATE: buildPermissionCode(RESOURCES.CAMPAIGNS, ACTIONS.CREATE), // 110200
  PAYMENTS_APPROVE: buildPermissionCode(RESOURCES.PAYMENTS, ACTIONS.APPROVE), // 120700
} as const;
```

### Updated Database Schema

```sql
-- Permissions table with INTEGER codes
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  code INTEGER UNIQUE NOT NULL,  -- Changed from VARCHAR to INTEGER
  name VARCHAR(255) NOT NULL,
  description TEXT,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  -- Add index for fast lookups
  INDEX idx_permission_code (code)
);

-- Example data
INSERT INTO permissions (code, name) VALUES
  (110100, 'View Campaign'),
  (110200, 'Create Campaign'),
  (110300, 'Update Campaign'),
  (110400, 'Delete Campaign'),
  (110500, 'Start Campaign'),
  (110600, 'Pause Campaign'),
  (120100, 'View Payment'),
  (120200, 'Create Payment'),
  (120700, 'Approve Payment');
```

---

## 9. Fastify Feature Implementation

### Campaign Routes

```typescript
// src/features/campaigns/campaigns.routes.ts
import { FastifyInstance } from 'fastify';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { CampaignsRepository } from './campaigns.repository';
import {
  createCampaignSchema,
  updateCampaignSchema,
  getCampaignParamsSchema
} from './campaigns.validation';
import { requirePermission } from '@/middleware/permissionsMiddleware';
import { PERMISSIONS } from '@/constants/permissions';

async function campaignRoutes(server: FastifyInstance) {
  // Initialize dependencies
  const campaignsRepository = new CampaignsRepository();
  const campaignsService = new CampaignsService(campaignsRepository);
  const campaignsController = new CampaignsController(campaignsService);

  // List campaigns
  server.get(
    '/',
    {
      preHandler: requirePermission(PERMISSIONS.CAMPAIGNS_READ),
    },
    campaignsController.list
  );

  // Get campaign by ID
  server.get(
    '/:id',
    {
      preHandler: requirePermission(PERMISSIONS.CAMPAIGNS_READ),
      schema: {
        params: getCampaignParamsSchema,
      },
    },
    campaignsController.getById
  );

  // Create campaign
  server.post(
    '/',
    {
      preHandler: requirePermission(PERMISSIONS.CAMPAIGNS_CREATE),
      schema: {
        body: createCampaignSchema,
      },
    },
    campaignsController.create
  );

  // Update campaign
  server.put(
    '/:id',
    {
      preHandler: requirePermission(PERMISSIONS.CAMPAIGNS_UPDATE),
      schema: {
        params: getCampaignParamsSchema,
        body: updateCampaignSchema,
      },
    },
    campaignsController.update
  );

  // Delete campaign
  server.delete(
    '/:id',
    {
      preHandler: requirePermission(PERMISSIONS.CAMPAIGNS_DELETE),
      schema: {
        params: getCampaignParamsSchema,
      },
    },
    campaignsController.delete
  );

  // Start campaign
  server.post(
    '/:id/start',
    {
      preHandler: requirePermission(PERMISSIONS.CAMPAIGNS_START),
      schema: {
        params: getCampaignParamsSchema,
      },
    },
    campaignsController.start
  );

  // Pause campaign
  server.post(
    '/:id/pause',
    {
      preHandler: requirePermission(PERMISSIONS.CAMPAIGNS_PAUSE),
      schema: {
        params: getCampaignParamsSchema,
      },
    },
    campaignsController.pause
  );
}

export default campaignRoutes;
```

### Campaign Controller

```typescript
// src/features/campaigns/campaigns.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto } from './campaigns.validation';

export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {
    // Bind methods to maintain context
    this.list = this.list.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.start = this.start.bind(this);
    this.pause = this.pause.bind(this);
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const organizationId = request.headers['organization-id'] as string;
    const campaigns = await this.campaignsService.findAll(organizationId);
    return reply.send(campaigns);
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const campaign = await this.campaignsService.findById(id);

    if (!campaign) {
      return reply.code(404).send({ error: 'Campaign not found' });
    }

    return reply.send(campaign);
  }

  async create(
    request: FastifyRequest<{ Body: CreateCampaignDto }>,
    reply: FastifyReply
  ) {
    const organizationId = request.headers['organization-id'] as string;
    const campaign = await this.campaignsService.create({
      ...request.body,
      organizationId,
    });
    return reply.code(201).send(campaign);
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateCampaignDto
    }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const campaign = await this.campaignsService.update(id, request.body);
    return reply.send(campaign);
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    await this.campaignsService.delete(id);
    return reply.code(204).send();
  }

  async start(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const campaign = await this.campaignsService.start(id);
    return reply.send(campaign);
  }

  async pause(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const campaign = await this.campaignsService.pause(id);
    return reply.send(campaign);
  }
}
```

### Campaign Service

```typescript
// src/features/campaigns/campaigns.service.ts
import { CampaignsRepository } from './campaigns.repository';
import { CreateCampaignDto, UpdateCampaignDto } from './campaigns.validation';
import { getFirestore } from 'firebase-admin/firestore';

export class CampaignsService {
  private firestore = getFirestore();

  constructor(private campaignsRepository: CampaignsRepository) {}

  async findAll(organizationId: string) {
    return await this.campaignsRepository.findByOrganization(organizationId);
  }

  async findById(id: string) {
    return await this.campaignsRepository.findById(id);
  }

  async create(data: CreateCampaignDto & { organizationId: string }) {
    // Write to PostgreSQL (primary, source of truth)
    const campaign = await this.campaignsRepository.create({
      organization_id: data.organizationId,
      name: data.name,
      budget: data.budget,
      status: 'draft',
    });

    // Write to Firestore (for real-time UI updates only)
    await this.firestore
      .collection('realtime_campaigns')
      .doc(campaign.id)
      .set({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        updatedAt: new Date(),
      });

    return campaign;
  }

  async update(id: string, data: UpdateCampaignDto) {
    const campaign = await this.campaignsRepository.update(id, data);

    // Update Firestore for real-time UI
    await this.firestore
      .collection('realtime_campaigns')
      .doc(id)
      .update({
        ...data,
        updatedAt: new Date(),
      });

    return campaign;
  }

  async delete(id: string) {
    await this.campaignsRepository.delete(id);

    // Delete from Firestore
    await this.firestore
      .collection('realtime_campaigns')
      .doc(id)
      .delete();
  }

  async start(id: string) {
    return await this.updateStatus(id, 'active');
  }

  async pause(id: string) {
    return await this.updateStatus(id, 'paused');
  }

  private async updateStatus(id: string, status: string) {
    const campaign = await this.campaignsRepository.updateStatus(id, status);

    // Update Firestore for real-time UI
    await this.firestore
      .collection('realtime_campaigns')
      .doc(id)
      .update({
        status,
        updatedAt: new Date(),
      });

    return campaign;
  }
}
```

### Campaign Repository

```typescript
// src/features/campaigns/campaigns.repository.ts
import { db } from '@/db/knex';

export class CampaignsRepository {
  async findByOrganization(organizationId: string) {
    return await db('campaigns')
      .where('organization_id', organizationId)
      .orderBy('created_at', 'desc');
  }

  async findById(id: string) {
    return await db('campaigns')
      .where('id', id)
      .first();
  }

  async create(data: any) {
    const [campaign] = await db('campaigns')
      .insert(data)
      .returning('*');
    return campaign;
  }

  async update(id: string, data: any) {
    const [campaign] = await db('campaigns')
      .where('id', id)
      .update({
        ...data,
        updated_at: new Date(),
      })
      .returning('*');
    return campaign;
  }

  async delete(id: string) {
    await db('campaigns')
      .where('id', id)
      .delete();
  }

  async updateStatus(id: string, status: string) {
    const [campaign] = await db('campaigns')
      .where('id', id)
      .update({
        status,
        updated_at: new Date(),
      })
      .returning('*');
    return campaign;
  }

  // Complex query with transaction
  async createWithBudgetDeduction(data: any) {
    return await db.transaction(async (trx) => {
      // Insert campaign
      const [campaign] = await trx('campaigns')
        .insert({
          organization_id: data.organizationId,
          name: data.name,
          budget: data.budget,
          status: 'draft',
        })
        .returning('*');

      // Deduct budget from organization
      await trx('organizations')
        .where('id', data.organizationId)
        .decrement('balance', data.budget);

      return campaign;
    });
  }

  // Complex query with joins
  async getCampaignStats(campaignId: string) {
    return await db('campaigns as c')
      .select(
        'c.*',
        'o.name as organization_name',
        db.raw('COALESCE(SUM(p.amount), 0) as total_spent'),
        db.raw('COUNT(DISTINCT p.id) as payment_count')
      )
      .leftJoin('organizations as o', 'o.id', 'c.organization_id')
      .leftJoin('payments as p', 'p.campaign_id', 'c.id')
      .where('c.id', campaignId)
      .groupBy('c.id', 'o.name')
      .first();
  }
}
```

### Campaign Validation (Zod)

```typescript
// src/features/campaigns/campaigns.validation.ts
import { z } from 'zod';

export const createCampaignSchema = z.object({
  name: z.string().min(1).max(255),
  budget: z.number().positive(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const updateCampaignSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  budget: z.number().positive().optional(),
  status: z.enum(['draft', 'active', 'paused', 'completed']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const getCampaignParamsSchema = z.object({
  id: z.string().uuid(),
});

export type CreateCampaignDto = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignDto = z.infer<typeof updateCampaignSchema>;
```

---

## 10. Permissions Middleware (Fastify) - Integer Codes + Redis

### Permission Constants

```typescript
// src/constants/permissions.ts
export const RESOURCES = {
  CAMPAIGNS: 110,
  PAYMENTS: 120,
  USERS: 130,
  ORGANIZATIONS: 140,
  REPORTS: 150,
  PUBLISHERS: 160,
  ANALYTICS: 170,
  ADMIN: 900,
} as const;

export const ACTIONS = {
  READ: 100,
  CREATE: 200,
  UPDATE: 300,
  DELETE: 400,
  START: 500,
  PAUSE: 600,
  APPROVE: 700,
  EXPORT: 800,
} as const;

// Helper to build permission code
export function buildPermissionCode(resource: number, action: number): number {
  return resource * 1000 + action;
}

// All permission codes
export const PERMISSIONS = {
  // Campaign permissions
  CAMPAIGNS_READ: buildPermissionCode(RESOURCES.CAMPAIGNS, ACTIONS.READ),     // 110100
  CAMPAIGNS_CREATE: buildPermissionCode(RESOURCES.CAMPAIGNS, ACTIONS.CREATE), // 110200
  CAMPAIGNS_UPDATE: buildPermissionCode(RESOURCES.CAMPAIGNS, ACTIONS.UPDATE), // 110300
  CAMPAIGNS_DELETE: buildPermissionCode(RESOURCES.CAMPAIGNS, ACTIONS.DELETE), // 110400
  CAMPAIGNS_START: buildPermissionCode(RESOURCES.CAMPAIGNS, ACTIONS.START),   // 110500
  CAMPAIGNS_PAUSE: buildPermissionCode(RESOURCES.CAMPAIGNS, ACTIONS.PAUSE),   // 110600

  // Payment permissions
  PAYMENTS_READ: buildPermissionCode(RESOURCES.PAYMENTS, ACTIONS.READ),       // 120100
  PAYMENTS_CREATE: buildPermissionCode(RESOURCES.PAYMENTS, ACTIONS.CREATE),   // 120200
  PAYMENTS_APPROVE: buildPermissionCode(RESOURCES.PAYMENTS, ACTIONS.APPROVE), // 120700

  // User permissions
  USERS_READ: buildPermissionCode(RESOURCES.USERS, ACTIONS.READ),             // 130100
  USERS_CREATE: buildPermissionCode(RESOURCES.USERS, ACTIONS.CREATE),         // 130200
  USERS_UPDATE: buildPermissionCode(RESOURCES.USERS, ACTIONS.UPDATE),         // 130300
  USERS_DELETE: buildPermissionCode(RESOURCES.USERS, ACTIONS.DELETE),         // 130400

  // Organization permissions
  ORGANIZATIONS_UPDATE: buildPermissionCode(RESOURCES.ORGANIZATIONS, ACTIONS.UPDATE), // 140300
  ORGANIZATIONS_BILLING: buildPermissionCode(RESOURCES.ORGANIZATIONS, 150),           // 140150

  // Report permissions
  REPORTS_READ: buildPermissionCode(RESOURCES.REPORTS, ACTIONS.READ),         // 150100
  REPORTS_EXPORT: buildPermissionCode(RESOURCES.REPORTS, ACTIONS.EXPORT),     // 150800

  // Publisher permissions
  PUBLISHERS_READ: buildPermissionCode(RESOURCES.PUBLISHERS, ACTIONS.READ),   // 160100
  PUBLISHERS_APPROVE: buildPermissionCode(RESOURCES.PUBLISHERS, ACTIONS.APPROVE), // 160700

  // Analytics permissions
  ANALYTICS_READ: buildPermissionCode(RESOURCES.ANALYTICS, ACTIONS.READ),     // 170100
  ANALYTICS_EXPORT: buildPermissionCode(RESOURCES.ANALYTICS, ACTIONS.EXPORT), // 170800

  // Admin permissions
  ADMIN_FULL: buildPermissionCode(RESOURCES.ADMIN, ACTIONS.READ),             // 900100
} as const;
```

### Redis-Cached Permission Middleware

```typescript
// src/middleware/permissionsMiddleware.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '@/db/knex';
import { redis } from '@/config/redis';

const CACHE_TTL = 5 * 60; // 5 minutes

/**
 * Get user's permission codes for an organization (with Redis cache)
 *
 * Performance:
 * - With cache: ~2ms (25x faster!)
 * - Without cache: ~50ms (PostgreSQL JOIN)
 */
async function getUserPermissions(userId: string, organizationId: string): Promise<number[]> {
  // Try cache first
  const cacheKey = `permissions:${userId}:${organizationId}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached) as number[];
  }

  // Cache miss: Query PostgreSQL with JOIN
  const userPermissions = await db('user_roles as ur')
    .select('p.code')
    .join('role_permissions as rp', 'rp.role_code', 'ur.role_code')
    .join('permissions as p', 'p.id', 'rp.permission_id')
    .where('ur.user_id', userId)
    .where('ur.organization_id', organizationId);

  const permissionCodes = userPermissions.map(p => p.code as number);

  // Cache for 5 minutes
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(permissionCodes));

  return permissionCodes;
}

/**
 * Require a specific permission code (integer)
 *
 * Usage:
 *   preHandler: requirePermission(PERMISSIONS.CAMPAIGNS_READ)
 */
export function requirePermission(permissionCode: number) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request.user as any)?.id;
    const organizationId = request.headers['organization-id'] as string;

    if (!organizationId) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'Organization ID required',
      });
    }

    // Get user's permissions (cached)
    const userPermissions = await getUserPermissions(userId, organizationId);

    // Check if user has the required permission
    if (!userPermissions.includes(permissionCode)) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'Insufficient permissions',
        required: permissionCode,
      });
    }
  };
}

/**
 * Require ANY of the provided permission codes
 *
 * Usage:
 *   preHandler: requireAnyPermission([
 *     PERMISSIONS.CAMPAIGNS_UPDATE,
 *     PERMISSIONS.CAMPAIGNS_DELETE
 *   ])
 */
export function requireAnyPermission(permissionCodes: number[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request.user as any)?.id;
    const organizationId = request.headers['organization-id'] as string;

    if (!organizationId) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'Organization ID required',
      });
    }

    // Get user's permissions (cached)
    const userPermissions = await getUserPermissions(userId, organizationId);

    // Check if user has ANY of the required permissions
    const hasAnyPermission = permissionCodes.some(code => userPermissions.includes(code));

    if (!hasAnyPermission) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'Insufficient permissions',
        required: permissionCodes,
      });
    }
  };
}

/**
 * Require ALL of the provided permission codes
 *
 * Usage:
 *   preHandler: requireAllPermissions([
 *     PERMISSIONS.CAMPAIGNS_UPDATE,
 *     PERMISSIONS.PAYMENTS_READ
 *   ])
 */
export function requireAllPermissions(permissionCodes: number[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request.user as any)?.id;
    const organizationId = request.headers['organization-id'] as string;

    if (!organizationId) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'Organization ID required',
      });
    }

    // Get user's permissions (cached)
    const userPermissions = await getUserPermissions(userId, organizationId);

    // Check if user has ALL of the required permissions
    const hasAllPermissions = permissionCodes.every(code => userPermissions.includes(code));

    if (!hasAllPermissions) {
      const missingPermissions = permissionCodes.filter(code => !userPermissions.includes(code));
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'Insufficient permissions',
        required: permissionCodes,
        missing: missingPermissions,
      });
    }
  };
}

/**
 * Invalidate permissions cache for a user/org
 * Call this after role changes
 */
export async function invalidatePermissionsCache(userId: string, organizationId: string) {
  const cacheKey = `permissions:${userId}:${organizationId}`;
  await redis.del(cacheKey);
}
```

### Updated Campaign Routes (Using Integer Codes)

```typescript
// src/features/campaigns/campaigns.routes.ts
import { FastifyInstance } from 'fastify';
import { CampaignsController } from './campaigns.controller';
import { requirePermission } from '@/middleware/permissionsMiddleware';
import { PERMISSIONS } from '@/constants/permissions';

async function campaignRoutes(server: FastifyInstance) {
  const campaignsController = new CampaignsController();

  // List campaigns
  server.get(
    '/',
    {
      preHandler: requirePermission(PERMISSIONS.CAMPAIGNS_READ),
    },
    campaignsController.list
  );

  // Get campaign by ID
  server.get(
    '/:id',
    {
      preHandler: requirePermission(PERMISSIONS.CAMPAIGNS_READ),
    },
    campaignsController.getById
  );

  // Create campaign
  server.post(
    '/',
    {
      preHandler: requirePermission(PERMISSIONS.CAMPAIGNS_CREATE),
    },
    campaignsController.create
  );

  // Update campaign
  server.put(
    '/:id',
    {
      preHandler: requirePermission(PERMISSIONS.CAMPAIGNS_UPDATE),
    },
    campaignsController.update
  );

  // Delete campaign
  server.delete(
    '/:id',
    {
      preHandler: requirePermission(PERMISSIONS.CAMPAIGNS_DELETE),
    },
    campaignsController.delete
  );

  // Start campaign
  server.post(
    '/:id/start',
    {
      preHandler: requirePermission(PERMISSIONS.CAMPAIGNS_START),
    },
    campaignsController.start
  );

  // Pause campaign
  server.post(
    '/:id/pause',
    {
      preHandler: requirePermission(PERMISSIONS.CAMPAIGNS_PAUSE),
    },
    campaignsController.pause
  );
}

export default campaignRoutes;
```

### Performance Comparison

| Method | Latency | Cost per Check | Cache Hit Rate |
|--------|---------|----------------|----------------|
| **Redis Cache (Hit)** | ✅ **~2ms** | $0 | 95%+ |
| **PostgreSQL Only** | ⚠️ ~50ms | $0 | N/A |
| **Firestore (4 queries)** | ❌ ~150ms | $0.24 per 1000 | N/A |

**Performance Gains:**
- ✅ **25x faster** than PostgreSQL (2ms vs 50ms)
- ✅ **75x faster** than Firestore (2ms vs 150ms)
- ✅ **95%+ cache hit rate** (permissions rarely change)
- ✅ **Zero database load** for cached checks

### Redis Configuration

```typescript
// src/config/redis.ts
import Redis from 'ioredis';

export const redis = new Redis({
  host: process.env.REDIS_HOST || '10.0.0.3',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});
```

---

## 11. Roles & Permissions Seed Data (Integer Codes)

```typescript
// src/db/seeds/001_roles_and_permissions.ts
import type { Knex } from 'knex';
import { PERMISSIONS } from '@/constants/permissions';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('role_permissions').del();
  await knex('permissions').del();
  await knex('roles').del();

  // Seed roles
  await knex('roles').insert([
    { code: 'admin', name: 'Admin', description: 'Full system access', level: 1 },
    { code: 'manager', name: 'Manager', description: 'Manage campaigns and view reports', level: 2 },
    { code: 'member', name: 'Member', description: 'View campaigns and basic operations', level: 3 },
  ]);

  // Seed permissions with INTEGER codes
  await knex('permissions').insert([
    // Campaign permissions
    { code: 110100, name: 'View Campaign' },
    { code: 110200, name: 'Create Campaign' },
    { code: 110300, name: 'Update Campaign' },
    { code: 110400, name: 'Delete Campaign' },
    { code: 110500, name: 'Start Campaign' },
    { code: 110600, name: 'Pause Campaign' },

    // Payment permissions
    { code: 120100, name: 'View Payment' },
    { code: 120200, name: 'Create Payment' },
    { code: 120700, name: 'Approve Payment' },

    // User permissions
    { code: 130100, name: 'View User' },
    { code: 130200, name: 'Create User' },
    { code: 130300, name: 'Update User' },
    { code: 130400, name: 'Delete User' },

    // Organization permissions
    { code: 140300, name: 'Update Organization' },
    { code: 140150, name: 'Manage Billing' },

    // Report permissions
    { code: 150100, name: 'View Reports' },
    { code: 150800, name: 'Export Reports' },

    // Publisher permissions
    { code: 160100, name: 'View Publishers' },
    { code: 160700, name: 'Approve Publisher' },

    // Analytics permissions
    { code: 170100, name: 'View Analytics' },
    { code: 170800, name: 'Export Analytics' },

    // Admin permissions
    { code: 900100, name: 'Full Admin Access' },
  ]);

  // Get permission IDs (using integer codes now)
  const permissions = await knex('permissions').select('id', 'code');
  const permMap = Object.fromEntries(permissions.map(p => [p.code, p.id]));

  // Assign permissions to roles
  await knex('role_permissions').insert([
    // Admin: All permissions
    ...permissions.map(p => ({ role_code: 'admin', permission_id: p.id })),

    // Manager: Campaign and report management
    { role_code: 'manager', permission_id: permMap[110100] }, // campaigns:read
    { role_code: 'manager', permission_id: permMap[110200] }, // campaigns:create
    { role_code: 'manager', permission_id: permMap[110300] }, // campaigns:update
    { role_code: 'manager', permission_id: permMap[110500] }, // campaigns:start
    { role_code: 'manager', permission_id: permMap[110600] }, // campaigns:pause
    { role_code: 'manager', permission_id: permMap[120100] }, // payments:read
    { role_code: 'manager', permission_id: permMap[150100] }, // reports:read
    { role_code: 'manager', permission_id: permMap[150800] }, // reports:export
    { role_code: 'manager', permission_id: permMap[170100] }, // analytics:read

    // Member: Read-only access
    { role_code: 'member', permission_id: permMap[110100] }, // campaigns:read
    { role_code: 'member', permission_id: permMap[120100] }, // payments:read
    { role_code: 'member', permission_id: permMap[150100] }, // reports:read
    { role_code: 'member', permission_id: permMap[170100] }, // analytics:read
  ]);
}
```

---

## 11.5. Local Development Environment (Complete Setup)

V2 local development uses Docker Compose for a complete environment with automatic background job execution.

### V1 Local Development (Current Challenges)

```bash
# V1: Multiple manual steps required
cd functions && npm install
firebase emulators:start --only firestore,auth
DEV_ENV=true nodemon

# Problems:
- ❌ Firestore emulator slow and buggy
- ❌ Scheduled jobs don't run automatically in emulator
- ❌ Must manually trigger cron jobs
- ❌ No easy way to test background job processing
- ❌ Search (Meilisearch) runs separately
```

### V2 Local Development (Simplified with Docker)

**One command starts everything:**

```bash
# V2: Single command for complete environment
docker-compose up

# This starts:
✅ PostgreSQL (local database)
✅ Redis (local cache)
✅ TypeSense (search engine)
✅ All backend services in ONE container
✅ Admin UI for Redis
```

### Docker Compose Configuration (Simplified - Single Backend Container)

```yaml
# docker-compose.yml (at project root)
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: bca-postgres
    environment:
      POSTGRES_DB: blockchain_ads_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: dev_password
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: bca-redis
    ports:
      - '6379:6379'
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

  # TypeSense (Search Engine)
  typesense:
    image: typesense/typesense:26.0
    container_name: bca-typesense
    ports:
      - '8108:8108'
    environment:
      TYPESENSE_DATA_DIR: /data
      TYPESENSE_API_KEY: dev_api_key
      TYPESENSE_ENABLE_CORS: 'true'
    volumes:
      - typesense_data:/data
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:8108/health']
      interval: 10s
      timeout: 5s
      retries: 5

  # All Backend Services in ONE Container
  backend:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: bca-backend
    ports:
      - '3000:3000'   # Single API endpoint for all services
    environment:
      NODE_ENV: development
      # Database
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: dev_password
      DB_NAME: blockchain_ads_dev
      # Redis
      REDIS_HOST: redis
      REDIS_PORT: 6379
      # TypeSense
      TYPESENSE_API_URL: http://typesense:8108
      TYPESENSE_API_KEY: dev_api_key
      # External APIs
      STRIPE_SECRET_KEY: ${STRIPE_TEST_KEY}
      TRAFFICENGINE_API_KEY: test_key
    volumes:
      - ./src:/app/src
      - ./package.json:/app/package.json
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      typesense:
        condition: service_healthy
    command: npm run dev

  # Admin UI (for viewing Redis cache)
  admin-ui:
    image: rediscommander/redis-commander:latest
    container_name: bca-admin-ui
    ports:
      - '8081:8081'
    environment:
      REDIS_HOSTS: local:redis:6379
    depends_on:
      - redis

volumes:
  postgres_data:
  redis_data:
  typesense_data:
```

### Monorepo Structure (Single Backend Container)

```
backend/
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.repository.ts
│   │   ├── campaigns/
│   │   │   ├── campaigns.routes.ts
│   │   │   ├── campaigns.controller.ts
│   │   │   ├── campaigns.service.ts
│   │   │   └── campaigns.repository.ts
│   │   ├── payments/
│   │   ├── analytics/
│   │   ├── publishers/
│   │   └── pixels/
│   ├── jobs/
│   │   ├── campaignStatsSync.ts
│   │   ├── manageCaps.ts
│   │   └── scheduler.ts
│   ├── middleware/
│   ├── db/
│   ├── config/
│   ├── index.ts
│   └── server.ts
├── package.json
├── tsconfig.json
└── Dockerfile.dev
```

### Dockerfile.dev (Single Backend Container)

```dockerfile
# Dockerfile.dev
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code (will be overridden by volume mount)
COPY . .

# Expose single API port
EXPOSE 3000

# Start dev server with hot reload
CMD ["npm", "run", "dev"]
```

### Package.json for Monorepo Backend

```json
{
  "name": "blockchain-ads-backend",
  "version": "2.0.0",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "knex": "knex --knexfile knexfile.ts"
  },
  "dependencies": {
    "fastify": "^5.0.0",
    "@fastify/helmet": "^12.0.0",
    "fastify-type-provider-zod": "^2.0.0",
    "zod": "^3.23.0",
    "knex": "^3.1.0",
    "pg": "^8.13.1",
    "ioredis": "^5.4.1",
    "firebase-admin": "^12.0.0",
    "node-cron": "^3.0.3"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Scheduler Integration (Built into Backend)

```typescript
// src/jobs/scheduler.ts
import cron from 'node-cron';
import { db } from '@/db/knex';
import { syncCampaignStats } from './campaignStatsSync';
import { manageCaps } from './manageCaps';

export function startScheduler() {
  console.log('🕐 Starting integrated scheduler...');

  // Every 7 minutes: Campaign stats sync
  cron.schedule('*/7 * * * *', async () => {
    console.log('⏰ Running campaign stats sync...');
    try {
      await syncCampaignStats();
      console.log('✅ Campaign stats sync completed');
    } catch (error) {
      console.error('❌ Campaign stats sync failed:', error);
    }
  });

  // Every 2 minutes: Campaign caps
  cron.schedule('*/2 * * * *', async () => {
    console.log('⏰ Running campaign caps management...');
    try {
      await manageCaps();
      console.log('✅ Campaign caps completed');
    } catch (error) {
      console.error('❌ Campaign caps failed:', error);
    }
  });

  console.log('✅ Scheduler started successfully!');
}
```

### Main Server File (All Services in One)

```typescript
// src/server.ts
import fastify from 'fastify';
import helmet from '@fastify/helmet';
import { startScheduler } from './jobs/scheduler';

// Import all feature routes
import authRoutes from './features/auth/auth.routes';
import campaignRoutes from './features/campaigns/campaigns.routes';
import paymentRoutes from './features/payments/payments.routes';
import analyticsRoutes from './features/analytics/analytics.routes';
import publisherRoutes from './features/publishers/publishers.routes';

const server = fastify({ logger: true });

// Middleware
server.register(helmet);

// Health check
server.get('/health', async () => ({ status: 'ok' }));

// Register all feature routes
server.register(authRoutes, { prefix: '/auth' });
server.register(campaignRoutes, { prefix: '/campaigns' });
server.register(paymentRoutes, { prefix: '/payments' });
server.register(analyticsRoutes, { prefix: '/analytics' });
server.register(publisherRoutes, { prefix: '/publishers' });

// Start scheduler for background jobs
if (process.env.NODE_ENV === 'development') {
  startScheduler();
}

// Start server
const start = async () => {
  try {
    await server.listen({
      port: Number(process.env.PORT) || 3000,
      host: '0.0.0.0'
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
```

### Campaign Service Job Endpoints

```typescript
// services/campaign-service/src/jobs/campaignStatsSync.ts
import { FastifyInstance } from 'fastify';
import { db } from '@/db/knex';
import { getFirestore } from 'firebase-admin/firestore';
import { TrafficEngineAPI } from '@/integrations/trafficEngine';

export async function campaignStatsRoutes(server: FastifyInstance) {
  // Job endpoint for syncing campaign stats
  server.post('/jobs/sync-stats', async (request, reply) => {
    const startTime = Date.now();
    const firestore = getFirestore();

    try {
      // 1. Get active campaigns from PostgreSQL
      const activeCampaigns = await db('campaigns')
        .where('status', 'active')
        .select('id', 'external_id');

      server.log.info(`Found ${activeCampaigns.length} active campaigns to sync`);

      let successCount = 0;
      let errorCount = 0;

      for (const campaign of activeCampaigns) {
        try {
          // 2. Fetch stats from TrafficEngine API
          const stats = await TrafficEngineAPI.getCampaignStats(campaign.external_id);

          // 3. Update PostgreSQL (for complex queries/analytics)
          await db('campaigns')
            .where('id', campaign.id)
            .update({
              impressions: stats.impressions,
              clicks: stats.clicks,
              spent: stats.spent,
              updated_at: new Date(),
            });

          // 4. Update Firestore (for real-time UI updates)
          await firestore
            .collection('realtime_campaigns')
            .doc(campaign.id)
            .update({
              impressions: stats.impressions,
              clicks: stats.clicks,
              spent: stats.spent,
              updatedAt: new Date(),
            });

          successCount++;
        } catch (error) {
          server.log.error(`Failed to sync campaign ${campaign.id}:`, error);
          errorCount++;
        }
      }

      const duration = Date.now() - startTime;

      return reply.send({
        success: true,
        message: 'Campaign stats sync completed',
        stats: {
          totalCampaigns: activeCampaigns.length,
          successCount,
          errorCount,
          durationMs: duration,
        },
      });
    } catch (error) {
      server.log.error('Campaign stats sync failed:', error);
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  // Job endpoint for managing campaign caps
  server.post('/jobs/manage-caps', async (request, reply) => {
    // Budget and cap management logic
    // (same as V1 manageCampaignCaps function)
    return reply.send({ success: true, message: 'Campaign caps managed' });
  });

  // Job endpoint for publisher balances
  server.post('/jobs/sync-publisher-balances', async (request, reply) => {
    // Publisher balance sync logic
    // (same as V1 updateAllPublisherBalances function)
    return reply.send({ success: true, message: 'Publisher balances synced' });
  });
}
```

### Local Development Workflow

#### 1. First Time Setup

```bash
# Clone V2 monorepo
git clone <v2-repo-url>
cd blockchain-ads-v2

# Start everything with one command
docker-compose up

# In another terminal: Run database migrations
docker-compose exec backend npm run knex migrate:latest

# Seed initial data (roles, permissions)
docker-compose exec backend npm run knex seed:run
```

#### 2. Daily Development

```bash
# Start all services (PostgreSQL, Redis, TypeSense, Backend)
docker-compose up

# Watch backend logs
docker-compose logs -f backend

# Restart backend (after installing new packages)
docker-compose restart backend

# Stop all services
docker-compose down
```

#### 3. Trigger Jobs Manually (for testing)

Jobs run automatically via the integrated scheduler (node-cron), but you can also trigger them manually:

```bash
# The scheduler runs these automatically:
# - Campaign stats sync: Every 7 minutes
# - Campaign caps management: Every 2 minutes
# - Publisher balances: Daily at 1 AM

# To test a job immediately, you can add HTTP endpoints in your code:
# Example: Add to src/server.ts:
# server.post('/dev/jobs/sync-stats', async () => {
#   await syncCampaignStats();
#   return { success: true };
# });

# Then trigger manually:
curl -X POST http://localhost:3000/dev/jobs/sync-stats
```

#### 4. Database Management

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d blockchain_ads_dev

# Run migrations from backend container
docker-compose exec backend npm run knex migrate:latest

# Rollback migration
docker-compose exec backend npm run knex migrate:rollback

# Seed data
docker-compose exec backend npm run knex seed:run

# View Redis cache
docker-compose exec redis redis-cli
# Then run: KEYS *
# Or use Redis Commander UI: http://localhost:8081
```

#### 5. Monitor Background Jobs

```bash
# View backend logs (includes scheduler output)
docker-compose logs -f backend

# Filter for scheduler logs only
docker-compose logs -f backend | grep "scheduler"

# View all service logs
docker-compose logs -f

# View Redis queue status via UI
# Open browser: http://localhost:8081 (Redis Commander)
```

#### 6. Development Tips

```bash
# Rebuild backend after dependency changes
docker-compose build backend
docker-compose up backend

# Clean restart (removes all data)
docker-compose down -v
docker-compose up

# Access backend shell
docker-compose exec backend sh

# Check TypeSense health
curl http://localhost:8108/health

# View all running containers
docker-compose ps
```

### Environment Variables (.env.local)

```bash
# .env.local (for local development)
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=dev_password
DB_NAME=blockchain_ads_dev

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Pub/Sub Emulator
PUBSUB_EMULATOR_HOST=localhost:8085
PUBSUB_PROJECT_ID=local-dev

# Cloud Tasks Emulator
TASKS_EMULATOR_HOST=localhost:8123

# Meilisearch
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_MASTER_KEY=dev_master_key

# External APIs (use test credentials)
STRIPE_SECRET_KEY=sk_test_...
TRAFFICENGINE_API_KEY=test_key

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
CAMPAIGN_SERVICE_URL=http://localhost:3002
PAYMENT_SERVICE_URL=http://localhost:3003
ANALYTICS_SERVICE_URL=http://localhost:3004
PUBLISHER_SERVICE_URL=http://localhost:3005
```

### V1 vs V2 Local Development Comparison

| Aspect | V1 (Firebase Emulators) | **V2 (Docker Compose)** |
|--------|-------------------------|-------------------------|
| **Setup Time** | ⚠️ 30+ minutes | ✅ 5 minutes |
| **Start Command** | ❌ Multiple commands | ✅ `docker-compose up` |
| **Background Jobs** | ❌ Manual trigger only | ✅ Automatic with cron |
| **Database** | ⚠️ Firestore emulator (slow) | ✅ Real PostgreSQL |
| **Caching** | ❌ None | ✅ Real Redis |
| **Search** | ⚠️ Separate process | ✅ Integrated TypeSense |
| **Job Monitoring** | ❌ No UI | ✅ Redis Commander + logs |
| **Hot Reload** | ⚠️ Inconsistent | ✅ Nodemon for all services |
| **Port Conflicts** | ⚠️ Common | ✅ Isolated in Docker |
| **Team Onboarding** | ⚠️ 1-2 days | ✅ 1 hour |

### Benefits of V2 Local Development

1. ✅ **One Command Start**: `docker-compose up` starts everything
2. ✅ **Automatic Background Jobs**: Scheduler runs jobs just like production
3. ✅ **Real Database**: PostgreSQL locally matches production exactly
4. ✅ **Easy Testing**: Trigger jobs manually via HTTP endpoints
5. ✅ **Isolated Environment**: No port conflicts, no global dependencies
6. ✅ **Team Consistency**: Everyone has identical setup
7. ✅ **Fast Iteration**: Hot reload on code changes
8. ✅ **Production Parity**: Same tech stack as Cloud Run

### Troubleshooting

```bash
# Backend won't start?
docker-compose logs backend

# Database connection error?
docker-compose exec postgres psql -U postgres -d blockchain_ads_dev

# Redis cache issue?
docker-compose exec redis redis-cli FLUSHALL

# Rebuild after dependency changes
docker-compose build backend
docker-compose up --force-recreate backend

# Clean start (removes all data)
docker-compose down -v
docker-compose up
```

V2 local development provides a complete environment where background jobs run automatically, all services work together, and the full system can be tested locally with a single command.

---

## 12. Deployment Strategy: Monorepo to Production

### Understanding the Architecture Duality

The V2 architecture supports **two deployment models** from the same monorepo codebase:

#### **Local Development: Monolith Approach**
- **Single Container**: All features run in one Fastify server
- **Single Port**: Port 3000 serves all endpoints
- **Integrated Scheduler**: Background jobs run within the same process
- **Fast Iteration**: Hot reload for rapid development
- **Simple Debugging**: Everything in one place

#### **Production: Microservices Approach** (Recommended)
- **6 Separate Cloud Run Services**: Each feature as an independent service
- **Independent Scaling**: Scale each service based on its load
- **Fault Isolation**: One service failure doesn't affect others
- **Team Organization**: Different teams can own different services
- **Cost Optimization**: Pay only for what each service uses

### How the Monorepo Enables Both Models

The feature-based monorepo structure is designed to support both deployment models:

```
backend/
├── src/
│   ├── features/
│   │   ├── auth/           # Auth Service
│   │   ├── campaigns/      # Campaign Service
│   │   ├── payments/       # Payment Service
│   │   ├── analytics/      # Analytics Service
│   │   ├── publishers/     # Publisher Service
│   │   └── pixels/         # Pixel Tracking Service
│   ├── shared/             # Shared utilities, middleware, types
│   ├── db/                 # Database connections and migrations
│   ├── jobs/               # Background job definitions
│   ├── server.ts           # LOCAL: Single server with all routes
│   └── services/           # PRODUCTION: Individual service entry points
│       ├── auth-server.ts
│       ├── campaign-server.ts
│       ├── payment-server.ts
│       ├── analytics-server.ts
│       ├── publisher-server.ts
│       └── pixel-server.ts
```

### Production Deployment: Individual Service Entry Points

Each production service has its own entry point that registers **only its specific routes**:

#### Example: Auth Service Entry Point
```typescript
// src/services/auth-server.ts
import fastify from 'fastify';
import helmet from '@fastify/helmet';
import authRoutes from '../features/auth/auth.routes';
import userRoutes from '../features/auth/users.routes';

const server = fastify({ logger: true });

// Middleware
server.register(helmet);

// Health check
server.get('/health', async () => ({ status: 'ok', service: 'auth' }));

// Register ONLY auth-related routes
server.register(authRoutes, { prefix: '/auth' });
server.register(userRoutes, { prefix: '/users' });

// Start server
const start = async () => {
  try {
    await server.listen({
      port: Number(process.env.PORT) || 8080,  // Cloud Run default
      host: '0.0.0.0'  // Required for Cloud Run
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
```

#### Example: Campaign Service Entry Point
```typescript
// src/services/campaign-server.ts
import fastify from 'fastify';
import helmet from '@fastify/helmet';
import campaignRoutes from '../features/campaigns/campaigns.routes';
import statsRoutes from '../features/campaigns/stats.routes';

const server = fastify({ logger: true });

server.register(helmet);
server.get('/health', async () => ({ status: 'ok', service: 'campaign' }));

// Register ONLY campaign-related routes
server.register(campaignRoutes, { prefix: '/campaigns' });
server.register(statsRoutes, { prefix: '/stats' });

const start = async () => {
  try {
    await server.listen({
      port: Number(process.env.PORT) || 8080,
      host: '0.0.0.0'
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
```

### Local Development: Combined Server

For local development, a single server registers **all routes**:

```typescript
// src/server.ts (LOCAL DEVELOPMENT ONLY)
import fastify from 'fastify';
import helmet from '@fastify/helmet';
import { startScheduler } from './jobs/scheduler';

// Import all feature routes
import authRoutes from './features/auth/auth.routes';
import campaignRoutes from './features/campaigns/campaigns.routes';
import paymentRoutes from './features/payments/payments.routes';
import analyticsRoutes from './features/analytics/analytics.routes';
import publisherRoutes from './features/publishers/publishers.routes';
import pixelRoutes from './features/pixels/pixels.routes';

const server = fastify({ logger: true });

server.register(helmet);
server.get('/health', async () => ({ status: 'ok' }));

// Register ALL feature routes in one server
server.register(authRoutes, { prefix: '/auth' });
server.register(campaignRoutes, { prefix: '/campaigns' });
server.register(paymentRoutes, { prefix: '/payments' });
server.register(analyticsRoutes, { prefix: '/analytics' });
server.register(publisherRoutes, { prefix: '/publishers' });
server.register(pixelRoutes, { prefix: '/pixels' });

// Start integrated scheduler for background jobs
if (process.env.NODE_ENV === 'development') {
  startScheduler();
}

const start = async () => {
  try {
    await server.listen({
      port: Number(process.env.PORT) || 3000,
      host: '0.0.0.0'
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
```

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION DEPLOYMENT                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Frontend (Next.js)                                                 │
│         │                                                            │
│         ▼                                                            │
│  API Gateway / Load Balancer                                        │
│         │                                                            │
│         ├─────────► Cloud Run: Auth Service                         │
│         │           (auth-server.ts)                                │
│         │           Port: 8080                                      │
│         │           Routes: /auth/*, /users/*                       │
│         │                                                            │
│         ├─────────► Cloud Run: Campaign Service                     │
│         │           (campaign-server.ts)                            │
│         │           Port: 8080                                      │
│         │           Routes: /campaigns/*, /stats/*                  │
│         │                                                            │
│         ├─────────► Cloud Run: Payment Service                      │
│         │           (payment-server.ts)                             │
│         │           Port: 8080                                      │
│         │           Routes: /payments/*, /billing/*                 │
│         │                                                            │
│         ├─────────► Cloud Run: Analytics Service                    │
│         │           (analytics-server.ts)                           │
│         │           Port: 8080                                      │
│         │           Routes: /analytics/*, /reports/*                │
│         │                                                            │
│         ├─────────► Cloud Run: Publisher Service                    │
│         │           (publisher-server.ts)                           │
│         │           Port: 8080                                      │
│         │           Routes: /publishers/*, /payouts/*               │
│         │                                                            │
│         └─────────► Cloud Run: Pixel Tracking Service               │
│                     (pixel-server.ts)                               │
│                     Port: 8080                                      │
│                     Routes: /pixels/*, /conversions/*               │
│                                                                      │
│  All Services Connect To:                                           │
│  ├── Cloud SQL (PostgreSQL)                                         │
│  ├── Memorystore (Redis)                                            │
│  ├── Firestore (real-time data)                                     │
│  └── BigQuery (analytics)                                           │
│                                                                      │
│  Background Jobs:                                                    │
│  ├── Cloud Scheduler → Cloud Tasks → Service Endpoints              │
│  └── Pub/Sub → Service Endpoints                                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      LOCAL DEVELOPMENT SETUP                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Frontend (Next.js)                                                 │
│         │                                                            │
│         ▼                                                            │
│  Single Backend Container (server.ts)                               │
│         Port: 3000                                                  │
│         Routes: ALL routes in one server                            │
│         ├── /auth/*                                                 │
│         ├── /campaigns/*                                            │
│         ├── /payments/*                                             │
│         ├── /analytics/*                                            │
│         ├── /publishers/*                                           │
│         └── /pixels/*                                               │
│                                                                      │
│  Infrastructure Containers:                                          │
│  ├── PostgreSQL (postgres:15-alpine)                               │
│  ├── Redis (redis:7-alpine)                                        │
│  ├── TypeSense (typesense:26.0)                                    │
│  └── Admin UI (redis-commander)                                    │
│                                                                      │
│  Integrated Scheduler:                                              │
│  └── node-cron (runs within backend container)                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Production Dockerfiles

Each service has its own optimized Dockerfile:

#### Dockerfile for Each Service
```dockerfile
# Dockerfile.auth (similar for other services)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy shared code and auth service code
COPY src/shared ./src/shared
COPY src/db ./src/db
COPY src/features/auth ./src/features/auth
COPY src/services/auth-server.ts ./src/services/auth-server.ts

# Build TypeScript
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy built files and node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Cloud Run requires port 8080 by default
ENV PORT=8080

EXPOSE 8080

# Start the auth service
CMD ["node", "dist/services/auth-server.js"]
```

### Deployment Commands

```bash
# Build and deploy Auth Service
docker build -f Dockerfile.auth -t gcr.io/PROJECT_ID/auth-service .
docker push gcr.io/PROJECT_ID/auth-service
gcloud run deploy auth-service \
  --image gcr.io/PROJECT_ID/auth-service \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Build and deploy Campaign Service
docker build -f Dockerfile.campaign -t gcr.io/PROJECT_ID/campaign-service .
docker push gcr.io/PROJECT_ID/campaign-service
gcloud run deploy campaign-service \
  --image gcr.io/PROJECT_ID/campaign-service \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Similar for other services...
```

### Alternative: Monolith Production Deployment (Simpler)

If you prefer to start simpler and deploy as a monolith in production:

```bash
# Use the same server.ts for production
docker build -f Dockerfile.dev -t gcr.io/PROJECT_ID/backend .
docker push gcr.io/PROJECT_ID/backend
gcloud run deploy backend \
  --image gcr.io/PROJECT_ID/backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --min-instances 1 \
  --max-instances 10 \
  --cpu 2 \
  --memory 4Gi
```

**Advantages:**
- ✅ Simpler deployment (one service instead of six)
- ✅ No API gateway needed
- ✅ Lower infrastructure complexity
- ✅ Easier to debug and monitor
- ✅ Faster to implement

**Disadvantages:**
- ⚠️ All-or-nothing scaling
- ⚠️ Single point of failure
- ⚠️ Cannot scale features independently
- ⚠️ Larger cold start times

### Recommended Approach

**Phase 1 (Months 1-3): Start with Monolith**
- Deploy single backend service to Cloud Run
- Get V2 working with all features
- Migrate data and test thoroughly
- Keep architecture simple during transition

**Phase 2 (Months 4-6): Split into Microservices**
- Create individual service entry points
- Set up API gateway
- Gradually move features to separate services
- Start with non-critical services (analytics, publishers)
- Move critical services last (auth, payments)

### Cost Comparison

**Monolith Deployment:**
```
Cloud Run (single service):    $150-250/month
Cloud SQL:                     $150-250/month
Redis:                         $100-150/month
Firestore:                     $150-250/month
TypeSense:                     $50-100/month
Total:                         $600-1000/month
```

**Microservices Deployment:**
```
Cloud Run (6 services):        $300-480/month
API Gateway:                   $50-100/month
Cloud SQL:                     $150-250/month
Redis:                         $100-150/month
Firestore:                     $150-250/month
TypeSense:                     $50-100/month
Total:                         $800-1330/month
```

The monorepo architecture gives you **flexibility to choose** based on your current needs while maintaining the ability to evolve into microservices as your platform grows.

---

## 13. Migration Timeline

### Phase 1-2: Infrastructure (Months 1-2)

**Week 1-2: Google Cloud Setup**
```bash
# Create project
gcloud projects create blockchain-ads-v2

# Enable APIs
gcloud services enable \
  run.googleapis.com \
  sql-component.googleapis.com \
  redis.googleapis.com \
  secretmanager.googleapis.com \
  cloudtasks.googleapis.com \
  pubsub.googleapis.com \
  bigquery.googleapis.com

# Create Cloud SQL instance
gcloud sql instances create main-db \
  --database-version=POSTGRES_15 \
  --tier=db-custom-2-7680 \
  --region=us-central1 \
  --backup-start-time=01:00

# Create Redis instance
gcloud redis instances create main-cache \
  --size=5 \
  --region=us-central1 \
  --redis-version=redis_7_0

# Create BigQuery dataset
bq mk --dataset --location=US analytics_data
```

**Week 3-4: Auth Service (Fastify)**
```bash
# Create Fastify project
mkdir auth-service && cd auth-service
npm init -y
npm install fastify @fastify/helmet fastify-type-provider-zod zod knex pg

# Project structure (feature-based architecture)
src/
├── features/
│   ├── auth/
│   │   ├── auth.routes.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   └── auth.validation.ts
│   └── users/
├── middleware/
├── db/
│   ├── knex.ts
│   └── migrations/
├── index.ts
└── server.ts

# Deploy to Cloud Run
gcloud run deploy auth-service \
  --source . \
  --region us-central1 \
  --min-instances 2
```

**Week 5-6: Campaign Service (Fastify)**
- Feature-based structure (campaigns/, integrations/)
- Knex.js with PostgreSQL
- TrafficEngine & Revive integration
- Dual-write pattern (PostgreSQL + Firestore)

**Week 7-8: Payment & Publisher Services (Fastify)**
- Payment providers (Stripe, Crypto, Wise)
- Publisher management
- Payout processing

### Phase 3-4: Analytics & Frontend (Months 3-4)

**Week 9-10: Analytics & Pixel Tracking**
- Analytics Service (Fastify + BigQuery)
- Pixel Tracking (Go for performance)

**Week 11-14: Frontend Migration (Next.js)**
- Next.js 14 with TypeScript
- Feature migration
- Permission-based UI components

### Phase 5: Data Migration (Month 5)

**Week 17-18: Historical Data Migration**
- Firestore → PostgreSQL migration scripts
- Data validation
- Dual-write testing

**Week 19-20: Traffic Migration**
- Gradual traffic shift (10% → 25% → 50% → 75% → 100%)
- V1 decommission

### Phase 6: Optimization (Month 6)

**Week 21-24:**
- Performance optimization
- Cost optimization
- Monitoring setup
- Documentation

---

## 13. Performance Comparison

### V1 Performance (Express)
```
API Response (p95): 500-2000ms
Cold Start: 2-5s
Throughput: 1,000-5,000 req/s
Database Query: 100-500ms
Frontend Load (FCP): 2-4s
```

### V2 Target Performance (Fastify)
```
API Response (p95): 50-200ms (2-10x faster!)
Cold Start: <10ms (100-500x faster!)
Throughput: 50,000-100,000 req/s (10-20x!)
Database Query: 10-50ms (2-10x faster!)
Frontend Load (FCP): 0.5-1s (2-4x faster!)
```

### Fastify Benchmarks
```bash
# Results from benchmarking tools
Requests/sec:    76,000  (vs NestJS: 25,000)
Latency p95:     15ms    (vs NestJS: 45ms)
Memory usage:    50MB    (vs NestJS: 120MB)
Cold start:      <10ms   (vs NestJS: ~50ms)
```

---

## 14. Deployment Checklist

### Pre-Deployment
- [ ] Google Cloud project created
- [ ] Cloud SQL (PostgreSQL) provisioned
- [ ] Redis instance running
- [ ] Secret Manager configured
- [ ] Service accounts created
- [ ] API Gateway configured

### Service Deployment (Fastify)
- [ ] Auth service deployed (feature-based structure)
- [ ] Campaign service deployed (with Knex.js)
- [ ] Payment service deployed
- [ ] Analytics service deployed
- [ ] Pixel tracking deployed (Go)
- [ ] Publisher service deployed

### Data Migration
- [ ] Schema migrations run (Knex)
- [ ] Seed data loaded (roles, permissions)
- [ ] Historical data migrated (Firestore → PostgreSQL)
- [ ] Data validation complete
- [ ] Dual-write enabled
- [ ] Consistency checks passed

### Frontend Deployment
- [ ] Next.js app built successfully
- [ ] Deployed to Firebase Hosting
- [ ] Environment variables configured
- [ ] API endpoints updated
- [ ] Authentication working
- [ ] Permission-based UI tested
- [ ] Performance targets met

### Go-Live
- [ ] Traffic split configured (API Gateway)
- [ ] Monitoring dashboards active
- [ ] Alerts configured
- [ ] Rollback plan tested
- [ ] Documentation updated
- [ ] Team trained

---

## 15. Success Metrics

### Technical KPIs
- API p95 latency < 200ms
- 99.9% uptime SLA
- Cold starts < 10ms
- Database query < 50ms
- Frontend FCP < 1s
- Deploy time < 5 minutes

### Business KPIs
- Cost reduction 15-50% ($500-1,600/month savings)
- Developer velocity +50%
- Bug reduction 40%
- Feature delivery 2x faster

### Monitoring Alerts
- Error rate > 1%
- Latency p95 > 500ms
- CPU > 80%
- Memory > 80%
- Failed deployments
- Database connections > 80%

---

## 16. API Gateway Configuration

### OpenAPI Specification

```yaml
openapi: 3.0.0
info:
  title: Blockchain-Ads API
  version: 2.0.0

servers:
  - url: https://api.blockchain-ads.com

paths:
  /auth/login:
    post:
      x-google-backend:
        address: https://auth-service-xxx.run.app/auth/login
      security:
        - api_key: []

  /campaigns:
    get:
      x-google-backend:
        address: https://campaign-service-xxx.run.app/campaigns
      security:
        - firebase_auth: []

  /campaigns/{id}:
    get:
      x-google-backend:
        address: https://campaign-service-xxx.run.app/campaigns/{id}

  /payments:
    post:
      x-google-backend:
        address: https://payment-service-xxx.run.app/payments

securitySchemes:
  firebase_auth:
    type: oauth2
  api_key:
    type: apiKey
    in: header
    name: x-api-key
```

---

## 17. Monitoring & Observability

### Cloud Logging Setup

```bash
# Create log-based metrics
gcloud logging metrics create api_error_rate \
  --description="API error rate" \
  --log-filter='resource.type="cloud_run_revision" AND severity=ERROR'

# Create alerts
gcloud alpha monitoring policies create \
  --notification-channels=email-channel \
  --display-name="High API Error Rate" \
  --condition-threshold-value=0.05
```

### Dashboards

```json
{
  "displayName": "Campaign Service Dashboard",
  "gridLayout": {
    "widgets": [
      {
        "title": "Request Count",
        "xyChart": {
          "dataSets": [{
            "timeSeriesQuery": {
              "timeSeriesFilter": {
                "filter": "resource.type=\"cloud_run_revision\"",
                "aggregation": {
                  "alignmentPeriod": "60s",
                  "perSeriesAligner": "ALIGN_RATE"
                }
              }
            }
          }]
        }
      },
      {
        "title": "Response Latency",
        "xyChart": {
          "dataSets": [{
            "timeSeriesQuery": {
              "timeSeriesFilter": {
                "filter": "metric.type=\"run.googleapis.com/request_latencies\"",
                "aggregation": {
                  "alignmentPeriod": "60s",
                  "perSeriesAligner": "ALIGN_PERCENTILE_95"
                }
              }
            }
          }]
        }
      }
    ]
  }
}
```

---

## 18. Security Enhancements

### Authentication Flow (Fastify)

```typescript
// V1: Basic Firebase Auth
const token = await user.getIdToken()
headers.Authorization = `Bearer ${token}`

// V2: Enhanced with API Gateway + Fastify
const token = await user.getIdToken()
headers.Authorization = `Bearer ${token}`
headers['x-api-key'] = process.env.API_KEY
// API Gateway validates both
```

### Network Security

```bash
# VPC Connector for Cloud Run
gcloud compute networks vpc-access connectors create run-connector \
  --region=us-central1 \
  --range=10.8.0.0/28

# Cloud Run with VPC
gcloud run services update campaign-service \
  --vpc-connector=run-connector \
  --vpc-egress=all-traffic

# Cloud SQL private IP
gcloud sql instances patch main-db \
  --network=projects/PROJECT_ID/global/networks/default \
  --no-assign-ip
```

### Secret Management

```bash
# Create secrets
echo -n "db-password" | gcloud secrets create db-password --data-file=-
echo -n "stripe-key" | gcloud secrets create stripe-key --data-file=-

# Grant access to Cloud Run
gcloud secrets add-iam-policy-binding db-password \
  --member=serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor

# Use in Cloud Run
gcloud run deploy campaign-service \
  --set-secrets="DB_PASSWORD=db-password:latest,STRIPE_KEY=stripe-key:latest"
```

---

## 19. Rollback Plan

### Service Rollback (Fastify)

```bash
# List revisions
gcloud run revisions list --service=campaign-service

# Rollback to previous revision
gcloud run services update-traffic campaign-service \
  --to-revisions=campaign-service-v2=0,campaign-service-v1=100

# Emergency rollback
gcloud run services replace service.yaml --revision-suffix=rollback
```

### Database Rollback

```bash
# Point-in-time recovery
gcloud sql backups create --instance=main-db

# Restore to specific time
gcloud sql backups restore BACKUP_ID \
  --backup-instance=main-db \
  --backup-instance=main-db
```

### Data Rollback

```typescript
// Keep dual-write active for 1 month
// Can switch back to Firestore if needed
async function switchToFirestore() {
  // Update service configs to read from Firestore
  // Keep PostgreSQL for backup
  await updateServiceConfig({
    primaryDB: 'firestore',
    backupDB: 'postgresql'
  })
}
```

---

## 20. Team & Timeline

### Team Structure
```
Lead Engineer: Architecture & coordination
Backend Developer: Microservices migration (Fastify)
Frontend Developer: Next.js migration
Total: 2-3 developers
```

### 6-Month Timeline
```
Month 1: Infrastructure + Auth Service (Fastify)
Month 2: Campaign + Payment Services (Fastify)
Month 3: Publisher + Analytics Services (Fastify + Go)
Month 4: Frontend Migration (Next.js)
Month 5: Data Migration + Optimization
Month 6: Traffic Migration + Decommission
```

### Milestones
```
Week 4:  Auth service in production (Fastify)
Week 8:  All backend services deployed (Fastify)
Week 14: Frontend in production (Next.js)
Week 18: Data migration complete
Week 20: V1 decommissioned
Week 24: Optimization complete
```

---

**Status:** Ready for Implementation with Fastify
**Next Step:** Implement microservices using Fastify feature-based architecture, migrate business logic from V1 codebase
**Framework:** Fastify 5+ (2-3x faster than NestJS, simpler architecture)
**Business Logic Source:** Migrate from V1 codebase at `/home/diko/Documents/work/blockchain-ads/BCA-HUB-Backend-Firebase/functions/`