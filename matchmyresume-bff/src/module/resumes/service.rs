use std::sync::Arc;
use uuid::Uuid;
use crate::module::resumes::model::{Resume, CreateResumeRequest, UpdateResumeRequest};
use crate::module::resumes::repository::ResumeRepository;
use crate::storage::ObjectStorage;

pub struct ResumeService {
    repository: ResumeRepository,
    storage: Arc<dyn ObjectStorage>,
}

impl ResumeService {
    pub fn new(repository: ResumeRepository, storage: Arc<dyn ObjectStorage>) -> Self {
        Self { repository, storage }
    }

    pub async fn get_resumes(&self, user_id: Uuid) -> Result<Vec<Resume>, Box<dyn std::error::Error>> {
        self.repository.find_by_user(user_id).await.map_err(Into::into)
    }

    pub async fn get_resume(&self, id: Uuid, user_id: Uuid) -> Result<Option<Resume>, Box<dyn std::error::Error>> {
        self.repository.find_by_id(id, user_id).await.map_err(Into::into)
    }

    pub async fn create_resume(&self, user_id: Uuid, data: CreateResumeRequest) -> Result<Resume, Box<dyn std::error::Error>> {
        self.repository.create(user_id, data).await.map_err(Into::into)
    }

    pub async fn create_resume_with_file(
        &self,
        user_id: Uuid,
        title: String,
        file_name: String,
        file_type: String,
        file_size: i32,
        file_data: Vec<u8>,
    ) -> Result<Resume, Box<dyn std::error::Error>> {
        let resume_id = Uuid::new_v4();

        match self
            .storage
            .store(user_id, resume_id, &file_name, &file_data, &file_type)
            .await
        {
            Ok(storage_path) => self
                .repository
                .create_with_file(resume_id, user_id, title, file_name, file_type, file_size, storage_path)
                .await
                .map_err(Into::into),
            Err(e) => {
                log::warn!("RustFS unavailable ({}), falling back to DB storage", e);
                self.repository
                    .create_with_file_db(resume_id, user_id, title, file_name, file_type, file_size, file_data)
                    .await
                    .map_err(Into::into)
            }
        }
    }

    pub async fn update_resume(&self, id: Uuid, user_id: Uuid, data: UpdateResumeRequest) -> Result<Option<Resume>, Box<dyn std::error::Error>> {
        self.repository.update(id, user_id, data).await.map_err(Into::into)
    }

    pub async fn delete_resume(&self, id: Uuid, user_id: Uuid) -> Result<bool, Box<dyn std::error::Error>> {
        if let Ok(Some(resume)) = self.repository.find_by_id(id, user_id).await {
            if let Some(ref path) = resume.storage_path {
                if let Err(e) = self.storage.delete(path).await {
                    log::warn!("Failed to delete from storage {}: {}", path, e);
                }
            }
        }
        self.repository.delete(id, user_id).await.map_err(Into::into)
    }
}
