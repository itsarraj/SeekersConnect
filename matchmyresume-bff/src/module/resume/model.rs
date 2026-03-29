use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Job {
    pub id: Uuid,
    pub company_name: String,
    pub company_logo_url: Option<String>,
    pub position_title: String,
    pub location: String,
    pub employment_type: String,
    pub salary_min: Option<i32>,
    pub salary_max: Option<i32>,
    pub salary_currency: Option<String>,
    pub salary_period: Option<String>,
    pub description: Option<String>,
    pub posted_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SuggestedJob {
    pub user_id: Uuid,
    pub job_id: Uuid,
    pub match_score: Option<f64>,
    pub suggested_at: DateTime<Utc>,
    pub job: Option<Job>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct JobFilter {
    pub location: Option<String>,
    pub employment_type: Option<String>,
    pub salary_min: Option<i32>,
    pub salary_period: Option<String>,
    pub posted_within_days: Option<i64>,
    pub page: Option<i64>,
    pub limit: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JobPageResponse {
    pub jobs: Vec<Job>,
    pub total_count: i64,
    pub page: i64,
    pub total_pages: i64,
}
