use actix_web::{web, HttpRequest, HttpResponse, Responder};
use crate::configuration::Settings;
use crate::middleware::auth;
use crate::module::applications::model::{CreateApplicationRequest, UpdateApplicationRequest};
use crate::module::applications::service::ApplicationService;
use std::sync::Arc;
use uuid::Uuid;

pub async fn list_my_applications(
    service: web::Data<Arc<ApplicationService>>,
    config: web::Data<Settings>,
    req: HttpRequest,
) -> impl Responder {
    let auth = match auth::extract_auth_user(&req, &config.jwt.secret) {
        Ok(a) => a,
        Err(e) => return e,
    };
    if let Err(e) = auth::require_role(&auth, &["user", "admin"]) {
        return e;
    }
    let user_id = auth.user_id;
    match service.get_applications_by_user(user_id).await {
        Ok(apps) => HttpResponse::Ok().json(apps),
        Err(e) => {
            log::error!("Failed to list applications: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

pub async fn list_job_applications(
    service: web::Data<Arc<ApplicationService>>,
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
    let job_id = path.into_inner();
    match service.get_applications_by_job(job_id).await {
        Ok(apps) => HttpResponse::Ok().json(apps),
        Err(e) => {
            log::error!("Failed to list job applications: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "InternalServerError",
                "message": "Failed to load applications"
            }))
        }
    }
}

pub async fn create_application(
    service: web::Data<Arc<ApplicationService>>,
    config: web::Data<Settings>,
    req: HttpRequest,
    data: web::Json<CreateApplicationRequest>,
) -> impl Responder {
    let auth = match auth::extract_auth_user(&req, &config.jwt.secret) {
        Ok(a) => a,
        Err(e) => return e,
    };
    if let Err(e) = auth::require_role(&auth, &["user", "admin"]) {
        return e;
    }
    let user_id = auth.user_id;
    match service.create_application(user_id, data.into_inner()).await {
        Ok(app) => HttpResponse::Created().json(app),
        Err(e) => {
            log::error!("Failed to create application: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

pub async fn update_application(
    service: web::Data<Arc<ApplicationService>>,
    config: web::Data<Settings>,
    req: HttpRequest,
    path: web::Path<Uuid>,
    data: web::Json<UpdateApplicationRequest>,
) -> impl Responder {
    let auth = match auth::extract_auth_user(&req, &config.jwt.secret) {
        Ok(a) => a,
        Err(e) => return e,
    };
    if let Err(e) = auth::require_role(&auth, &["recruiter", "admin"]) {
        return e;
    }
    let id = path.into_inner();
    match service.update_application(id, data.into_inner()).await {
        Ok(Some(app)) => HttpResponse::Ok().json(app),
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(e) => {
            log::error!("Failed to update application: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}
