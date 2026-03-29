use actix_web::{web, HttpRequest, HttpResponse, Responder};
use crate::configuration::Settings;
use crate::middleware::auth;
use crate::module::profiles::model::{CreateEmployerProfileRequest, CreateCandidateProfileRequest};
use crate::module::profiles::service::ProfilesService;
use crate::module::recruiter::service::RecruiterService;
use std::sync::Arc;

pub async fn create_or_update_employer_profile(
    service: web::Data<Arc<ProfilesService>>,
    config: web::Data<Settings>,
    req: HttpRequest,
    data: web::Json<CreateEmployerProfileRequest>,
) -> impl Responder {
    let auth = match auth::extract_auth_user(&req, &config.jwt.secret) {
        Ok(a) => a,
        Err(e) => return e,
    };
    if let Err(e) = auth::require_role(&auth, &["recruiter", "admin"]) {
        return e;
    }
    match service.upsert_employer_profile(auth.user_id, data.into_inner()).await {
        Ok(profile) => HttpResponse::Ok().json(profile),
        Err(e) => {
            log::error!("Failed to upsert employer profile: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

pub async fn get_employer_profile(
    service: web::Data<Arc<ProfilesService>>,
    config: web::Data<Settings>,
    req: HttpRequest,
) -> impl Responder {
    let auth = match auth::extract_auth_user(&req, &config.jwt.secret) {
        Ok(a) => a,
        Err(e) => return e,
    };
    if let Err(e) = auth::require_role(&auth, &["recruiter", "admin"]) {
        return e;
    }
    match service.get_employer_profile(auth.user_id).await {
        Ok(Some(profile)) => HttpResponse::Ok().json(profile),
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(e) => {
            log::error!("Failed to get employer profile: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

pub async fn get_employer_company(
    profiles: web::Data<Arc<ProfilesService>>,
    recruiter: web::Data<Arc<RecruiterService>>,
    config: web::Data<Settings>,
    req: HttpRequest,
) -> impl Responder {
    let auth = match auth::extract_auth_user(&req, &config.jwt.secret) {
        Ok(a) => a,
        Err(e) => return e,
    };
    if let Err(e) = auth::require_role(&auth, &["recruiter", "admin"]) {
        return e;
    }
    let profile = match profiles.get_employer_profile(auth.user_id).await {
        Ok(Some(p)) => p,
        Ok(None) => return HttpResponse::NotFound().finish(),
        Err(e) => {
            log::error!("Failed to get employer profile: {}", e);
            return HttpResponse::InternalServerError().finish();
        }
    };
    let company_id = match profile.company_id {
        Some(id) => id,
        None => return HttpResponse::NotFound().finish(),
    };
    match recruiter.get_company(company_id).await {
        Ok(Some(company)) => HttpResponse::Ok().json(company),
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(e) => {
            log::error!("Failed to get company: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

pub async fn create_or_update_candidate_profile(
    service: web::Data<Arc<ProfilesService>>,
    config: web::Data<Settings>,
    req: HttpRequest,
    data: Option<web::Json<CreateCandidateProfileRequest>>,
) -> impl Responder {
    let auth = match auth::extract_auth_user(&req, &config.jwt.secret) {
        Ok(a) => a,
        Err(e) => return e,
    };
    if let Err(e) = auth::require_role(&auth, &["user", "admin"]) {
        return e;
    }
    let body = data.map(|d| d.into_inner()).unwrap_or_default();
    match service.upsert_candidate_profile(auth.user_id, body).await {
        Ok(profile) => HttpResponse::Ok().json(profile),
        Err(e) => {
            log::error!("Failed to upsert candidate profile: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

pub async fn get_candidate_profile(
    service: web::Data<Arc<ProfilesService>>,
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
    match service.get_candidate_profile(auth.user_id).await {
        Ok(Some(profile)) => HttpResponse::Ok().json(profile),
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(e) => {
            log::error!("Failed to get candidate profile: {}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}
