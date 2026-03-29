use actix_web::web;
use crate::module::resume::handler as resume_handler;
use crate::module::recruiter::handler as recruiter_handler;
use crate::module::resumes::handler as resumes_handler;
use crate::module::applications::handler as applications_handler;
use crate::module::stats::handler as stats_handler;
use crate::module::profiles::handler as profiles_handler;
pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/v1")
            .route("/health", web::get().to(|| async { "OK" }))
            .route("/stats", web::get().to(stats_handler::get_stats))
            .service(
                web::scope("/jobs")
                    .configure(|job_cfg| {
                        job_cfg.route("", web::get().to(resume_handler::list_jobs));
                        job_cfg.route("/{id}", web::get().to(resume_handler::get_job));
                        job_cfg.route("/suggested/{user_id}", web::get().to(resume_handler::get_suggested_jobs));
                    })
            )
            .service(
                web::scope("/resumes")
                    .route("", web::get().to(resumes_handler::list_resumes))
                    .route("", web::post().to(resumes_handler::create_resume))
                    .route("/upload", web::post().to(resumes_handler::create_resume_upload))
                    .route("/{id}", web::get().to(resumes_handler::get_resume))
                    .route("/{id}", web::put().to(resumes_handler::update_resume))
                    .route("/{id}", web::delete().to(resumes_handler::delete_resume))
            )
            .service(
                web::scope("/applications")
                    .route("", web::get().to(applications_handler::list_my_applications))
                    .route("", web::post().to(applications_handler::create_application))
                    .route("/job/{job_id}", web::get().to(applications_handler::list_job_applications))
                    .route("/{id}", web::put().to(applications_handler::update_application))
            )
            .service(
                web::scope("/recruiter")
                    .configure(|rec_cfg| {
                        rec_cfg.route("/companies", web::post().to(recruiter_handler::create_company));
                        rec_cfg.route("/companies/{id}", web::get().to(recruiter_handler::get_company));
                        rec_cfg.route("/jobs", web::post().to(recruiter_handler::create_job));
                    })
            )
            .service(
                web::scope("/employer-profiles")
                    .route("", web::post().to(profiles_handler::create_or_update_employer_profile))
                    .route("/me", web::get().to(profiles_handler::get_employer_profile))
                    .route("/me/company", web::get().to(profiles_handler::get_employer_company))
            )
            .service(
                web::scope("/candidate-profiles")
                    .route("", web::post().to(profiles_handler::create_or_update_candidate_profile))
                    .route("/me", web::get().to(profiles_handler::get_candidate_profile))
            )
    );
}
