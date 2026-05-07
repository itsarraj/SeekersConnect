# Architecture configuration (extended)

Extension of `10a-arch-config.md`: developer workstations, optional ML matcher, and related env vars.

## Resume–job matcher stack

- Code: `ai-tests/resume_job_matcher/` (embeddings), `ai-tests/matcher_service.py` (FastAPI HTTP service).
- Model: `BAAI/bge-large-en-v1.5` + LoRA `shashu2325/resume-job-matcher-lora`.
- Database: reads/writes `suggested_jobs` using `DATABASE_URL` (same logical DB as matchmyresume-bff). When migrations include `job_embeddings` / `user_resume_embeddings` (`matchmyresume-bff/migrations/20240501000001_add_matcher_embedding_tables.sql`), the matcher reuses stored vectors keyed by `MATCHER_MODEL_ID` and a hash of the job/resume text to avoid re-embedding unchanged rows.

### Docker

- Service `resume-matcher` is behind Compose profile `ml` (image is heavy due to PyTorch).
- Example:

```bash
docker compose --profile ml up -d resume-matcher
```

- In `.env` for the full stack, set:

  - `APP_MATCHER_BASE_URL=http://resume-matcher:8095` so matchmyresume-bff triggers refreshes after resume changes.
  - `MATCHER_INTERNAL_SECRET` to the same value on both `matchmyresume-bff` and `resume-matcher` when you want header `X-Matcher-Secret` enforced.

- Ensure PostgreSQL actually contains database `matchmyresume_bff` (or change `DATABASE_URL` / compose URL to match your init). The generic `POSTGRES_DB` in compose may differ; align URLs with where you ran `sqlx migrate run` for the BFF.

### BFF integration

- Config keys: `matcher.base_url`, `matcher.internal_secret` (YAML) or `APP__MATCHER__BASE_URL`, `APP__MATCHER__INTERNAL_SECRET`.
- After create/update/upload resume, the BFF fires an async HTTP POST to `{base_url}/v1/refresh/{user_id}` when `base_url` is non-empty.
- Authenticated users may call `POST /api/v1/jobs/suggested/{user_id}/refresh` to queue the same refresh manually.

### Matcher HTTP API

- `GET /health`
- `POST /v1/warmup` — small dummy forward pass after model load (optional `X-Matcher-Secret` when secret is configured).
- `POST /v1/refresh/{user_id}` — recompute top-K suggestions for one user (optional `X-Matcher-Secret`). Concurrent refreshes for the same `user_id` are serialized with a per-user lock.
- `POST /v1/refresh-all` — all users with at least one resume row (batch maintenance).

Env tuning: `MATCHER_TOP_K`, `MATCHER_JOB_BATCH`, `MATCHER_DEVICE` (`cpu`/`cuda`), `MATCHER_LISTEN_HOST`, `MATCHER_LISTEN_PORT`, `MATCHER_MODEL_ID` (defaults to `BAAI/bge-large-en-v1.5::shashu2325/resume-job-matcher-lora`), `MATCHER_BASE_MODEL` / `MATCHER_ADAPTER` (used only to build the default `MATCHER_MODEL_ID`).

### Offline eval (no DB)

From `ai-tests` with `PYTHONPATH=.`: `python -m evals.run_eval --dataset evals/dataset_smoke.json` prints per-case `recall_at_k`, `mrr`, and means.

### Resume text source

- Uses the latest resume row per user (`ORDER BY updated_at DESC`).
- Text is built from `title` plus JSON `content` when present. File-only resumes without extracted text only contribute the title until you add parsing or structured content.

## Local Python environment (Hugging Face)

- Prefer isolated Python 3.10–3.11 (Miniconda, Miniforge, or `venv`).
- Install matcher deps: `pip install -r ai-tests/requirements-matcher.txt`.
- Hugging Face CLI login when pulling gated/private assets: `huggingface-cli login`.

### AMD GPU note

- NVIDIA CUDA wheels do not apply to AMD discrete GPUs. For an RX-class card, default to CPU inference or a ROCm-capable PyTorch build if you invest in GPU setup on Arch.

### CLI smoke test

From `ai-tests` with `PYTHONPATH=.`: run `python resume_job_matcher_test.py --resume "..." --job "..."`.

## Related repo paths

- `ai-tests/resume_job_matcher_test.py` — pairwise similarity CLI.
- `matchmyresume-bff/src/matcher_client.rs` — non-blocking refresh trigger.
- `matchmyresume-bff/migrations/*jobs*` — `jobs`, `suggested_jobs` schema.
