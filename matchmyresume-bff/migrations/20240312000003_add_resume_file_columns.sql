-- Add file storage columns for resume uploads (PDF, text)
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS file_data BYTEA;
