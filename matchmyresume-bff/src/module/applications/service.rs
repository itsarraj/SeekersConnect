use uuid::Uuid;
use crate::module::applications::model::{Application, CreateApplicationRequest, UpdateApplicationRequest};
use crate::module::applications::repository::ApplicationRepository;
use crate::module::resumes::repository::ResumeRepository;

pub struct ApplicationService {
    repository: ApplicationRepository,
    resume_repository: ResumeRepository,
}

impl ApplicationService {
    pub fn new(repository: ApplicationRepository, resume_repository: ResumeRepository) -> Self {
        Self { repository, resume_repository }
    }

    pub async fn get_applications_by_user(&self, user_id: Uuid) -> Result<Vec<Application>, Box<dyn std::error::Error>> {
        self.repository.find_by_user(user_id).await.map_err(Into::into)
    }

    pub async fn get_applications_by_job(&self, job_id: Uuid) -> Result<Vec<Application>, Box<dyn std::error::Error>> {
        self.repository.find_by_job(job_id).await.map_err(Into::into)
    }

    pub async fn create_application(&self, user_id: Uuid, data: CreateApplicationRequest) -> Result<Application, Box<dyn std::error::Error>> {
        let resume_id = self.resume_repository
            .find_by_user(user_id)
            .await
            .ok()
            .and_then(|v| v.into_iter().next().map(|r| r.id));
        self.repository.create(user_id, resume_id, data).await.map_err(Into::into)
    }

    pub async fn update_application(&self, id: Uuid, data: UpdateApplicationRequest) -> Result<Option<Application>, Box<dyn std::error::Error>> {
        if let Some(status) = data.status {
            self.repository.update_status(id, &status).await.map_err(Into::into)
        } else {
            Ok(None)
        }
    }
}
