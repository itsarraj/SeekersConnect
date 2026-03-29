-- Seed some initial jobs
INSERT INTO jobs (company_name, position_title, location, employment_type, salary_min, salary_max, description, posted_at)
VALUES 
('Linear company', 'Software Engineer', 'Brussels', 'Full-time', 50000, 55000, 'Mollit in laborum tempor Lorem incididunt irure. Aute eu ex ad sunt. Pariatur sint culpa do incididunt eiusmod eiusmod culpa. laborum tempor Lorem incididunt.', NOW() - INTERVAL '29 minutes'),
('Notion', 'Junior UI Designer', 'Madrid', 'Full-time', 30000, 32000, 'Mollit in laborum tempor Lorem incididunt irure. Aute eu ex ad sunt. Pariatur sint culpa do incididunt eiusmod eiusmod culpa. laborum tempor Lorem incididunt.', NOW() - INTERVAL '1 day'),
('Spline studio', 'Technical Support Engineer', 'United States', 'Full-time', 50000, 52000, 'Mollit in laborum tempor Lorem incididunt irure. Aute eu ex ad sunt. Pariatur sint culpa do incididunt eiusmod eiusmod culpa. laborum tempor Lorem incididunt.', NOW() - INTERVAL '1 day'),
('Raycast corp', 'Product Designer', 'London', 'Full-time', 40000, 42000, 'Mollit in laborum tempor Lorem incididunt irure. Aute eu ex ad sunt. Pariatur sint culpa do incididunt eiusmod eiusmod culpa. laborum tempor Lorem incididunt.', NOW() - INTERVAL '2 days'),
('Loom', 'Copywriter (Growth)', 'London', 'Full-time', 38000, 40000, 'Mollit in laborum tempor Lorem incididunt irure. Aute eu ex ad sunt. Pariatur sint culpa do incididunt eiusmod eiusmod culpa. laborum tempor Lorem incididunt.', NOW() - INTERVAL '3 days'),
('Trainline group', 'Senior UX/UI Designer', 'Paris', 'Full-time', 50000, 55000, 'Mollit in laborum tempor Lorem incididunt irure. Aute eu ex ad sunt. Pariatur sint culpa do incididunt eiusmod eiusmod culpa. laborum tempor Lorem incididunt.', NOW() - INTERVAL '4 days');
