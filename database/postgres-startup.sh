#!/bin/sh
set -e

# Start postgres in background using the official entrypoint
docker-entrypoint.sh postgres &
PG_PID=$!

# Forward shutdown signals to postgres
trap "kill $PG_PID 2>/dev/null" TERM INT

# Wait for postgres to accept connections
until pg_isready -h localhost -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -q 2>/dev/null; do
  sleep 1
done

# Run migrations
export PGHOST=localhost
export PGPASSWORD="${POSTGRES_PASSWORD}"
export PGDATABASE="${POSTGRES_DB}"
export PGUSER="${POSTGRES_USER}"
export MIGRATIONS_DIR=/migrations

sh /migrate.sh

# Keep container alive with postgres
wait $PG_PID
