use uuid::Uuid;
use crate::module::resume::model::{Job, JobFilter, JobPageResponse};
use crate::module::resume::repository::JobRepository;

pub struct JobService {
    repository: JobRepository,
}

impl JobService {
    pub fn new(repository: JobRepository) -> Self {
        Self { repository }
    }

    pub async fn get_jobs(&self, filter: JobFilter) -> Result<JobPageResponse, Box<dyn std::error::Error>> {
        let page = filter.page.unwrap_or(1);
        let limit = filter.limit.unwrap_or(10);
        
        let (jobs, total_count) = self.repository.find_all(filter).await?;
        let total_pages = (total_count as f64 / limit as f64).ceil() as i64;

        Ok(JobPageResponse {
            jobs,
            total_count,
            page,
            total_pages,
        })
    }

    pub async fn get_suggested_jobs(&self, user_id: Uuid) -> Result<Vec<Job>, Box<dyn std::error::Error>> {
        let jobs = self.repository.find_suggested_for_user(user_id).await?;
        Ok(jobs)
    }

    pub async fn get_job_by_id(&self, id: Uuid) -> Result<Option<Job>, Box<dyn std::error::Error>> {
        let job = self.repository.find_by_id(id).await?;
        Ok(job)
    }
}
