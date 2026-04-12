#!/usr/bin/env bash
# Full VPS deploy: migrate DB, build SPA with PUBLIC_* from .env, start stack (HTTP nginx until certs exist).
# TLS: after DNS points here and stack is up, run ./scripts/vps-issue-cert.sh then recreate reverse-proxy.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
COMPOSE_FILES=( -f docker-compose.yml -f docker-compose.vps.yml )

if [ ! -f .env ]; then
  echo "Missing .env — copy docker/vps.env.example to .env and set secrets, PUBLIC_*, CERTBOT_EMAIL." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
. ./.env
set +a
: "${POSTGRES_PASSWORD:?}"
: "${JWT_SECRET:?}"
: "${PUBLIC_WEB_URL:?}"
: "${PUBLIC_AUTH_URL:?}"
: "${PUBLIC_BFF_URL:?}"

"$ROOT/scripts/vps-migrate.sh"

docker compose "${COMPOSE_FILES[@]}" build --no-cache matchmyresume-web universal-auth matchmyresume-bff reverse-proxy
docker compose "${COMPOSE_FILES[@]}" up -d

echo "Stack is up:"
sleep 5
docker compose "${COMPOSE_FILES[@]}" ps

echo ""
echo "TLS: when A records for WEB_HOST, AUTH_HOST, API_HOST reach this host, run ./scripts/vps-issue-cert.sh"
echo "then: docker compose -f docker-compose.yml -f docker-compose.vps.yml up -d --force-recreate reverse-proxy"
