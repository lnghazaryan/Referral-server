# Using Referal.Server

This guide covers local development, deployment, configuration, the admin CRM,
and how client apps call the API.

---

## Prerequisites

- Node.js 22+ (matches Docker image)
- PostgreSQL database
- Eventhub Organizer credentials (test or live) for promo creation
- Dinno email API key (for sending promo emails)

---

## Quick start (local)

1. Copy environment file:

   ```bash
   cp .env.example .env
   ```

2. Set `DATABASE_URL` and other variables (see [Environment variables](#environment-variables)).

3. Install and migrate:

   ```bash
   npm install
   npm run db:migrate
   ```

4. Run the server:

   ```bash
   npm run dev
   ```

5. Open:

   - API base: `http://localhost:4000/api`
   - Swagger: `http://localhost:4000/docs`
   - Admin CRM: `http://localhost:4000/admin`

On first successful DB connection, a default admin user is seeded if missing:

- Username: `refadmin`
- Password: `admin1234`

Change this password in production (create users via admin or DB).

---

## npm scripts

| Script | Purpose |
| ------ | ------- |
| `npm run dev` | Build, watch TypeScript, restart Node on changes |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run production build |
| `npm run typecheck` | TypeScript without emit |
| `npm run db:generate` | Generate Drizzle migration from schema changes |
| `npm run db:migrate` | Apply migrations (development) |
| `npm run db:migrate:prod` | Apply migrations in production (`scripts/migrate.cjs`) |

---

## Docker

From the project root:

```bash
docker compose up -d --build
```

- Reads `.env` via `env_file` and mounts it at `/app/.env`.
- Runs migrations when `RUN_MIGRATIONS=true` (default), then starts the app.
- Port defaults to `4000` (`PORT` in `.env`).

Plain run:

```bash
docker run -p 4000:4000 --env-file .env \
  -v "$(pwd)/.env:/app/.env:ro" referal-server
```

---

## Environment variables

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PORT` | No | HTTP port (default `4000`) |
| `EVENTHUB_API_ENV` | No | `test` or `live` — default API host selection |
| `EVENTHUB_API_BASE_URL` | No | Override Website API base (events catalog) |
| `EVENTHUB_PROMO_API_BASE_URL` | No | Override Organizer API base |
| `EVENTHUB_ORGANIZER_USERNAME` | For promos | Organizer API login |
| `EVENTHUB_ORGANIZER_PASSWORD` | For promos | Organizer API password |
| `EVENTHUB_PROMO_PARTNER_ID` | For promos | Partner UUID on promo create |
| `EVENTHUB_DEFAULT_LANGUAGE` | No | Default locale for Eventhub calls (e.g. `am`) |
| `EMAIL_API_URL` | No | Dinno send endpoint (default in `.env.example`) |
| `EMAIL_API_KEY` | For email | Dinno API key |
| `LANDING_BASE_URL` | No | Base URL for loyalty site (promo links in email) |

Promo discount rules and email **from / bcc / display name** are edited in
**Admin → Settings**, not in `.env`.

---

## Admin CRM

URL: `http://<host>:<port>/admin` (no `/api` prefix).

1. Log in with an admin account (`POST /api/auth/login` sets cookie; the UI
   handles this in-browser).
2. Typical setup:
   - **Settings** — promo percent, max uses, validity days; mailing headers.
   - **Events** — sync from Eventhub catalog; select events that qualify for
     referrer rewards and appear on the landing list.
   - **Content** — edit HY / RU / EN landing copy (hero, errors, terms, etc.).
   - **Referrals / Referred / Promos** — inspect data, resend emails, manual
     fixes (admin-only actions).

Roles:

- **Admin** — full access including settings and user management.
- **Guest** — read-only internal APIs (where allowed).

Auth endpoints live under `/api/auth/*` (login, logout, me, users).

---

## Public API for integrators

All paths below are relative to **`/api`**.

### Landing

**Content (locale `hy`, `ru`, or `en`):**

```http
GET /public/content/hy
```

Returns a flat key → string map (CMS overrides merged with defaults).

**Events for cards:**

```http
GET /public/events?lang=hy
```

Returns upcoming selected events with localized name, venue, date, image, and
`eventUrlPath` for Eventhub links.

**Referred signup:**

```http
POST /referred
Content-Type: application/json

{
  "email": "friend@example.com",
  "referralCode": "A3B7CD"
}
```

Response includes `referred` and `promo` (with `code`). Errors may return
message codes: `REFERRAL_CODE_NOT_FOUND`, `REFERRED_EMAIL_EXISTS`,
`SELF_REFERRAL`.

### Booking (checkout)

**Register referrer after purchase:**

```http
POST /referrals
Content-Type: application/json

{
  "email": "buyer@example.com",
  "phone": "+37499123456",
  "eventId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

Idempotent for the same email — returns existing referral if already
registered.

**Referred first payment:**

```http
POST /referred/payment
Content-Type: application/json

{
  "email": "friend@example.com",
  "referralCode": "A3B7CD",
  "eventId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "phone": "+37477111222",
  "buyPrice": 15000
}
```

Referrer reward and email are sent only when `eventId` is in the synced admin
event list.

Interactive request/response schemas: **`/docs`** (Swagger).

---

## Connecting the landing

In `landing/assets/config.js`, set `API_BASE` to the server origin plus
`/api`, for example:

- Production: same host as deployed API or dedicated API subdomain.
- Local: `http://localhost:4000/api` (often set automatically on localhost).

The landing loads copy from `/public/content/:locale` and events from
`/public/events`. Referral attribution uses `?ref=` and cookies (see landing
`app.js`).

Promo-only pages under `landing/events/` read `?PROMO=` from the URL and do
not call `POST /referred`.

---

## Connecting Booking.Front

Set `REFERRAL_API_URL` in Booking constants to the API base including `/api`,
e.g. `https://loyalty-api.example.com/api`.

Wrappers in `Booking.Front/src/API/referralRequests.js`:

- `registerReferral({ email, phone, eventId })`
- `createReferred({ email, referralCode })`
- `completeReferredPayment({ email, referralCode, eventId, phone, buyPrice })`

Ensure the `ref` cookie is set when users arrive from referral links so
checkout can attribute payments.

---

## Email templates

HTML templates for promo emails live in
`src/modules/external/email/mail-templates.ts`:

- `signup_promo` — sent to referred user after landing signup
- `payment_reward` — sent to referrer after qualifying referred purchase

Subjects and body copy are Armenian by default. Sending uses Dinno API;
`EMAIL_API_KEY` must be set.

---

## Database workflow

1. Edit schemas in `src/db/schemas/`.
2. Run `npm run db:generate` to create a SQL migration in `drizzle/`.
3. Apply with `npm run db:migrate` (local) or on container start (Docker).

Production image uses `npm run db:migrate:prod` via `docker-entrypoint.sh`.

---

## Troubleshooting

| Symptom | Check |
| ------- | ----- |
| Promos not created | Organizer credentials, `EVENTHUB_API_ENV`, partner ID |
| No referrer reward | Event synced and **selected** in admin; `eventId` in payment payload |
| Empty landing events | Sync events; ensure `eventId` and dates are valid |
| Email not sent | `EMAIL_API_KEY`, mailing settings in CRM |
| `DATABASE_URL is required` | `.env` present and loaded |
| Admin login fails | Migrations applied; seed user exists |

Server logs include structured lines from `ReferralService` for signup and
payment flows.

---

## Further reading

- [Introduction](./introduction.md) — concepts and sequence diagrams
- Root [README.md](../README.md) — repository index
