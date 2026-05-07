-- Persistent float32 embeddings for the resume-job matcher (no pgvector).
-- REAL[] stores one float per dimension; matcher normalizes vectors before insert.

CREATE TABLE IF NOT EXISTS job_embeddings (
    job_id UUID PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,
    model_id TEXT NOT NULL,
    dim INTEGER NOT NULL CHECK (dim > 0),
    embedding REAL[] NOT NULL,
    source_text_hash TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_embeddings_model_id ON job_embeddings(model_id);

CREATE TABLE IF NOT EXISTS user_resume_embeddings (
    user_id UUID PRIMARY KEY,
    model_id TEXT NOT NULL,
    resume_text_hash TEXT NOT NULL,
    dim INTEGER NOT NULL CHECK (dim > 0),
    embedding REAL[] NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_resume_embeddings_model ON user_resume_embeddings(model_id);
