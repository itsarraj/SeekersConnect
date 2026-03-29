use crate::module::profiles::model::{EmployerProfile, CandidateProfile, CreateEmployerProfileRequest, CreateCandidateProfileRequest};
use crate::module::profiles::repository::ProfilesRepository;
use uuid::Uuid;

pub struct ProfilesService {
    repository: ProfilesRepository,
}

impl ProfilesService {
    pub fn new(repository: ProfilesRepository) -> Self {
        Self { repository }
    }

    pub async fn upsert_employer_profile(&self, user_id: Uuid, data: CreateEmployerProfileRequest) -> Result<EmployerProfile, Box<dyn std::error::Error>> {
        self.repository.upsert_employer_profile(user_id, data).await.map_err(Into::into)
    }

    pub async fn get_employer_profile(&self, user_id: Uuid) -> Result<Option<EmployerProfile>, Box<dyn std::error::Error>> {
        self.repository.find_employer_profile(user_id).await.map_err(Into::into)
    }

    pub async fn upsert_candidate_profile(&self, user_id: Uuid, data: CreateCandidateProfileRequest) -> Result<CandidateProfile, Box<dyn std::error::Error>> {
        self.repository.upsert_candidate_profile(user_id, data).await.map_err(Into::into)
    }

    pub async fn get_candidate_profile(&self, user_id: Uuid) -> Result<Option<CandidateProfile>, Box<dyn std::error::Error>> {
        self.repository.find_candidate_profile(user_id).await.map_err(Into::into)
    }
}
