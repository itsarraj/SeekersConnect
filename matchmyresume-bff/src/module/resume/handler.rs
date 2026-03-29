use actix_web::{web, HttpRequest, HttpResponse, Responder};
use crate::configuration::Settings;
use crate::middleware::auth;
use crate::module::resume::model::JobFilter;
use crate::module::resume::service::JobService;
use std::sync::Arc;
use uuid::Uuid;

pub async fn list_jobs(
    service: web::Data<Arc<JobService>>,
    filter: web::Query<JobFilter>,
) -> impl Responder {
    match service.get_jobs(filter.into_inner()).await {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(e) => {
            log::error!("Failed to list jobs: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

pub async fn get_suggested_jobs(
    service: web::Data<Arc<JobService>>,
    config: web::Data<Settings>,
    req: HttpRequest,
    path: web::Path<Uuid>,
) -> impl Responder {
    let auth = match auth::extract_auth_user(&req, &config.jwt.secret) {
        Ok(a) => a,
        Err(e) => return e,
    };
    if let Err(e) = auth::require_role(&auth, &["user", "admin"]) {
        return e;
    }
    let path_user_id = path.into_inner();
    if auth.user_id != path_user_id {
        return HttpResponse::Forbidden().json(serde_json::json!({
            "error": "Forbidden",
            "message": "Cannot access another user's suggested jobs"
        }));
    }
    match service.get_suggested_jobs(path_user_id).await {
        Ok(jobs) => HttpResponse::Ok().json(jobs),
        Err(e) => {
            log::error!("Failed to get suggested jobs: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

pub async fn get_job(
    service: web::Data<Arc<JobService>>,
    path: web::Path<Uuid>,
) -> impl Responder {
    let id = path.into_inner();
    match service.get_job_by_id(id).await {
        Ok(Some(job)) => HttpResponse::Ok().json(job),
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(e) => {
            log::error!("Failed to get job: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}
