"""
HTTP service: recomputes suggested_jobs for a user using HF embeddings.

Environment:
  DATABASE_URL        PostgreSQL connection string (same DB as matchmyresume-bff)
  MATCHER_INTERNAL_SECRET   Optional; if set, require X-Matcher-Secret header
  MATCHER_TOP_K       Max suggestions per user (default 25)
  MATCHER_JOB_BATCH   Embedding batch size for jobs (default 8)
  MATCHER_LISTEN_HOST Host to bind (default 0.0.0.0)
  MATCHER_LISTEN_PORT Port (default 8095)
  MATCHER_DEVICE      cpu | cuda | empty (auto)
  MATCHER_MODEL_ID    Stable id stored in job_embeddings / user_resume_embeddings (default composite HF ids)
"""

from __future__ import annotations

import hashlib
import json
import logging
import os
import threading
import time
import uuid
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import FastAPI, Header, HTTPException

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("matcher_service")


def _default_model_id() -> str:
    # Stable id stored in job_embeddings / user_resume_embeddings.
    # Use only MiniLM as requested.
    return "sentence-transformers/all-MiniLM-L6-v2"


def _text_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _resume_text(title: str | None, content) -> str:
    parts: list[str] = []
    if title:
        parts.append(title.strip())
    if content is None:
        return "\n".join(parts).strip()
    if isinstance(content, (dict, list)):
        parts.append(json.dumps(content, ensure_ascii=False))
    else:
        parts.append(str(content))
    return "\n".join(p for p in parts if p).strip()


def _job_text(
    title: str,
    company: str,
    description: str | None,
    location: str | None,
    employment_type: str | None,
) -> str:
    loc = (location or "").strip()
    et = (employment_type or "").strip()
    desc = (description or "").strip()
    lines = [title.strip(), company.strip()]
    if loc:
        lines.append(loc)
    if et:
        lines.append(et)
    if desc:
        lines.append(desc)
    return "\n".join(lines).strip()


def _check_secret(expected: str | None, header: str | None) -> None:
    if not expected:
        return
    if header != expected:
        raise HTTPException(status_code=401, detail="Invalid or missing X-Matcher-Secret")


_model = None
_tokenizer = None

# In-process cache: job_id -> (source_text_hash, normalized embedding CPU float32 1xD)
_mem_job_emb: dict[str, tuple[str, object]] = {}
_mem_lock = threading.Lock()

_user_locks: dict[uuid.UUID, threading.Lock] = {}
_user_locks_guard = threading.Lock()


def _lock_for_user(user_id: uuid.UUID) -> threading.Lock:
    with _user_locks_guard:
        if user_id not in _user_locks:
            _user_locks[user_id] = threading.Lock()
        return _user_locks[user_id]


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _model, _tokenizer
    from resume_job_matcher.embeddings import load_model_and_tokenizer

    log.info("Loading Hugging Face model (first request may download weights)...")
    _model, _tokenizer = load_model_and_tokenizer()
    log.info("Model ready.")
    yield


app = FastAPI(title="Resume-job matcher", lifespan=lifespan)


def _embedding_tables_ready(cur) -> bool:
    cur.execute(
        """
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'job_embeddings'
        )
        """
    )
    row = cur.fetchone()
    return bool(row and row[0])


def _load_stored_job_embeddings(cur, model_id: str, job_ids: list[str]) -> dict[str, tuple[str, list[float]]]:
    """Return job_id -> (source_text_hash, embedding list)."""
    if not job_ids:
        return {}
    cur.execute(
        """
        SELECT job_id::text, source_text_hash, embedding
        FROM job_embeddings
        WHERE model_id = %s AND job_id = ANY(%s::uuid[])
        """,
        (model_id, job_ids),
    )
    out: dict[str, tuple[str, list[float]]] = {}
    for jid, h, emb in cur.fetchall():
        if emb is not None:
            out[jid] = (h, list(emb))
    return out


def _load_stored_resume_embedding(cur, model_id: str, user_id: str) -> tuple[str, list[float]] | None:
    cur.execute(
        """
        SELECT resume_text_hash, embedding
        FROM user_resume_embeddings
        WHERE user_id = %s::uuid AND model_id = %s
        """,
        (user_id, model_id),
    )
    row = cur.fetchone()
    if not row:
        return None
    h, emb = row
    if emb is None:
        return None
    return (h, list(emb))


