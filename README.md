# Bitcoin Investment — Platform

A full-stack scaffold implementing the complete spec, running entirely in
**SANDBOX MODE**: no code path in this app moves real money, executes a real
BTC purchase, or broadcasts a real blockchain transaction. Every simulated
action is labeled as such. See "Go-live checklist" below for what turning
that off actually requires.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · PostgreSQL · Prisma ·
Redis (planned wiring for rate limiting) · Docker · GitHub Actions CI

## Getting started

```bash
npm install
cp .env.example .env          # fill in DATABASE_URL at minimum
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed            # seeds admin roles/permissions only — no fake users/balances
npm run dev
```

Open http://localhost:3000. Run `npm test` for the unit test suite.

## What's implemented

**Brand & tech (1–2)** — Next.js/TS/Tailwind, dark + light mode, sandbox badge.

**Public site (3–4)** — Home (`/`) with live BTC price, real DB-backed stats,
risk statement; How It Works (`/how-it-works`).

**Investment & strategy (5–6)** — `/invest` (price, fees, min investment, custody
summary), `/strategy` (admin-configurable via `PlatformConfig`, no code deploy needed).

**Auth (7)** — `/register`, `/login`, scrypt password hashing, session cookies,
device/session tables in schema (2FA flag present; full TOTP flow is a follow-up).

**KYC/AML (8)** — `/kyc` page + `/api/kyc/*`, `SandboxKycProvider` interface —
swap in Sumsub/Persona/Onfido without touching app code. Never auto-approves.

**Dashboard (9–10)** — `/dashboard` (portfolio overview, time-period tabs),
investment order flow (`/api/investments`) that only marks orders EXECUTED
after explicit confirmation (sandbox: an authorized admin action, simulating
what a real provider webhook would do).

**Deposits (11)** — `/api/deposits` + `/api/webhooks/payment`. Deposits stay
PENDING until a (signature-verified, in production) webhook confirms them.

**Bitcoin allocation (12)** — Order → execution → ledger → portfolio update,
server-side only, transactional.

**Custody (13)** — `CustodyProvider` interface; no private keys anywhere in
this codebase.

**Withdrawals (14)** — `/withdraw`, 2FA-gated, address-format validated,
new-address cooling period + large-withdrawal threshold auto-flag to
compliance review. Blockchain hash field is only ever set after a real broadcast.

**Transactions (15)** — `/dashboard/transactions` with type filters + CSV export.

**Ledger (16)** — `src/lib/ledger.ts`: double-entry, balance-enforced, immutable
`LedgerEntry` rows. Reconciliation-vs-provider is a documented follow-up.

**Telegram (17–18)** — `/community` page with anti-scam warning + section
structure; `/api/telegram/webhook` stub for bot commands.

**Notifications (19)** — `src/lib/notify.ts` fans out to in-app + email (+
Telegram if linked); `/api/notifications`.

**Admin (20–25)** — `/admin` overview (real DB numbers only), `/admin/users`
(search + freeze-with-reason, audited), `/admin/kyc` (approve/reject queue),
`/admin/transactions`, `/admin/withdrawals` (approve/reject). RBAC via
`Role`/`Permission` tables + `requirePermission()`; seeded with 6 roles.

**Market data (26)** — `/api/market/price`, real provider, explicit
"unavailable" state on failure — never fabricated.

**Transparency (27)** — `/transparency`, real aggregates only.

**Fees (28)** — `/fees`, admin-configurable, shown before every transaction.

**Security (29)** — scrypt hashing, httpOnly/secure cookies, Zod input
validation everywhere, audit logging on every sensitive action. Rate limiting,
CSRF middleware, and full 2FA are flagged as follow-ups (see below).

**Compliance (30)** — `ComplianceAlert` model, auto-flagging on withdrawals;
sanctions-screening provider is an integration point, not yet wired to a vendor.

**Legal pages (31)** — all nine pages under `/legal/*`, each marked as
requiring professional review before production.

**Referral (32)** — referral code generated per user, `referredById` link —
intentionally no MLM/multi-level structure per the spec's explicit ban.

**Support (33)** — `/support`, ticket categories, `/api/support/tickets`.

