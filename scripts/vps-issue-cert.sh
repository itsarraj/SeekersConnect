#!/usr/bin/env bash
# Issue or expand a SAN certificate using the certbot service from docker-compose.vps.yml.
# Requires: .env with WEB_HOST, AUTH_HOST, API_HOST, CERTBOT_EMAIL; stack up so reverse-proxy serves /.well-known/.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
set -a
# shellcheck disable=SC1091
[ -f .env ] && . ./.env
set +a
: "${WEB_HOST:?Set WEB_HOST in .env}"
: "${AUTH_HOST:?Set AUTH_HOST in .env}"
: "${API_HOST:?Set API_HOST in .env}"
: "${CERTBOT_EMAIL:?Set CERTBOT_EMAIL in .env}"
docker compose --profile cert -f docker-compose.yml -f docker-compose.vps.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d "$WEB_HOST" -d "$AUTH_HOST" -d "$API_HOST" \
  --email "$CERTBOT_EMAIL" --agree-tos --no-eff-email
