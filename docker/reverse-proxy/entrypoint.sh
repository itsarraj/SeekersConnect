#!/bin/sh
set -e
CERT_FILE="/etc/letsencrypt/live/${CERT_PRIMARY_DOMAIN}/fullchain.pem"
if [ -f "$CERT_FILE" ]; then
  sed \
    -e "s|__WEB_HOST__|${WEB_HOST}|g" \
    -e "s|__AUTH_HOST__|${AUTH_HOST}|g" \
    -e "s|__API_HOST__|${API_HOST}|g" \
    -e "s|__CERT_PRIMARY_DOMAIN__|${CERT_PRIMARY_DOMAIN}|g" \
    < /templates/nginx.https.conf > /etc/nginx/conf.d/default.conf
else
  sed \
    -e "s|__WEB_HOST__|${WEB_HOST}|g" \
    -e "s|__AUTH_HOST__|${AUTH_HOST}|g" \
    -e "s|__API_HOST__|${API_HOST}|g" \
    < /templates/nginx.http.conf > /etc/nginx/conf.d/default.conf
fi
exec nginx -g "daemon off;"
