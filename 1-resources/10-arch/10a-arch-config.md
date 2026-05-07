# Architecture configuration (baseline)

This file summarizes how the SeekersConnect stack is wired for deployment and local development.

## Core services

- `postgres`: shared PostgreSQL (schemas/migrations per Rust service).
- `redis`: sessions/cache for universal-auth.
- `rustfs`: S3-compatible object storage for resume files (matchmyresume-bff).
- `universal-auth`: authentication API.
- `matchmyresume-bff`: jobs, resumes, applications, profiles API.
- `matchmyresume-web` / `mobile-app-web`: frontends.

Compose layout and VPS overlays live in `docker-compose.yml`, `docker-compose.vps.yml`, and host-edge compose files at the repo root.

## BFF configuration

- Local: `matchmyresume-bff/configuration.yaml`
- Docker: `matchmyresume-bff/configuration.docker.yaml` mounted into the container

Environment overrides use the `APP__` prefix for nested YAML keys (see `configuration.rs`).

## Resume–job matching

Semantic suggestions are stored in `suggested_jobs` (see matchmyresume-bff migrations). An optional Python worker loads Hugging Face embeddings and refreshes rows per user (details in `10a-arch-config-extended.md` and `ai-tests/matcher_service.py`).
