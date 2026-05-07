-- Mock data for local matcher testing.
-- From repo root:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f ai-tests/fixtures/mock_matcher_seed.sql
-- From ai-tests:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f fixtures/mock_matcher_seed.sql
--
-- Test user_id: bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
-- Refresh:
--   curl -s -X POST http://127.0.0.1:8095/v1/refresh/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb

BEGIN;

INSERT INTO jobs (
    id,
    company_name,
    position_title,
    location,
    employment_type,
    description
) VALUES
(
    'a1111111-1111-4111-8111-111111111111'::uuid,
    'SeekersConnect Labs',
    'Backend Engineer — Python & Postgres',
    'Remote',
    'Full-time',
    'Build REST APIs with FastAPI or Django. Strong PostgreSQL, Redis, Docker. CI/CD and code review culture.'
),
(
    'a2222222-2222-4222-8222-222222222222'::uuid,
    'Widget Inc',
    'Platform Engineer — Kubernetes',
    'Austin, TX',
    'Full-time',
    'Kubernetes, Terraform, Go microservices. Observability with Prometheus and Grafana.'
),
(
    'a3333333-3333-4333-8333-333333333333'::uuid,
    'DataCo',
    'Data Analyst',
    'Chicago, IL',
    'Full-time',
    'SQL dashboards, stakeholder reporting, Excel and Looker. Finance domain experience.'
),
(
    'a4444444-4444-4444-8444-444444444444'::uuid,
    'Downtown Bistro',
    'Line Cook',
    'Portland, OR',
    'Part-time',
    'Fast-paced kitchen. Knife skills, prep, weekends required. No remote.'
)
ON CONFLICT (id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    position_title = EXCLUDED.position_title,
    location = EXCLUDED.location,
    employment_type = EXCLUDED.employment_type,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO resumes (
    id,
    user_id,
    title,
    content
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
    'Senior Backend Engineer',
    '{"role": "backend", "skills": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "REST APIs"], "summary": "Shipping reliable APIs and owning schema migrations."}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    updated_at = NOW();

COMMIT;
