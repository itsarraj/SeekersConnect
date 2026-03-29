use sqlx::PgPool;
use uuid::Uuid;
use crate::module::applications::model::{Application, CreateApplicationRequest};

#[derive(Clone)]
pub struct ApplicationRepository {
    pool: PgPool,
}

impl ApplicationRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn find_by_user(&self, user_id: Uuid) -> Result<Vec<Application>, sqlx::Error> {
        sqlx::query_as::<_, Application>(
            "SELECT * FROM applications WHERE user_id = $1 ORDER BY applied_at DESC"
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
    }

    pub async fn find_by_job(&self, job_id: Uuid) -> Result<Vec<Application>, sqlx::Error> {
        sqlx::query_as::<_, Application>(
            "SELECT * FROM applications WHERE job_id = $1 ORDER BY applied_at DESC"
        )
        .bind(job_id)
        .fetch_all(&self.pool)
        .await
    }

    pub async fn find_by_id(&self, id: Uuid) -> Result<Option<Application>, sqlx::Error> {
        sqlx::query_as::<_, Application>("SELECT * FROM applications WHERE id = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn create(&self, user_id: Uuid, resume_id: Option<Uuid>, data: CreateApplicationRequest) -> Result<Application, sqlx::Error> {
        sqlx::query_as::<_, Application>(
            r#"
            INSERT INTO applications (job_id, user_id, resume_id, status)
            VALUES ($1, $2, $3, 'applied')
            RETURNING *
            "#
        )
        .bind(data.job_id)
        .bind(user_id)
        .bind(resume_id)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn update_status(&self, id: Uuid, status: &str) -> Result<Option<Application>, sqlx::Error> {
        sqlx::query_as::<_, Application>(
            "UPDATE applications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *"
        )
        .bind(status)
        .bind(id)
        .fetch_optional(&self.pool)
        .await
    }
}
