-- Employer profiles: extended data for recruiters (BFF-owned, auth has only email/name/password)
CREATE TABLE IF NOT EXISTS employer_profiles (
    user_id UUID PRIMARY KEY,
    company_name TEXT NOT NULL,
    job_title TEXT,
    mobile TEXT,
    company_type TEXT NOT NULL DEFAULT 'direct',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Candidate profiles: extended data for job seekers (BFF-owned)
CREATE TABLE IF NOT EXISTS candidate_profiles (
    user_id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
