use sqlx::PgPool;
use uuid::Uuid;
use crate::module::recruiter::model::{Company, CreateCompanyRequest, CreateJobRequest};
use crate::module::resume::model::Job;

#[derive(Clone)]
pub struct RecruiterRepository {
    pool: PgPool,
}

impl RecruiterRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create_company(&self, data: CreateCompanyRequest) -> Result<Company, sqlx::Error> {
        let company = sqlx::query_as::<_, Company>(
            r#"
            INSERT INTO companies (name, logo_url, website, about, industry, employee_size, head_office, company_type, since, specialization)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
            "#
        )
        .bind(data.name)
        .bind(data.logo_url)
        .bind(data.website)
        .bind(data.about)
        .bind(data.industry)
        .bind(data.employee_size)
        .bind(data.head_office)
        .bind(data.company_type)
        .bind(data.since)
        .bind(data.specialization)
        .fetch_one(&self.pool)
        .await?;

        Ok(company)
    }

    pub async fn find_company_by_id(&self, id: Uuid) -> Result<Option<Company>, sqlx::Error> {
        sqlx::query_as::<_, Company>("SELECT * FROM companies WHERE id = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn create_job(&self, data: CreateJobRequest) -> Result<Job, sqlx::Error> {
        // First get company info for the job record (denormalized for now as per existing schema)
        let company = self.find_company_by_id(data.company_id).await?
            .ok_or_else(|| sqlx::Error::RowNotFound)?;

        let job = sqlx::query_as::<_, Job>(
            r#"
            INSERT INTO jobs (company_name, company_logo_url, position_title, location, employment_type, salary_min, salary_max, salary_currency, salary_period, description, posted_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
            RETURNING *
            "#
        )
        .bind(company.name)
        .bind(company.logo_url)
        .bind(data.position_title)
        .bind(data.location)
        .bind(data.employment_type)
        .bind(data.salary_min)
        .bind(data.salary_max)
        .bind(data.salary_currency)
        .bind(data.salary_period)
        .bind(data.description)
        .fetch_one(&self.pool)
        .await?;

        Ok(job)
    }
}