def _upsert_job_embeddings(cur, model_id: str, dim: int, rows: list[tuple[str, str, list[float]]]) -> None:
    """rows: (job_id, source_text_hash, embedding floats)."""
    for job_id, text_hash, emb in rows:
        cur.execute(
            """
            INSERT INTO job_embeddings (job_id, model_id, dim, embedding, source_text_hash, updated_at)
            VALUES (%s::uuid, %s, %s, %s::real[], %s, NOW())
            ON CONFLICT (job_id) DO UPDATE SET
                model_id = EXCLUDED.model_id,
                dim = EXCLUDED.dim,
                embedding = EXCLUDED.embedding,
                source_text_hash = EXCLUDED.source_text_hash,
                updated_at = NOW()
            """,
            (job_id, model_id, dim, emb, text_hash),
        )


def _upsert_resume_embedding(cur, model_id: str, user_id: str, text_hash: str, dim: int, emb: list[float]) -> None:
    cur.execute(
        """
        INSERT INTO user_resume_embeddings (user_id, model_id, resume_text_hash, dim, embedding, updated_at)
        VALUES (%s::uuid, %s, %s, %s, %s::real[], NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            model_id = EXCLUDED.model_id,
            resume_text_hash = EXCLUDED.resume_text_hash,
            dim = EXCLUDED.dim,
            embedding = EXCLUDED.embedding,
            updated_at = NOW()
        """,
        (user_id, model_id, text_hash, dim, emb),
    )


def _write_suggested_jobs(cur, user_id: str, top: list[tuple[str, float]]) -> None:
    """Upsert top-K rows and delete suggestions for this user not in top-K."""
    if not top:
        cur.execute("DELETE FROM suggested_jobs WHERE user_id = %s::uuid", (user_id,))
        return
    job_ids = [jid for jid, _ in top]
    for jid, score in top:
        cur.execute(
            """
            INSERT INTO suggested_jobs (user_id, job_id, match_score, suggested_at)
            VALUES (%s::uuid, %s::uuid, %s, NOW())
            ON CONFLICT (user_id, job_id) DO UPDATE SET
                match_score = EXCLUDED.match_score,
                suggested_at = EXCLUDED.suggested_at
            """,
            (user_id, jid, float(score)),
        )
    # Avoid uuid[] binding issues: empty/wrong uuid[] makes `<> ALL(...)` delete every row for user_id.
    holders = ", ".join(["%s::uuid"] * len(job_ids))
    cur.execute(
        f"""
        DELETE FROM suggested_jobs
        WHERE user_id = %s::uuid
          AND job_id NOT IN ({holders})
        """,
        (user_id, *job_ids),
    )


