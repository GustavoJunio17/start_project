#!/bin/sh
set -e

PGHOST="${PGHOST:-postgres}"
PGPORT="${PGPORT:-5432}"
PGDATABASE="${PGDATABASE:-startpro}"
PGUSER="${PGUSER:-startpro}"
MIGRATIONS_DIR="${MIGRATIONS_DIR:-/migrations}"

echo "Waiting for database at $PGHOST:$PGPORT..."
until pg_isready -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -q; do
  sleep 1
done
echo "Database ready."

# Create migration tracking table
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c "
  CREATE TABLE IF NOT EXISTS _migrations (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL UNIQUE,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );"

# Apply each migration in alphabetical order
for file in $(ls "$MIGRATIONS_DIR"/*.sql | sort); do
  filename=$(basename "$file")

  applied=$(psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -tAc \
    "SELECT COUNT(*) FROM _migrations WHERE filename = '$filename'")

  if [ "$applied" = "0" ]; then
    echo "Applying: $filename"
    psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" \
      -v ON_ERROR_STOP=1 -f "$file"
    psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c \
      "INSERT INTO _migrations (filename) VALUES ('$filename');"
    echo "  ✓ $filename"
  else
    echo "  ↩ $filename (already applied)"
  fi
done

echo ""
echo "All migrations complete."
