mod rustfs;

pub use rustfs::RustFsStorage;

use async_trait::async_trait;
use uuid::Uuid;

#[async_trait]
pub trait ObjectStorage: Send + Sync {
    /// Store file bytes, returns the storage path (object key)
    async fn store(
        &self,
        user_id: Uuid,
        resume_id: Uuid,
        file_name: &str,
        data: &[u8],
        content_type: &str,
    ) -> Result<String, StorageError>;

    /// Delete object by storage path
    async fn delete(&self, storage_path: &str) -> Result<(), StorageError>;
}

#[derive(Debug, thiserror::Error)]
pub enum StorageError {
    #[error("S3 error: {0}")]
    S3(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}
