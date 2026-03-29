-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    company_logo_url TEXT,
    position_title TEXT NOT NULL,
    location TEXT NOT NULL,
    employment_type TEXT NOT NULL, -- 'Full-time', 'Part-time', 'Contract', etc.
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency TEXT DEFAULT 'USD',
    salary_period TEXT DEFAULT 'Yearly', -- 'Hourly', 'Monthly', 'Yearly'
    description TEXT,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create suggested_jobs table to store AI matches for users
CREATE TABLE IF NOT EXISTS suggested_jobs (
    user_id UUID NOT NULL,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    match_score FLOAT, -- AI matching score
    suggested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, job_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_suggested_jobs_user_id ON suggested_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs(posted_at DESC);
