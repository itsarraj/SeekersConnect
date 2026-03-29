use crate::module::recruiter::model::{Company, CreateCompanyRequest, CreateJobRequest};
use crate::module::recruiter::repository::RecruiterRepository;
use crate::module::resume::model::Job;
use uuid::Uuid;

pub struct RecruiterService {
    repository: RecruiterRepository,
}

impl RecruiterService {
    pub fn new(repository: RecruiterRepository) -> Self {
        Self { repository }
    }

    pub async fn create_company(&self, data: CreateCompanyRequest) -> Result<Company, Box<dyn std::error::Error>> {
        let company = self.repository.create_company(data).await?;
        Ok(company)
    }

    pub async fn get_company(&self, id: Uuid) -> Result<Option<Company>, Box<dyn std::error::Error>> {
        let company = self.repository.find_company_by_id(id).await?;
        Ok(company)
    }

    pub async fn create_job(&self, data: CreateJobRequest) -> Result<Job, Box<dyn std::error::Error>> {
        let job = self.repository.create_job(data).await?;
        Ok(job)
    }
}
