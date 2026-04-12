use super::{ObjectStorage, StorageError};
use async_trait::async_trait;
use bytes::Bytes;
use object_store::aws::AmazonS3Builder;
use object_store::path::Path;
use object_store::{
    Attribute, Attributes, ObjectStore, ObjectStoreExt, PutMode, PutOptions, PutPayload,
};
use std::sync::Arc;
use uuid::Uuid;

pub struct RustFsStorage {
    store: Arc<dyn ObjectStore>,
}

impl RustFsStorage {
    pub fn new(
        endpoint: &str,
        bucket: &str,
        access_key_id: &str,
        secret_access_key: &str,
        region: &str,
    ) -> Self {
        let mut b = AmazonS3Builder::new()
            .with_bucket_name(bucket)
            .with_region(region)
            .with_endpoint(endpoint)
            .with_access_key_id(access_key_id)
            .with_secret_access_key(secret_access_key)
            .with_virtual_hosted_style_request(false);
        if endpoint.starts_with("http://") {
            b = b.with_allow_http(true);
        }
        let store = b.build().expect("RustFS / S3 object store configuration");
        Self {
            store: Arc::new(store),
        }
    }

    pub async fn create_bucket_if_not_exists(&self) -> Result<(), StorageError> {
        let probe = Path::from("__seekersconnect_bucket_init__");
        let _ = self.store.delete(&probe).await;
        match self
            .store
            .put(&probe, PutPayload::from_bytes(Bytes::new()))
            .await
        {
            Ok(_) => {
                let _ = self.store.delete(&probe).await;
                Ok(())
            }
            Err(e) => Err(StorageError::S3(format!("{e:?}"))),
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
        let path = Path::from(key.as_str());
        let mut attrs = Attributes::new();
        attrs.insert(Attribute::ContentType, content_type.to_string().into());
        let opts = PutOptions {
            mode: PutMode::Overwrite,
            attributes: attrs,
            ..Default::default()
        };
        self.store
            .put_opts(
                &path,
                PutPayload::from_bytes(Bytes::copy_from_slice(data)),
                opts,
            )
            .await
            .map_err(|e| StorageError::S3(format!("{e:?}")))?;
        Ok(key)
    }

    async fn delete(&self, storage_path: &str) -> Result<(), StorageError> {
        let path = Path::from(storage_path);
        self.store
            .delete(&path)
            .await
            .map_err(|e| StorageError::S3(format!("{e:?}")))
    }
}
