# Referral Server

Initial NestJS + TypeScript server for the referral system.

## Stack

- NestJS
- PostgreSQL
- Drizzle ORM + Drizzle Kit
- Swagger UI
- class-validator DTO validation

## Run locally

1. Copy `.env.example` to `.env`
2. Set your `DATABASE_URL`
3. Install deps:

```bash
npm install
```

4. Start dev server:

```bash
npm run dev
```

Swagger docs are available at `http://localhost:4000/docs`.

API prefix is `http://localhost:4000/api`.

## Database tasks

- Generate migration files: `npm run db:generate`
- Apply migrations: `npm run db:migrate`
