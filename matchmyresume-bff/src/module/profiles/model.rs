use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct EmployerProfile {
    pub user_id: Uuid,
    pub company_name: String,
    pub company_id: Option<Uuid>,
    pub job_title: Option<String>,
    pub mobile: Option<String>,
    pub company_type: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateEmployerProfileRequest {
    pub company_name: String,
    pub company_id: Option<Uuid>,
    pub job_title: Option<String>,
    pub mobile: Option<String>,
    pub company_type: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct CreateCandidateProfileRequest {
    #[serde(default)]
    pub bio: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct CandidateProfile {
    pub user_id: Uuid,
    pub bio: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
