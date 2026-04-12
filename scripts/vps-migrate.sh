#!/usr/bin/env bash
# Run sqlx migrations against Postgres on the Docker Compose network (VPS or local).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
MODE="${1:-vps}"
case "$MODE" in
  host) COMPOSE_FILES=( -f docker-compose.yml -f docker-compose.vps-host-edge-reset.yml -f docker-compose.vps-host-edge.yml ) ;;
  vps)  COMPOSE_FILES=( -f docker-compose.yml -f docker-compose.vps.yml ) ;;
  *)    echo "Usage: $0 [vps|host]  (default: vps)" >&2; exit 2 ;;
esac
set -a
# shellcheck disable=SC1091
[ -f .env ] && . ./.env
set +a
: "${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD in .env}"

SQLX_IMAGE="${SQLX_CLI_IMAGE:-nxyt/sqlx-cli:v0.70}"

docker compose "${COMPOSE_FILES[@]}" up -d postgres redis
for _ in $(seq 1 90); do
  if docker compose "${COMPOSE_FILES[@]}" exec -T postgres pg_isready -U seekers -d uas >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
docker compose "${COMPOSE_FILES[@]}" exec -T postgres pg_isready -U seekers -d uas

cid="$(docker compose "${COMPOSE_FILES[@]}" ps -q postgres)"
[ -n "$cid" ] || { echo "postgres container not found"; exit 1; }
net="$(docker inspect "$cid" --format '{{range $k, $_ := .NetworkSettings.Networks}}{{$k}}{{break}}{{end}}')"

run_migrate() {
  local subdir="$1"
  local db="$2"
  docker run --rm \
    --network "$net" \
    -v "$ROOT/$subdir/migrations:/app/migrations" \
    -w /app \
    "$SQLX_IMAGE" \
    sqlx migrate run --database-url "postgres://seekers:${POSTGRES_PASSWORD}@postgres:5432/${db}?sslmode=disable"
}

run_migrate universal-auth-service uas
run_migrate matchmyresume-bff matchmyresume_bff
echo "Migrations complete."
