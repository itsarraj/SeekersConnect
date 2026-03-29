-- Stats cache table, updated periodically by background task
CREATE TABLE IF NOT EXISTS stats (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    live_jobs BIGINT NOT NULL DEFAULT 0,
    companies BIGINT NOT NULL DEFAULT 0,
    candidates BIGINT NOT NULL DEFAULT 0,
    new_jobs BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO stats (id, live_jobs, companies, candidates, new_jobs, updated_at)
SELECT 1, 0, 0, 0, 0, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM stats WHERE id = 1);
