use sqlx::PgPool;

#[derive(Debug, Clone)]
pub struct StatsRow {
    pub live_jobs: i64,
    pub companies: i64,
    pub candidates: i64,
    pub new_jobs: i64,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

pub async fn refresh_stats(pool: &PgPool) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        UPDATE stats SET
            live_jobs = (SELECT COUNT(*) FROM jobs),
            companies = (SELECT COUNT(*) FROM companies),
            candidates = (SELECT COUNT(*) FROM resumes),
            new_jobs = (SELECT COUNT(*) FROM jobs WHERE posted_at > CURRENT_TIMESTAMP - INTERVAL '7 days'),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
        "#,
    )
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn get_stats(pool: &PgPool) -> Result<Option<StatsRow>, sqlx::Error> {
    let row = sqlx::query_as::<_, (i64, i64, i64, i64, chrono::DateTime<chrono::Utc>)>(
        "SELECT live_jobs, companies, candidates, new_jobs, updated_at FROM stats WHERE id = 1",
    )
    .fetch_optional(pool)
    .await?;

    Ok(row.map(|(live_jobs, companies, candidates, new_jobs, updated_at)| StatsRow {
        live_jobs,
        companies,
        candidates,
        new_jobs,
        updated_at,
    }))
}

pub async fn ensure_stats_row(pool: &PgPool) -> Result<(), sqlx::Error> {
    let exists: (bool,) = sqlx::query_as("SELECT EXISTS(SELECT 1 FROM stats WHERE id = 1)")
        .fetch_one(pool)
        .await?;
    if !exists.0 {
        sqlx::query(
            "INSERT INTO stats (id, live_jobs, companies, candidates, new_jobs, updated_at) VALUES (1, 0, 0, 0, 0, CURRENT_TIMESTAMP)",
        )
        .execute(pool)
        .await?;
    }
    Ok(())
}
