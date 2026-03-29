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
        let mut jobs = self.repository.find_suggested_for_user(user_id).await?;
        
        // If no suggestions found in DB, return some mock matches for demonstration
        if jobs.is_empty() {
            // Fetch some real jobs from the DB to use as mock suggestions
            let (all_jobs, _) = self.repository.find_all(JobFilter {
                page: Some(1),
                limit: Some(6),
                ..Default::default()
            }).await?;
            jobs = all_jobs;
            
            // If the DB is completely empty, we can't even return mock jobs from it
            // But since we have a seed migration, there should be at least 6 jobs.
        }
        
        Ok(jobs)
    }

    pub async fn get_job_by_id(&self, id: Uuid) -> Result<Option<Job>, Box<dyn std::error::Error>> {
        let job = self.repository.find_by_id(id).await?;
        Ok(job)
    }
}
