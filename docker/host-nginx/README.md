# Host nginx (when ports 80/443 are already taken)

Use this folder when the VPS already runs nginx on ports 80/443 and you deploy SeekersConnect via the loopback bindings in `docker-compose.vps-host-edge.yml`.

## Quick steps

1. Run the stack with loopback publishing

   - `docker compose -f docker-compose.yml -f docker-compose.vps-host-edge-reset.yml -f docker-compose.vps-host-edge.yml up -d --build`

2. Issue a cert with every hostname you will serve

   - create challenge root: `sudo mkdir -p /var/www/certbot`
   - issue/expand cert (webroot): `sudo certbot certonly --webroot -w /var/www/certbot -d <host1> -d <host2> ...`

3. Install exactly one conf per hostname set

   - copy: `sudo cp docker/host-nginx/<file>.conf.example /etc/nginx/conf.d/<file>.conf`
   - test + reload: `sudo nginx -t && sudo nginx -s reload`

## Which example to use

- `seekersconnect-matchmyresume.xyz.conf.example`
  - same-origin setup (multiple apex+www names served by one SPA)
  - routes:
    - `/api/v1/auth|user|admin/` -> universal-auth (127.0.0.1:14681)
    - `/api/v1/` -> matchmyresume-bff (127.0.0.1:14682)
    - everything else -> matchmyresume-web (127.0.0.1:14680)

- `technetium.itsarraj.xyz.conf.example`
  - subdomain split (web + auth + api as separate hostnames)
  - routes:
    - `technetium...` -> web (14680)
    - `auth.technetium...` -> universal-auth (14681)
    - `api.technetium...` -> matchmyresume-bff (14682)

## Common failure: "conflicting server name ... ignored"

This means another file in `/etc/nginx/conf.d/` declares the same `server_name` values.

Fix by editing/removing the older conflicting file, then:

- `sudo nginx -t && sudo nginx -s reload`

