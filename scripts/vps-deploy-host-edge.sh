#!/usr/bin/env bash
# Deploy behind existing host nginx (loopback ports 14680–14682). See docker-compose.vps-host-edge.yml
# and docker/host-nginx/technetium.itsarraj.xyz.conf.example for TLS on the host.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
COMPOSE_FILES=( -f docker-compose.yml -f docker-compose.vps-host-edge.yml )

if [ ! -f .env ]; then
  echo "Missing .env — copy docker/vps.env.example to .env and set secrets and PUBLIC_* URLs." >&2
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

"$ROOT/scripts/vps-migrate.sh" host

# Build one image at a time to limit peak RAM on small VPS hosts.
docker compose "${COMPOSE_FILES[@]}" build universal-auth
docker compose "${COMPOSE_FILES[@]}" build matchmyresume-bff
docker compose "${COMPOSE_FILES[@]}" build matchmyresume-web
docker compose "${COMPOSE_FILES[@]}" up -d

echo "Services bound on loopback (host nginx should proxy here):"
echo "  web  http://127.0.0.1:14680"
echo "  auth http://127.0.0.1:14681"
echo "  bff  http://127.0.0.1:14682"
sleep 5
docker compose "${COMPOSE_FILES[@]}" ps
