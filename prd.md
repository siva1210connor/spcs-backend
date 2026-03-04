# 📌 Project Plan — Phased Task Breakdown (Ask Phase-by-Phase)

Below is a complete breakdown of all work grouped into phases.  
You can say: **“Start Phase 1”** and I’ll guide you step-by-step + provide scripts/configs/code.

---

## Phase 0 — Project Foundations (One-time Setup)
**Goal:** Get repository + local environment ready.

- Initialize repo (Git), README, license
- Node.js setup (ESM), package.json scripts
- Add linting/formatting (ESLint + Prettier) *(optional but recommended)*
- Add `.env.example`, config loader, environment validation
- Create minimal folder structure in `src/`
- Setup Prisma 7 config (`prisma.config.ts`) + `schema.prisma`
- Setup Postgres locally (winget / docker) and verify connectivity
- Generate Prisma client successfully (`npx prisma generate`)
- Add Docker files *(optional in Phase 0 or Phase 8)*:
  - `docker-compose.yml` (postgres + redis + api)
  - `Dockerfile`
  - `.dockerignore`

Deliverables:
- Working server boots with `/health`
- Prisma generate works
- DB connection works

---

## Phase 1 — Backend Core (Express Architecture + Security Baseline)
**Goal:** Production-grade Express foundation with security + standards.

- Express app bootstrap (`src/index.js`, `src/app.js`)
- Global middleware:
  - helmet, cors allowlist, compression, cookie-parser
  - JSON body size limits
- Logging:
  - pino + request correlation-id
- Standard API response + error format
- Central error middleware + 404 handler
- Rate limiting:
  - global rate limiter
  - auth-specific limiter
  - Redis store (production-ready)
- Request validation middleware (Zod)
- API versioning: `/api/v1`
- Health checks: `/health`, `/ready`
- Basic RBAC middleware (USER/ADMIN)
- Prisma client wrapper (`src/config/prisma.js`)

Deliverables:
- Clean `src/` architecture
- Secure defaults enabled
- Consistent API behavior

---

## Phase 2 — Authentication (OTP + Token Strategy)
**Goal:** OTP login + secure token issuance (user + admin readiness).

- OTP request endpoint (`/user/auth/login`)
  - store OTP hash + TTL (Redis preferred)
  - resend rules + cooldown
- OTP verification endpoint (`/user/auth/verifyOtp`)
  - validate OTP
  - issue access + refresh tokens
- Signup endpoint (`/user/auth/signUp`)
- JWT architecture:
  - access token short TTL
  - refresh token rotation
  - refresh token storage (DB table)
  - logout (invalidate refresh)
- Admin auth entry (optional here or Phase 5)
- Security hardening:
  - brute-force protections
  - device/session tracking (optional)

Deliverables:
- OTP flow end-to-end works
- JWT issued and validated
- Refresh rotation implemented

---

## Phase 3 — Core Commerce (Catalog + Cart + Wishlist)
**Goal:** Build the user shopping experience backend.

- Category APIs (public + admin)
- Book listing:
  - filters: best_seller, new_arrival, category, price, language
  - pagination
  - sorting
- Book details endpoint
- Cart:
  - add/update/remove
  - validate stock rules (unlimited_stock)
- Wishlist:
  - add/remove/list

Deliverables:
- Catalog browsing works
- Cart/wishlist works
- DB relations finalized for these modules

---

## Phase 4 — Orders + Pricing (Rules/Discounts + Checkout)
**Goal:** Complete purchase/order management core.

- Order creation flow:
  - cart → order
  - order_items table (normalized)
- Pricing engine:
  - discount code validation
  - rules table application (from_price/to_price)
  - shipping charge logic
- Order status lifecycle:
  - pending → fulfilled/shipped/completed
  - cancel/refund flows
- Admin order listing + filtering (book/ebook/audiobook)
- Order detail endpoints (admin)
- Idempotency support (recommended) for order create/payment callbacks

Deliverables:
- Orders created correctly with correct totals
- Admin can view and manage statuses

---

## Phase 5 — Admin CMS Modules (As Per Your API List)
**Goal:** Implement all admin endpoints and CMS entities.

- Admin dashboard + metrics
- Slider CRUD
- Books CRUD
- Offers CRUD
- Rules CRUD
- News/events CRUD
- Awards CRUD
- Gallery album CRUD + gallery CRUD
- Downloads CRUD
- Ads CRUD
- Scheme CRUD
- Archives CRUD + download endpoint
- Bulletin CRUD
- Catalogue CRUD
- Reviews moderation
- Feedback listing + reply + delete
- Audit logs for admin actions

Deliverables:
- Admin API contract fully implemented
- Role protection + audit logs

---

## Phase 6 — Digital Delivery (E-Books + Audiobooks)
**Goal:** Secure distribution and high-performance streaming.

- File storage:
  - S3-compatible upload integration
  - signed URL generator endpoints
- E-book delivery:
  - purchase entitlement check
  - signed download URL (short TTL)
- Audiobook streaming:
  - HLS pipeline (transcode → segments)
  - CDN strategy
  - signed manifest URLs
  - playback progress tracking (AudioProgress table)
- Anti-abuse controls:
  - rate limit signed URL endpoints
  - token binding (optional)
  - audit access logs

Deliverables:
- E-book downloads secured
- Audiobook streaming low latency + resume works

---

## Phase 7 — Realtime + Notifications
**Goal:** Realtime updates + persistent notification system.

- Socket.IO server setup with auth
- Redis adapter for multi-instance scaling
- Notification table + APIs
- Emit events:
  - order status changes
  - announcements
  - feedback replies
- In-app notification list + read/unread
- Background workers for email/SMS notifications (optional)

Deliverables:
- Realtime working across servers
- Notifications stored and delivered reliably

---

## Phase 8 — DevOps, Scaling, Observability (Production Hardening)
**Goal:** Production readiness and scale.

- Docker production build + compose for local
- CI/CD pipeline:
  - lint/test/build
  - prisma migrate deploy for prod
- Infrastructure blueprint:
  - managed postgres
  - managed redis
  - object storage + CDN
  - load balancer
- Observability:
  - Prometheus metrics endpoint
  - Sentry error reporting
  - structured logs
- Performance:
  - caching strategy in Redis
  - DB indexing + explain plans
  - job queues scaling
- Security:
  - secrets management
  - WAF/CDN protections
  - penetration test checklist

Deliverables:
- Production deployment plan + configs
- Monitoring/alerts ready
- Scaling guidelines documented

---

## Phase 9 — QA, Testing, Release Management
**Goal:** Stable releases and confidence.

- Unit tests (services)
- Integration tests (routes)
- Contract tests for APIs
- Load testing baseline (k6)
- Release checklist + rollback plan
- Staging environment verification process

Deliverables:
- Test coverage baseline
- Release process documented

---

# ✅ How to Use This
Just say:
- **“Start Phase 1”**  
or  
- **“Give tasks for Phase 3 with checklist”**  
and I’ll deliver step-by-step execution + scripts + code.