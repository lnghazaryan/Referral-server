#!/bin/sh
set -e

if [ ! -f /app/.env ] && [ -z "$DATABASE_URL" ]; then
  echo "No environment found."
  echo "Use: docker compose up -d --build"
  echo "Or:  docker run --env-file .env -v \"\$(pwd)/.env:/app/.env:ro\" ..."
  exit 1
fi

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  node scripts/migrate.cjs
fi

exec node dist/main.js