**Anti-scam (34)** — `/security/official-links`, warnings + scam report form.

**Mobile (35)** — bottom nav (`MobileNav.tsx`) on small screens.

**Database (36)** — `prisma/schema.prisma` — every entity from the spec.

**API (37)** — all financial calculations happen server-side; no route trusts
a balance or price submitted by the client.

**Sandbox mode (38)** — `NEXT_PUBLIC_SANDBOX_MODE`, checked by every
provider and the execution/withdrawal routes.

**Tests (40)** — `tests/*.test.ts`: ledger balance invariant, investment
validation, withdrawal review triggers, address validation. Run with `npm test`.
Auth/KYC/webhook-replay/race-condition tests are flagged as follow-ups.

**Deployment (41)** — `Dockerfile`, `docker-compose.yml` (Postgres + Redis),
`.github/workflows/ci.yml` (lint, test, build on every PR).

## Auth/dashboard repair — round 2 (completed)

A previous pass found the homepage/nav had no working path to Sign In,
Register, or Dashboard, and several nav-referenced pages didn't exist yet.
Fixed:

- `src/middleware.ts` — server-side redirect for unauthenticated access to
  `/dashboard/*`, `/withdraw`, `/kyc`, `/support`, `/admin/*`
- `Navbar`/`MobileNav` rewritten as auth-aware server components (Sign In /
  Create Account vs Dashboard / Logout)
- `/admin/login` + `/api/admin/auth/*` — admin login checked against real
  `AdminUser` rows. No fake admin account by default; set
  `ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD` in `.env` before `npx prisma db seed`
  if you want one for local dev
- `/dashboard/profile` + `/api/profile`
- `/dashboard/security` — password change, **real TOTP 2FA** via
  `src/lib/totp.ts` (dependency-free RFC 6238 using only Node's built-in
  `crypto` — works with any authenticator app), active session list/revoke
- `/dashboard/notifications`
- `/dashboard/deposit` — the deposits API existed with no UI page; added one
- `/dashboard/layout.tsx` — sub-nav connecting all of the above

**Known simplifications from that pass:** 2FA setup shows the secret as text
for manual entry rather than a scannable QR image; the admin session cookie
is still the admin's raw id per the comment in `lib/rbac.ts`, not a signed
token — fine for local dev, not for production. I could not run
`npm install`/`next build`/`npx tsc --noEmit` in the environment that wrote
this code (no network access to the npm registry) — I type-checked the new
files in isolation with a bare `tsc` and found zero real syntax errors, but
run the commands below yourself before trusting this beyond local dev.

## Known follow-ups (not yet built)

- Rate limiting and CSRF middleware wiring (Redis is provisioned in Docker
  Compose but not yet used by any route)
- Webhook-replay-attack and race-condition test coverage
- Ledger-vs-custody-provider reconciliation job
- SMS provider integration (interface exists, no vendor wired)
- Historical portfolio snapshots needed to actually draw the dashboard chart
- Email-change flow (currently not editable from Profile, on purpose — needs re-verification)
- QR code rendering for 2FA enrollment (manual secret entry works today)
- Signed/expiring admin session tokens (currently the admin cookie is the raw admin id)

## Go-live checklist (do not skip)

Real-money functionality must not be enabled until each of these is
independently completed and verified — this is a legal/operational checklist,
not something more code can satisfy:

- [ ] Legal entity formed; Terms, Privacy Policy, and all `/legal/*` pages reviewed by counsel
- [ ] Money transmitter / relevant financial license(s) obtained for each jurisdiction served
- [ ] KYC/AML provider integrated; compliance program documented and staffed
- [ ] Licensed payment provider integrated (real webhook signature verification enabled)
- [ ] Qualified/regulated crypto custody provider integrated
- [ ] Market data provider contract in place (production shouldn't rely on an unauthenticated public endpoint)
- [ ] Independent security audit completed
- [ ] Accounting/reconciliation process established against the custody provider
- [ ] Production secrets in a real secrets manager, not `.env` files
- [ ] Privacy/compliance review completed
- [ ] Sanctions screening provider integrated
- [ ] `NEXT_PUBLIC_SANDBOX_MODE=false` only after every item above is checked
