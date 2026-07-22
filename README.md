# Referal.Server

NestJS backend for the Eventhub loyalty and referral program: referral codes,
promo generation, transactional email, landing CMS, and admin CRM.

## Documentation

| Document | Description |
| -------- | ----------- |
| [Introduction](./docs/introduction.md) | What the system does, concepts, flows, architecture |
| [Using](./docs/using.md) | Setup, env, Docker, admin CRM, API usage for landing and booking |

## Stack

- NestJS · PostgreSQL · Drizzle ORM · Swagger · class-validator

## Quick start

```bash
cp .env.example .env
# set DATABASE_URL and API keys
npm install
npm run db:migrate
npm run dev
```

- API: `http://localhost:4000/api`
- Swagger: `http://localhost:4000/docs`
- Admin UI: `http://localhost:4000/admin`

See [Using](./docs/using.md) for Docker, environment variables, and
integration details.
