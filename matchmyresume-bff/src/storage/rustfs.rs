use super::{ObjectStorage, StorageError};
use async_trait::async_trait;
use aws_credential_types::Credentials;
use aws_sdk_s3::config::{Builder, Region};
use aws_sdk_s3::Client;
use aws_sdk_s3::primitives::ByteStream;
use uuid::Uuid;

pub struct RustFsStorage {
    client: Client,
    bucket: String,
}

impl RustFsStorage {
    pub fn new(
        endpoint: &str,
        bucket: &str,
        access_key_id: &str,
        secret_access_key: &str,
        region: &str,
    ) -> Self {
        let creds = Credentials::new(
            access_key_id,
            secret_access_key,
            None,
            None,
            "rustfs",
        );

        let config = Builder::new()
            .endpoint_url(endpoint)
            .region(Region::new(region.to_string()))
            .credentials_provider(creds)
            .force_path_style(true)
            .build();

        let client = Client::from_conf(config);
        Self {
            client,
            bucket: bucket.to_string(),
        }
    }

    pub async fn create_bucket_if_not_exists(&self) -> Result<(), StorageError> {
        match self.client
            .head_bucket()
            .bucket(&self.bucket)
            .send()
            .await
        {
            Ok(_) => Ok(()),
            Err(_) => {
                self.client
                    .create_bucket()
                    .bucket(&self.bucket)
                    .send()
                    .await
                    .map_err(|e| StorageError::S3(e.to_string()))?;
                log::info!("Created RustFS bucket: {}", self.bucket);
                Ok(())
            }
        }
    }

    fn object_key(user_id: Uuid, resume_id: Uuid, file_name: &str) -> String {
        format!("resumes/{}/{}/{}", user_id, resume_id, file_name)
    }
}

#[async_trait]
impl ObjectStorage for RustFsStorage {
    async fn store(
        &self,
        user_id: Uuid,
        resume_id: Uuid,
        file_name: &str,
        data: &[u8],
        content_type: &str,
    ) -> Result<String, StorageError> {
        let key = Self::object_key(user_id, resume_id, file_name);
        let body = ByteStream::from(data.to_vec());

        self.client
            .put_object()
            .bucket(&self.bucket)
            .key(&key)
            .body(body)
            .content_type(content_type)
            .send()
            .await
            .map_err(|e| StorageError::S3(e.to_string()))?;

        Ok(key)
    }

    async fn delete(&self, storage_path: &str) -> Result<(), StorageError> {
        self.client
            .delete_object()
            .bucket(&self.bucket)
            .key(storage_path)
            .send()
            .await
            .map_err(|e| StorageError::S3(e.to_string()))?;
        Ok(())
    }
}
