use sqlx::PgPool;
use uuid::Uuid;
use crate::module::resume::model::{Job, JobFilter};

#[derive(Clone)]
pub struct JobRepository {
    pool: PgPool,
}

impl JobRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn find_all(&self, filter: JobFilter) -> Result<(Vec<Job>, i64), sqlx::Error> {
        let limit = filter.limit.unwrap_or(10);
        let offset = (filter.page.unwrap_or(1) - 1) * limit;

        // Simplified query for now
        let jobs = sqlx::query_as::<_, Job>(
            "SELECT * FROM jobs ORDER BY posted_at DESC LIMIT $1 OFFSET $2"
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(&self.pool)
        .await?;

        let total_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM jobs")
            .fetch_one(&self.pool)
            .await?;

        Ok((jobs, total_count.0))
    }

    pub async fn find_suggested_for_user(&self, user_id: Uuid) -> Result<Vec<Job>, sqlx::Error> {
        sqlx::query_as::<_, Job>(
            "SELECT j.* FROM jobs j 
             JOIN suggested_jobs sj ON j.id = sj.job_id 
             WHERE sj.user_id = $1 
             ORDER BY sj.match_score DESC"
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await?
        .into_iter()
        .map(Ok)
        .collect()
    }

    pub async fn find_by_id(&self, id: Uuid) -> Result<Option<Job>, sqlx::Error> {
        sqlx::query_as::<_, Job>("SELECT * FROM jobs WHERE id = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }
}
