# Database exports (PII)

This directory is for **local dumps only** (emails, subscribers, etc.). Do not commit export files. The steps below use **SSH + Docker** against a host where Postgres runs in a container (example: **Insiderlist** on the technetium VPS).

## Prerequisites

- SSH access to the server (example: `prod@45.154.197.90`).
- Docker CLI on the server (or your user in the `docker` group).
- You know the **Postgres container name** (or discover it with `docker ps`).

## 1. Find the database container

```bash
ssh prod@YOUR_SERVER 'docker ps --format "table {{.Names}}\t{{.Image}}" | grep -i postgres'
```

Example name: `insiderlist-postgres-1`.

## 2. Read connection settings (optional)

Postgres images usually set `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB`:

```bash
ssh prod@YOUR_SERVER 'docker inspect INSIDERLIST_POSTGRES_CONTAINER --format "{{range .Config.Env}}{{println .}}{{end}}" | grep -E "^POSTGRES_"'
```

Replace placeholders with your values in the commands below (`USER`, `DB`, container name).

## 3. Inspect schema

List tables:

```bash
ssh prod@YOUR_SERVER "docker exec INSIDERLIST_POSTGRES_CONTAINER psql -U USER -d DB -c '\\dt'"
```

Describe a table (example: newsletter signups):

```bash
ssh prod@YOUR_SERVER "docker exec INSIDERLIST_POSTGRES_CONTAINER psql -U USER -d DB -c '\\d newsletter_subscribers'"
```

## 4. Export emails (one per line)

From your **laptop** (writes into this repo’s `exports/` folder):

```bash
mkdir -p exports

ssh -o BatchMode=yes prod@YOUR_SERVER \
  "docker exec insiderlist-postgres-1 psql -U insiderlist -d insiderlist -t -A \
   -c \"SELECT email FROM newsletter_subscribers ORDER BY created_at;\"" \
  > exports/insiderlist-newsletter-emails-raw.txt
```

- `-t` — tuples only (no column headers).
- `-A` — unaligned (no padding; one field per line for a single column).

Add a small header without putting secrets in the file:

```bash
COUNT=$(wc -l < exports/insiderlist-newsletter-emails-raw.txt | tr -d ' ')
{
  echo "# insiderlist.newsletter_subscribers — $(date -u +%Y-%m-%dT%H:%MZ)"
  echo "# rows: ${COUNT}"
  echo "#"
  cat exports/insiderlist-newsletter-emails-raw.txt
} > exports/insiderlist-newsletter-emails.txt
rm -f exports/insiderlist-newsletter-emails-raw.txt
```

## 5. Alternative: `COPY` to stdout (SQL)

Good for CSV or custom columns:

```bash
ssh prod@YOUR_SERVER "docker exec insiderlist-postgres-1 psql -U insiderlist -d insiderlist \
  -c \"COPY (SELECT email, created_at FROM newsletter_subscribers ORDER BY created_at) TO STDOUT WITH CSV HEADER\""
```

Redirect `> exports/something.csv` on your machine if you run the outer shell locally.

## 6. Save only on the server (optional)

```bash
ssh prod@YOUR_SERVER "docker exec insiderlist-postgres-1 psql -U insiderlist -d insiderlist -t -A \
  -c \"SELECT email FROM newsletter_subscribers ORDER BY created_at;\"" \
  > ~/insiderlist-newsletter-emails.txt
```

## Security

- Treat exports as **PII**; store encrypted, delete when done, and avoid pasting into tickets or chat.
- Prefer **read-only** DB users for recurring reporting if you add them later.
- This repo’s `.gitignore` ignores `exports/*` except this `README.md` so accidental `git add exports/*.txt` does not land dumps on GitHub.

## Other stacks in this repo (SeekersConnect)

Postgres for SeekersConnect (when compose is up) is typically `seekersconnect-postgres-1`, DB `uas` / user from `.env`. Example probe:

```bash
ssh prod@YOUR_SERVER "docker exec seekersconnect-postgres-1 psql -U seekers -d uas -c '\\dt'"
```

Use the same `psql` / `COPY` patterns; adjust container name, user, database, and table names.
