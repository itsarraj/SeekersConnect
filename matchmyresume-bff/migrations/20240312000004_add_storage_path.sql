-- Add storage_path for RustFS/S3 object storage (replaces file_data for new uploads)
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS storage_path TEXT;
