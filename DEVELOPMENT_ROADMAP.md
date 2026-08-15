# InvestPro - Development Roadmap

**Version:** 1.0  
**Date:** August 14, 2026  
**Status:** Active

---

## Table of Contents

1. [Current State Assessment](#current-state-assessment)
2. [Priority Matrix](#priority-matrix)
3. [Phase 0 - Critical Fixes](#phase-0---critical-fixes)
4. [Phase 1 - Foundation & Correctness](#phase-1---foundation--correctness)
5. [Phase 2 - Testability & Documentation](#phase-2---testability--documentation)
6. [Phase 3 - Business Features](#phase-3---business-features)
7. [Phase 4 - Scale & Performance](#phase-4---scale--performance)
8. [Phase 5 - Expansion](#phase-5---expansion)
9. [External Accounts & Dependencies](#external-accounts--dependencies)
10. [Effort Estimate](#effort-estimate)
11. [Definition of Done](#definition-of-done)

---

## Current State Assessment

Reviewed `investment/investpro` on August 14, 2026.

### What exists (working design)
- Laravel 11 backend with Sanctum auth, wallet system, investments, deposits, withdrawals, KYC, referrals, notifications, and a full admin API (`routes/api.php`)
- Angular 17 frontend with standalone components for all user + admin features
- 11 migrations covering the full schema
- Seeders for demo data, admin account, and 4 investment plans

### What is broken / blocking
| Severity | Issue | Location |
|----------|-------|----------|
| **Critical** | Double payout: daily profit is credited to wallet *and* `current_value` grows; at maturity the full `current_value` (principal + all profit) is credited again → user receives `principal + 2x total_profit` | `backend/app/Services/InvestmentService.php:84-121` |
| **High** | No row locking on wallet balance updates → race conditions can corrupt balances | `backend/app/Services/WalletService.php` |
| **High** | PHP & Composer are not installed on the dev machine; `backend/vendor/` missing | environment |
| **High** | `frontend/node_modules/` missing; PowerShell execution policy blocks `npm` | environment |
| **Medium** | Profit accrual scheduler exists but nothing runs `php artisan schedule:work` → no profits accrue in production | `backend/routes/console.php` |
| **Medium** | No rate limiting on auth endpoints (README claims it exists) | `backend/routes/api.php` |
| **Medium** | `environment.prod.ts` points at placeholder `https://api.investpro.com` | `frontend/src/environments/` |
| **Low** | `APP_DEBUG=true` / `APP_ENV=local` in `.env` (ok for dev only) | `backend/.env` |
| **Low** | Zero tests in backend and frontend | — |

---

## Priority Matrix

| Quadrant | Items |
|----------|-------|
| **Do first** (high value, low effort, no external deps) | Bug fixes, locking, rate limiting, audit log, Docker, tests |
| **Schedule** (high value, medium effort) | CI/CD, Swagger docs, exports, caching, environment configs, backups |
| **Defer until accounts exist** (needs credentials) | Stripe/PayPal, Twilio SMS, Redis cloud, real SMTP, APM |
| **Separate project** | Mobile app, advanced multi-language, custom branding engine |

---

## Phase 0 - Critical Fixes

**Target: 1-2 days**

1. **Fix double-payout bug** in `InvestmentService::accrue()`
   - Option A (recommended): keep daily profit wallet credits; on maturity credit only the original `amount` (principal).
   - Option B: stop crediting daily profit to wallet; on maturity credit full `current_value`.
   - Pick one, document it, and make the demo seeder consistent with it.

2. **Add row locking** in `WalletService`
   - Use `lockForUpdate()` when reading a wallet inside `credit`/`debit`/`creditBonus` transactions.
   - Apply same lock in `AdminWithdrawalController::approve` before the balance check.

3. **Run scheduler in dev** — document/alias `php artisan schedule:work` in the setup scripts; add a production cron line.

4. **Rate limiting** — apply `throttle:api` or tighter limits (`5,1` on login/register) in `routes/api.php`.

---

## Phase 1 - Foundation & Correctness

**Target: 3-5 days**

### 1.1 Docker Setup
- `backend/Dockerfile` (PHP 8.3-fpm + Composer, `opcache` for prod)
- `frontend/Dockerfile` (Node 20 → build → nginx serve)
- `docker-compose.yml`: backend, frontend, MySQL 8, optional Redis
- `.dockerignore`, health checks, env overrides
- Solves the missing PHP/Composer problem for any machine

### 1.2 Git + CI/CD
- `git init`, `.gitignore` already covers vendor/node_modules
- `.github/workflows/ci.yml`: PHP lint + Pint + PHPUnit, `npm ci` + `ng build` + `ng test` on push/PR
- `.github/workflows/deploy.yml`: build Docker images, push to registry, deploy (Railway/Render placeholder)
- Secrets stored as GitHub Actions secrets, never in repo

### 1.3 Environment Configs
- `backend/.env.example` already exists → add `APP_ENV=staging/production` variants, `REDIS_HOST`, payment keys (empty placeholders)
- `frontend/environment.prod.ts` → make API URL injectable via build arg / `NG_APP_API_URL`

### 1.4 Security Baseline
- **Rate limiting** (login, register, deposit, withdrawal) with Laravel `ThrottleRequests`
- **Audit logging** — `AdminAuditLog` model + middleware/service recording admin actions (who, what, when, before/after)
- **Encryption** — `ENCRYPTION_KEY`/cast sensitive fields (e.g. `account_details`) with `encrypted` cast
- Verify CSRF story: API is stateless (bearer tokens), so document that; keep Sanctum stateful only if session auth is added

### 1.5 Database Optimization
- Review/adjust indexes: `investments(user_id, status)`, `transactions(user_id, type, created_at)`, `withdrawals(user_id, status)`, `deposits(user_id, status)`
- Add `created_at` to pagination-ordered columns where missing
- One composite index query check via `EXPLAIN` after seeder data

---

## Phase 2 - Testability & Documentation

**Target: 4-6 days**

### 2.1 Backend Tests (PHPUnit)
- `tests/Feature/`:
  - Auth: register (incl. referral bonus math), login, logout, deactivation
  - Wallet: credit/debit/insufficient-funds, balance immutability
  - Investment: plan validation, accrual, **maturity payout (the critical fix)**, ownership checks
  - Deposits/Withdrawals: KYC gate, admin approve/reject flows
  - Admin: middleware 403 for non-admins, CRUD plans
- Use `RefreshDatabase` + in-memory SQLite for CI speed

### 2.2 Frontend Tests (Jasmine/Karma)
- Add `@angular-devkit/build-angular` karma/jasmine deps (currently `ng test` has no runner)
- Component tests: login, register (referral query param), invest modal, wallet display
- Service tests with `HttpClientTestingModule`
- Coverage gate target (~80%) as CI check

### 2.3 API Documentation
- Install `darkaonline/l5-swagger` or write OpenAPI 3.0 spec file
- Serve at `/api/documentation` (README already references this)
- Annotate all controllers with `@OA` schemas, or generate spec from routes

### 2.4 Postman Collection
- `postman/InvestPro.postman_collection.json` — auth, user flows, admin flows
- Environment template with `baseUrl` and `token` variables

### 2.5 Code Documentation & Style
- Add Pint config (already dev dep), run `vendor/bin/pint`
- Document key services (`InvestmentService`, `WalletService`) with PHPDoc
- `STYLE_GUIDE.md`: PHP/Pint + Angular (prettier, 2-space, standalone components)

---

## Phase 3 - Business Features

**Target: 5-8 days (each item independently shipable)**

### 3.1 Email Notifications
- Laravel Mailable classes: Welcome, Deposit confirmed, Withdrawal approved/rejected, Daily profit, Investment matured, KYC status
- Use existing `notifications` table + mail channel; queue them (below)
- Dev: mail driver `log`; Prod: SMTP (SES/SendGrid/Mailgun)

### 3.2 Background Jobs & Queue
- `QUEUE_CONNECTION` already `database` → define `queues/` tables, `php artisan queue:work`
- Dispatch: profit accrual, email sends, webhooks, report generation
- Supervisor/Docker process for `queue:work` in prod

### 3.3 Audit Logging (promoted from Phase 1)
- Admin CRUD + approve/reject actions → append-only `audit_logs` table
- CLI helper `php artisan audit:purge --older-than 90d`

### 3.4 Advanced Reporting & Exports
- `AdminReportController` already exists → add date-range filters, totals
- PDF export (`barryvdh/laravel-dompdf`) for investment statements
- CSV export for users, deposits, withdrawals, transactions
- User-facing: downloadable statement for own account

### 3.5 Payment Gateways (requires merchant accounts)
- **Scaffold a `PaymentService` interface** with `PaymentProvider` contract
- Stripe (Payment Intents) and PayPal (Orders API) adapters
- Webhook handlers to reconcile payments → mark deposit approved
- Keys via env; NO keys in code/repo
- **Note:** deposit currently is manual admin approval — payment integration replaces that flow

### 3.6 SMS Alerts (requires Twilio account)
- `twilio/sdk` adapter behind a `SmsChannel`
- Send on: withdrawal approved, large deposit, account deactivated, 2FA codes

### 3.7 2FA
- TOTP via `pragmarx/google2fa-laravel` or `laravel/fortify` component
- QR enrollment, backup codes, required after login for users who opt in
- Optionally disable 2FA for demo accounts

### 3.8 Webhooks (outbound)
- `WebhookEndpoint` model + signing (HMAC `WEBHOOK_SECRET`)
- Fire on: deposit credited, withdrawal processed, investment matured
- Retry queue with backoff; admin UI to manage endpoints

---

## Phase 4 - Scale & Performance

**Target: 4-6 days**

### 4.1 Redis Caching
- `CACHE_STORE=redis`, `SESSION_DRIVER=redis`, `QUEUE_CONNECTION=redis`
- Cache: plans list, dashboard aggregates (5 min TTL), admin stats
- Add to docker-compose as a service; document prod (Redis Cloud/ElastiCache)

### 4.2 Query Optimization
- `select` scopes for dashboard queries (no `SUM` over full tables)
- Pre-aggregate daily stats into `daily_stats` table via queued job
- N+1 audit: eager-load `plan`, `user` where used

### 4.3 Monitoring & Backups
- Laravel Telescope (dev) / documented Sentry integration
- `APM`: clockwork locally; New Relic/Uptime in prod
- Automated DB backups: `mysqldump` cron + offsite copy (S3/R2) — script in `scripts/backup.sh`
- Uptime checks for `/up` health endpoint

### 4.4 Deployment Guides
- `docs/DEPLOY_AWS.md`, `docs/DEPLOY_DIGITALOCEAN.md`, `docs/DEPLOY_RAILWAY.md`, `docs/DEPLOY_RENDER.md`
- Cover: envs, migrations, scheduler cron, queue worker, asset build, TLS

---

## Phase 5 - Expansion

**Target: separate sprints**

| Item | Notes |
|------|-------|
| Mobile app (React Native/Flutter) | Separate repo + shared API; out of scope for this repo |
| Dark mode | SCSS variables already used → add `data-theme` attribute + persisted preference; quick win |
| i18n | `@ngx-translate/core`; start with en + 1 language; extract strings |
| Analytics dashboard | Enhanced admin charts (Chart.js already used); drill-down per plan/per user |
| Data import/export utilities | CSV import for plans; migration tools between envs |
| Custom branding | Admin-configurable logo/colors/fonts via config table + CSS variables |
| Single Sign-On | Socialite (Google/Facebook) — medium effort |

---

## External Accounts & Dependencies

| Feature | Requires | Owner |
|---------|----------|-------|
| Docker images | Docker Hub/GHCR registry | dev |
| CI/CD | GitHub repo + Actions | dev |
| Stripe/PayPal | Merchant account + API keys | business |
| Twilio SMS | Twilio account + funds | business |
| Redis | Local (docker) or cloud (Redis Cloud/Upstash) | dev |
| Email prod | SMTP (SES/SendGrid/Mailgun) | business |
| Monitoring prod | Sentry / New Relic / UptimeRobot | dev |
| Deploy | Railway/Render/DigitalOcean/AWS account | business |

---

## Effort Estimate

| Phase | Effort (one dev) | External deps |
|-------|------------------|---------------|
| Phase 0 - Critical fixes | 1-2 days | none |
| Phase 1 - Foundation | 3-5 days | Docker registry, GitHub |
| Phase 2 - Tests & docs | 4-6 days | none |
| Phase 3 - Business features | 5-8 days | Stripe, Twilio, SMTP |
| Phase 4 - Scale | 4-6 days | Redis, monitoring |
| Phase 5 - Expansion | 2-4 weeks | — |
| **Total (P0-P4)** | **~3-4 weeks** | — |

---

## Definition of Done

Each phase is "done" when:

1. All code passes `vendor/bin/pint`, `php artisan test`, `ng build`, `ng test`
2. CI pipeline is green on the default branch
3. Docker-compose brings the full stack up with seeded data
4. No secrets committed; all keys via env vars
5. README and relevant docs updated
6. The Phase 0 critical bug has a regression test

---

## Progress Log

### Phase 1 (completed Aug 14, 2026)
- [x] Docker: `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml` (mysql, backend, scheduler, frontend), `.dockerignore` files, nginx SPA config
- [x] Git: repo initialized (`git init -b main`), root `.gitignore`
- [x] CI/CD: `.github/workflows/ci.yml` (PHP 8.2/8.3 lint + tests, Node 20 build) and `.github/workflows/deploy.yml` (GHCR image push)
- [x] Environment configs: expanded `.env.example` (payments/SMS/webhook placeholders), `environment.staging.ts` + `staging` angular configuration
- [x] Laravel scaffolding added: `public/index.php`, `public/.htaccess`, `storage/` tree, `bootstrap/cache/`, `phpunit.xml`, `tests/TestCase.php` + example tests
- [x] Audit logging: `admin_audit_logs` migration, `AdminAuditLog` model, `AuditAdminActions` middleware applied to all admin routes
- [x] Encryption: `account_details` casts to `encrypted:array` on Deposit and Withdrawal
- [x] DB optimization: `2026_08_14_000002_add_performance_indexes` migration

### Phase 0 (completed Aug 14, 2026)
- [x] Fixed double-payout bug in `InvestmentService::accrue()`
- [x] Added `lockForUpdate()` row locking to `WalletService`
- [x] Made `AdminWithdrawalController::approve` atomic
- [x] Added rate limiting (`api` 120/min, `auth` 5/min)
- [x] Documented `schedule:work` requirement

---

## Immediate Next Actions

- [x] Fix double-payout bug in `InvestmentService::accrue()` (Phase 0) - done Aug 14, 2026
- [x] Add `lockForUpdate()` to `WalletService` (Phase 0) - done Aug 14, 2026
- [x] Make withdrawal approval atomic (lock + transaction) (Phase 0) - done Aug 14, 2026
- [x] Add rate limiting to auth routes (Phase 0) - done Aug 14, 2026
- [x] Document `schedule:work` requirement in README (Phase 0) - done Aug 14, 2026
- [x] Docker + git + CI + env configs + audit log + encryption + indexes (Phase 1) - done Aug 14, 2026
- [ ] Install Docker Desktop, then `docker compose up --build` to verify the stack
- [ ] Push to GitHub and confirm CI is green
- [ ] Write regression test for the payout fix (Phase 2)
- [ ] Write real feature tests for investments/wallet (Phase 2)
