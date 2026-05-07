# Edge reverse proxy (VPS)

The `default.conf.template` serves HTTP on port 80 for:

- `WEB_HOST` → `matchmyresume-web`
- `AUTH_HOST` → `universal-auth`
- `API_HOST` → `matchmyresume-bff`

Each vhost exposes `/.well-known/acme-challenge/` from `/var/www/certbot` for the certbot webroot flow in `docker-compose.vps.yml`.

After you obtain a SAN certificate (see repo `scripts/vps-issue-cert.sh`), add TLS listeners. A typical pattern is to mount an extra snippet into this image or switch to host nginx (`docker-compose.vps-host-edge*.yml`). Example TLS server names and proxy targets match the HTTP blocks above; point `ssl_certificate` / `ssl_certificate_key` at `/etc/letsencrypt/live/$CERT_PRIMARY_DOMAIN/`.
