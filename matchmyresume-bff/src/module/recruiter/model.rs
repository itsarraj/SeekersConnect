use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Company {
    pub id: Uuid,
    pub name: String,
    pub logo_url: Option<String>,
    pub website: Option<String>,
    pub about: Option<String>,
    pub industry: Option<String>,
    pub employee_size: Option<String>,
    pub head_office: Option<String>,
    pub company_type: Option<String>,
    pub since: Option<i32>,
    pub specialization: Option<Vec<String>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateCompanyRequest {
    pub name: String,
    pub logo_url: Option<String>,
    pub website: Option<String>,
    pub about: Option<String>,
    pub industry: Option<String>,
    pub employee_size: Option<String>,
    pub head_office: Option<String>,
    pub company_type: Option<String>,
    pub since: Option<i32>,
    pub specialization: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateJobRequest {
    pub company_id: Uuid,
    pub position_title: String,
    pub location: String,
    pub employment_type: String,
    pub salary_min: Option<i32>,
    pub salary_max: Option<i32>,
    pub salary_currency: Option<String>,
    pub salary_period: Option<String>,
    pub description: Option<String>,
    pub requirements: Option<String>,
    pub facilities: Option<String>,
    pub tags: Option<Vec<String>>,
}
