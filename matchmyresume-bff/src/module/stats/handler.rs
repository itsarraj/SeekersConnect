use actix_web::{web, HttpResponse, Responder};
use crate::DbPool;
use crate::module::stats::repository;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct StatsResponse {
    pub live_jobs: i64,
    pub companies: i64,
    pub candidates: i64,
    pub new_jobs: i64,
    pub updated_at: String,
}

pub async fn get_stats(pool: web::Data<DbPool>) -> impl Responder {
    if let Err(e) = repository::ensure_stats_row(pool.get_ref()).await {
        log::error!("Failed to ensure stats row: {}", e);
        return HttpResponse::InternalServerError().finish();
    }

    match repository::get_stats(pool.get_ref()).await {
        Ok(Some(row)) => HttpResponse::Ok().json(StatsResponse {
            live_jobs: row.live_jobs,
            companies: row.companies,
            candidates: row.candidates,
            new_jobs: row.new_jobs,
            updated_at: row.updated_at.to_rfc3339(),
        }),
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(e) => {
            log::error!("Failed to fetch stats: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}
