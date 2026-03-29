use actix_web::{web, HttpRequest, HttpResponse, Responder};
use crate::configuration::Settings;
use crate::middleware::auth;
use crate::module::recruiter::model::{CreateCompanyRequest, CreateJobRequest};
use crate::module::recruiter::service::RecruiterService;
use std::sync::Arc;
use uuid::Uuid;

pub async fn create_company(
    service: web::Data<Arc<RecruiterService>>,
    config: web::Data<Settings>,
    req: HttpRequest,
    data: web::Json<CreateCompanyRequest>,
) -> impl Responder {
    let auth = match auth::extract_auth_user(&req, &config.jwt.secret) {
        Ok(a) => a,
        Err(e) => return e,
    };
    if let Err(e) = auth::require_role(&auth, &["recruiter", "admin"]) {
        return e;
    }
    match service.create_company(data.into_inner()).await {
        Ok(company) => HttpResponse::Ok().json(company),
        Err(e) => {
            log::error!("Failed to create company: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

pub async fn get_company(
    service: web::Data<Arc<RecruiterService>>,
    config: web::Data<Settings>,
    req: HttpRequest,
    path: web::Path<Uuid>,
) -> impl Responder {
    let auth = match auth::extract_auth_user(&req, &config.jwt.secret) {
        Ok(a) => a,
        Err(e) => return e,
    };
    if let Err(e) = auth::require_role(&auth, &["recruiter", "admin"]) {
        return e;
    }
    let id = path.into_inner();
    match service.get_company(id).await {
        Ok(Some(company)) => HttpResponse::Ok().json(company),
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(e) => {
            log::error!("Failed to get company: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

pub async fn create_job(
    service: web::Data<Arc<RecruiterService>>,
    config: web::Data<Settings>,
    req: HttpRequest,
    data: web::Json<CreateJobRequest>,
) -> impl Responder {
    let auth = match auth::extract_auth_user(&req, &config.jwt.secret) {
        Ok(a) => a,
        Err(e) => return e,
    };
    if let Err(e) = auth::require_role(&auth, &["recruiter", "admin"]) {
        return e;
    }
    match service.create_job(data.into_inner()).await {
        Ok(job) => HttpResponse::Ok().json(job),
        Err(e) => {
            log::error!("Failed to create job: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}