def refresh_for_user(user_id: uuid.UUID) -> dict:
    import torch

    from resume_job_matcher.embeddings import embed_texts

    t0 = time.perf_counter()
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        raise RuntimeError("DATABASE_URL is not set")

    top_k = int(os.environ.get("MATCHER_TOP_K", "25"))
    batch_size = int(os.environ.get("MATCHER_JOB_BATCH", "8"))
    model_id = os.environ.get("MATCHER_MODEL_ID") or _default_model_id()
    device = os.environ.get("MATCHER_DEVICE")

    if device:
        log.info("MATCHER_DEVICE=%s", device)
    else:
        log.info("MATCHER_DEVICE=auto")

    import psycopg

    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT user_id, title, content
                FROM resumes
                WHERE user_id = %s
                ORDER BY updated_at DESC
                LIMIT 1
                """,
                (str(user_id),),
            )
            row = cur.fetchone()
            if not row:
                return {"user_id": str(user_id), "status": "skipped", "reason": "no_resume"}

            _, title, content = row
            text = _resume_text(title, content)
            if len(text) < 8:
                return {"user_id": str(user_id), "status": "skipped", "reason": "resume_text_too_short"}

            resume_hash = _text_hash(text)

            cur.execute(
                """
                SELECT id::text, position_title, company_name, COALESCE(description, ''),
                       COALESCE(location, ''), COALESCE(employment_type, '')
                FROM jobs
                ORDER BY posted_at DESC
                """
            )
            jobs = cur.fetchall()

            tables_ok = _embedding_tables_ready(cur)

    if not jobs:
        return {"user_id": str(user_id), "status": "skipped", "reason": "no_jobs"}

    job_payloads: list[tuple[str, str, str]] = []
    for jid, jt, cn, desc, loc, et in jobs:
        jtext = _job_text(jt, cn, desc, loc, et)
        if jtext:
            job_payloads.append((jid, jtext, _text_hash(jtext)))

    if not job_payloads:
        return {"user_id": str(user_id), "status": "skipped", "reason": "no_job_text"}

    job_ids = [p[0] for p in job_payloads]

    jobs_embedded_new = 0
    jobs_from_store = 0
    jobs_from_mem = 0

    resume_emb: torch.Tensor
    stored_resume: tuple[str, list[float]] | None = None

    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            if tables_ok:
                stored_resume = _load_stored_resume_embedding(cur, model_id, str(user_id))

    if tables_ok and stored_resume and stored_resume[0] == resume_hash:
        dev = device or ("cuda" if torch.cuda.is_available() else "cpu")
        resume_emb = torch.tensor([stored_resume[1]], dtype=torch.float32, device=dev)
        log.info("resume embedding: cache hit (user_resume_embeddings)")
    else:
        t_embed_r0 = time.perf_counter()
        resume_emb = embed_texts(_model, _tokenizer, [text], device=device)
        log.info("resume embed wall_s=%.3f", time.perf_counter() - t_embed_r0)
        if tables_ok:
            rvec = resume_emb.detach().float().cpu().squeeze(0).tolist()
            dim_r = len(rvec)
            with psycopg.connect(db_url) as conn:
                with conn.cursor() as cur:
                    _upsert_resume_embedding(cur, model_id, str(user_id), resume_hash, dim_r, rvec)
                conn.commit()

    # Resolve job embeddings: memory -> DB -> compute
    job_embs_list: list[torch.Tensor] = []
    to_compute: list[tuple[int, str, str, str]] = []  # index in job_payloads, job_id, text, hash

    stored_by_job: dict[str, tuple[str, list[float]]] = {}
    if tables_ok:
        with psycopg.connect(db_url) as conn:
            with conn.cursor() as cur:
                stored_by_job = _load_stored_job_embeddings(cur, model_id, job_ids)

    per_job_tensor: dict[int, torch.Tensor] = {}

    for i, (jid, jtext, jhash) in enumerate(job_payloads):
        with _mem_lock:
            mem = _mem_job_emb.get(jid)
        if mem and mem[0] == jhash:
            jobs_from_mem += 1
            t_cpu = mem[1]
            per_job_tensor[i] = t_cpu.to(resume_emb.device)
            continue
        st = stored_by_job.get(jid)
        if tables_ok and st and st[0] == jhash:
            jobs_from_store += 1
            t = torch.tensor([st[1]], dtype=torch.float32, device=resume_emb.device)
            per_job_tensor[i] = t
            with _mem_lock:
                _mem_job_emb[jid] = (jhash, torch.tensor([st[1]], dtype=torch.float32).cpu())
            continue
        to_compute.append((i, jid, jtext, jhash))

    if to_compute:
        texts_only = [x[2] for x in to_compute]
        t_embed_j0 = time.perf_counter()
        chunks: list[torch.Tensor] = []
        for k in range(0, len(texts_only), batch_size):
            chunk = texts_only[k : k + batch_size]
            chunks.append(embed_texts(_model, _tokenizer, chunk, device=device))
        computed = torch.cat(chunks, dim=0)
        log.info(
            "job embed new=%d wall_s=%.3f batch=%d",
            len(to_compute),
            time.perf_counter() - t_embed_j0,
            batch_size,
        )
        jobs_embedded_new = len(to_compute)
        dim_j = int(computed.shape[1])

        upsert_rows: list[tuple[str, str, list[float]]] = []
        for row_idx, (i, jid, _jt, jh) in enumerate(to_compute):
            row = computed[row_idx : row_idx + 1].detach().float().cpu()
            per_job_tensor[i] = row.to(resume_emb.device)
            with _mem_lock:
                _mem_job_emb[jid] = (jh, row.squeeze(0).unsqueeze(0).clone())
            if tables_ok:
                upsert_rows.append((jid, jh, row.squeeze(0).tolist()))

        if tables_ok and upsert_rows:
            with psycopg.connect(db_url) as conn:
                with conn.cursor() as cur:
                    _upsert_job_embeddings(cur, model_id, dim_j, upsert_rows)
                conn.commit()

    for i in range(len(job_payloads)):
        job_embs_list.append(per_job_tensor[i])

    job_embs = torch.cat(job_embs_list, dim=0)

    sims = (resume_emb @ job_embs.T).squeeze(0)
    scores = torch.sigmoid(sims)

    pairs = [(job_payloads[i][0], float(scores[i].item())) for i in range(len(job_payloads))]
    pairs.sort(key=lambda x: x[1], reverse=True)
    top = pairs[:top_k]

    t_db0 = time.perf_counter()
    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            _write_suggested_jobs(cur, str(user_id), top)
        conn.commit()
    log.info("suggested_jobs write wall_s=%.3f", time.perf_counter() - t_db0)

    total = time.perf_counter() - t0
    log.info(
        "refresh user=%s total_s=%.3f jobs=%d mem_hit=%d store_hit=%d new_emb=%d top_k=%d",
        user_id,
        total,
        len(job_payloads),
        jobs_from_mem,
        jobs_from_store,
        jobs_embedded_new,
        top_k,
    )

    return {
        "user_id": str(user_id),
        "status": "ok",
        "suggestions_written": len(top),
        "jobs_considered": len(job_payloads),
        "jobs_embedded_new": jobs_embedded_new,
        "jobs_embedding_cache_hits": jobs_from_mem + jobs_from_store,
        "model_id": model_id,
        "embedding_tables": tables_ok,
        "wall_time_s": round(total, 3),
    }


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": _model is not None}


@app.post("/v1/warmup")
def warmup(
    x_matcher_secret: Annotated[str | None, Header(alias="X-Matcher-Secret")] = None,
):
    """Optional tiny forward pass so first real refresh is less spiky (model already loads in lifespan)."""
    secret = os.environ.get("MATCHER_INTERNAL_SECRET")
    _check_secret(secret if secret else None, x_matcher_secret)
    if _model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    from resume_job_matcher.embeddings import embed_texts

    device = os.environ.get("MATCHER_DEVICE")
    t0 = time.perf_counter()
    _ = embed_texts(_model, _tokenizer, ["warmup probe one", "warmup probe two"], device=device)
    return {"status": "ok", "wall_time_s": round(time.perf_counter() - t0, 3)}


@app.post("/v1/refresh/{user_id}")
def refresh_one(
    user_id: uuid.UUID,
    x_matcher_secret: Annotated[str | None, Header(alias="X-Matcher-Secret")] = None,
):
    secret = os.environ.get("MATCHER_INTERNAL_SECRET")
    _check_secret(secret if secret else None, x_matcher_secret)

    if _model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    lock = _lock_for_user(user_id)
    with lock:
        try:
            result = refresh_for_user(user_id)
        except Exception as e:
            log.exception("refresh failed")
            raise HTTPException(status_code=500, detail=str(e)) from e
    return result


@app.post("/v1/refresh-all")
def refresh_all(
    x_matcher_secret: Annotated[str | None, Header(alias="X-Matcher-Secret")] = None,
):
    secret = os.environ.get("MATCHER_INTERNAL_SECRET")
    _check_secret(secret if secret else None, x_matcher_secret)

    if _model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    import psycopg

    db_url = os.environ["DATABASE_URL"]
    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT DISTINCT user_id::text FROM resumes
                """
            )
            user_ids = [uuid.UUID(r[0]) for r in cur.fetchall()]

    results = []
    for uid in user_ids:
        lock = _lock_for_user(uid)
        with lock:
            try:
                results.append(refresh_for_user(uid))
            except Exception as e:
                log.warning("refresh_all user %s failed: %s", uid, e)
                results.append({"user_id": str(uid), "status": "error", "detail": str(e)})
    return {"users": len(user_ids), "results": results}


def main():
    import uvicorn

    host = os.environ.get("MATCHER_LISTEN_HOST", "0.0.0.0")
    port = int(os.environ.get("MATCHER_LISTEN_PORT", "8095"))
    uvicorn.run("matcher_service:app", host=host, port=port, reload=False)


if __name__ == "__main__":
    main()
