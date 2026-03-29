-- Link employer profiles to companies for persistence across reloads
ALTER TABLE employer_profiles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_employer_profiles_company_id ON employer_profiles(company_id);
