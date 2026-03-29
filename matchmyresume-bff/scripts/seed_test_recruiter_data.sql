-- Seed mock company, jobs, and applications for Test Recruiter
-- Test Recruiter: recruiter@test.com (user_id: 4f12f1ee-0610-4d95-a365-efb1a994a4af)

-- Company (matches employer_profile company_name "Test Company")
INSERT INTO companies (id, name, logo_url, website, about, industry, employee_size, head_office, company_type, since, specialization)
VALUES (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'Test Company',
  'https://via.placeholder.com/100',
  'https://testcompany.example.com',
  'Leading tech company building innovative solutions. We hire the best talent.',
  'Technology',
  '51-200',
  'San Francisco, CA',
  'Direct',
  2015,
  ARRAY['Software', 'AI', 'Cloud']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  about = EXCLUDED.about,
  updated_at = CURRENT_TIMESTAMP;

-- Jobs (15 jobs)
INSERT INTO jobs (id, company_id, company_name, company_logo_url, position_title, location, employment_type, salary_min, salary_max, salary_currency, salary_period, description)
VALUES
  ('b1000001-0001-4000-8000-000000000001', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Test Company', 'https://via.placeholder.com/100', 'Senior Software Engineer', 'Remote', 'Full-time', 120000, 180000, 'USD', 'Yearly', 'Build scalable systems. 5+ years experience.'),
  ('b1000001-0001-4000-8000-000000000002', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Test Company', 'https://via.placeholder.com/100', 'Frontend Developer', 'San Francisco, CA', 'Full-time', 100000, 150000, 'USD', 'Yearly', 'React, TypeScript. 3+ years.'),
  ('b1000001-0001-4000-8000-000000000003', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Test Company', 'https://via.placeholder.com/100', 'DevOps Engineer', 'Remote', 'Full-time', 110000, 160000, 'USD', 'Yearly', 'AWS, Kubernetes, CI/CD.'),
  ('b1000001-0001-4000-8000-000000000004', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Test Company', 'https://via.placeholder.com/100', 'Product Manager', 'New York, NY', 'Full-time', 130000, 190000, 'USD', 'Yearly', 'Own product roadmap. B2B SaaS experience.'),
  ('b1000001-0001-4000-8000-000000000005', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Test Company', 'https://via.placeholder.com/100', 'Data Scientist', 'Remote', 'Full-time', 125000, 175000, 'USD', 'Yearly', 'ML models, Python, SQL.'),
  ('b1000001-0001-4000-8000-000000000006', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Test Company', 'https://via.placeholder.com/100', 'UX Designer', 'Austin, TX', 'Full-time', 95000, 140000, 'USD', 'Yearly', 'User research, Figma, design systems.'),
  ('b1000001-0001-4000-8000-000000000007', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Test Company', 'https://via.placeholder.com/100', 'Backend Engineer', 'Seattle, WA', 'Full-time', 115000, 170000, 'USD', 'Yearly', 'Go, PostgreSQL, microservices.'),
  ('b1000001-0001-4000-8000-000000000008', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Test Company', 'https://via.placeholder.com/100', 'Sales Representative', 'Chicago, IL', 'Full-time', 70000, 120000, 'USD', 'Yearly', 'Enterprise sales. OTE includes commission.'),
  ('b1000001-0001-4000-8000-000000000009', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Test Company', 'https://via.placeholder.com/100', 'QA Engineer', 'Remote', 'Full-time', 85000, 130000, 'USD', 'Yearly', 'Automation, Selenium, API testing.'),
  ('b1000001-0001-4000-8000-00000000000a', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Test Company', 'https://via.placeholder.com/100', 'Technical Writer', 'Remote', 'Part-time', 60000, 90000, 'USD', 'Yearly', 'API docs, developer guides.'),
  ('b1000001-0001-4000-8000-00000000000b', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Test Company', 'https://via.placeholder.com/100', 'Security Engineer', 'Remote', 'Full-time', 140000, 200000, 'USD', 'Yearly', 'AppSec, penetration testing, compliance.'),
  ('b1000001-0001-4000-8000-00000000000c', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Test Company', 'https://via.placeholder.com/100', 'Mobile Developer', 'Boston, MA', 'Full-time', 105000, 155000, 'USD', 'Yearly', 'iOS/Android, React Native.'),
  ('b1000001-0001-4000-8000-00000000000d', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Test Company', 'https://via.placeholder.com/100', 'HR Coordinator', 'Denver, CO', 'Full-time', 55000, 75000, 'USD', 'Yearly', 'Recruiting, onboarding, benefits.'),
  ('b1000001-0001-4000-8000-00000000000e', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Test Company', 'https://via.placeholder.com/100', 'Marketing Manager', 'Los Angeles, CA', 'Full-time', 90000, 135000, 'USD', 'Yearly', 'B2B marketing, demand gen, content.'),
  ('b1000001-0001-4000-8000-00000000000f', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Test Company', 'https://via.placeholder.com/100', 'Support Engineer', 'Remote', 'Full-time', 65000, 95000, 'USD', 'Yearly', 'Customer support, troubleshooting.')
ON CONFLICT (id) DO UPDATE SET
  position_title = EXCLUDED.position_title,
  updated_at = CURRENT_TIMESTAMP;

-- Applications: ~105 applications across 15 jobs (7 per job avg)
-- user_id = mock candidate UUIDs (no FK to uas)
INSERT INTO applications (job_id, user_id, status)
SELECT
  j.id,
  gen_random_uuid(),
  (ARRAY['applied', 'applied', 'applied', 'shortlisted', 'rejected', 'hired'])[1 + (random() * 5)::int]
FROM jobs j
CROSS JOIN generate_series(1, 7)
WHERE j.company_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';
