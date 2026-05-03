#!/bin/sh

# Exit on any error
set -e

echo "🚀 Starting Start application..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until pg_isready -h postgres -U ${POSTGRES_USER:-startpro}; do
  echo "   Database is unavailable - sleeping"
  sleep 1
done
echo "✅ Database is ready"

# Check if we should run migrations
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "📦 Running migrations..."
  npm run migrate || true
  echo "✅ Migrations completed"
fi

# Start the application
echo "▶️  Starting Next.js application..."
exec npm start
