#!/usr/bin/env bash
# Install seekersconnect + matchmyresume nginx (same-origin /api split). Run on the VPS with sudo.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
sudo cp "$ROOT/docker/host-nginx/seekersconnect-matchmyresume.xyz.conf.example" \
  /etc/nginx/conf.d/seekersconnect-matchmyresume.xyz.conf
sudo nginx -t
sudo nginx -s reload
echo "Installed /etc/nginx/conf.d/seekersconnect-matchmyresume.xyz.conf and reloaded nginx."
