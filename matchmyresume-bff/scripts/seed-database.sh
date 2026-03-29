#!/bin/bash
# Seed the BFF database with 100+ mock companies, jobs, resumes, applications.
# Requires: PostgreSQL running, matchmyresume_bff database exists.
# Usage: ./scripts/seed-database.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_USER="${DB_USER:-cesium}"
DB_NAME="${DB_NAME:-matchmyresume_bff}"

echo "Seeding $DB_NAME..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f migrations/20240313000000_comprehensive_seed.sql
echo "Seed complete."
