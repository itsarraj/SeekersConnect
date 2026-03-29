use actix_multipart::form::{tempfile::TempFileConfig, MultipartFormConfig};
use actix_web::{App, HttpServer, web};
use dotenvy::dotenv;
use redis::aio::ConnectionManager;

pub mod configuration;
pub mod middleware;
pub mod module;
pub mod routes;
pub mod storage;

pub type DbPool = sqlx::PgPool;
pub type RedisPool = ConnectionManager;

pub async fn run() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let configuration = configuration::get_configuration().expect("Failed to load configuration");
    
    // Database connection
    let database_url = configuration.database.connection_string();
    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(50)
        .connect(&database_url).await?;

    // Redis connection
    let redis_url = configuration.redis.connection_string();
    let redis_client = redis::Client::open(redis_url)?;
    let redis_pool = ConnectionManager::new(redis_client).await?;

    log::info!("Starting BFF server on {}:{}", configuration.application_host, configuration.application_port);

    let server_host = configuration.application_host.clone();
    let server_port = configuration.application_port;

    let job_repo = module::resume::repository::JobRepository::new(pool.clone());
    let job_service = std::sync::Arc::new(module::resume::service::JobService::new(job_repo));

    let recruiter_repo = module::recruiter::repository::RecruiterRepository::new(pool.clone());
    let recruiter_service = std::sync::Arc::new(module::recruiter::service::RecruiterService::new(recruiter_repo));

    let resume_repo = module::resumes::repository::ResumeRepository::new(pool.clone());
    let object_storage = std::sync::Arc::new(storage::RustFsStorage::new(
        &configuration.object_storage.endpoint,
        &configuration.object_storage.bucket,
        &configuration.object_storage.access_key_id,
        &configuration.object_storage.secret_access_key,
        &configuration.object_storage.region,
    ));
    if let Err(e) = object_storage.create_bucket_if_not_exists().await {
        log::warn!("RustFS bucket check failed (is RustFS running?): {}", e);
    }
    let resume_service = std::sync::Arc::new(module::resumes::service::ResumeService::new(
        resume_repo.clone(),
        object_storage,
    ));

    let application_repo = module::applications::repository::ApplicationRepository::new(pool.clone());
    let application_service = std::sync::Arc::new(module::applications::service::ApplicationService::new(
        application_repo,
        resume_repo.clone(),
    ));

    let profiles_repo = module::profiles::repository::ProfilesRepository::new(pool.clone());
    let profiles_service = std::sync::Arc::new(module::profiles::service::ProfilesService::new(profiles_repo));

    // Stats refresh background task
    {
        let pool_stats = pool.clone();
        let interval_mins = configuration.stats.refresh_interval_minutes;
        if let Err(e) = module::stats::repository::ensure_stats_row(&pool).await {
            log::warn!("Stats table init failed: {}", e);
        } else if let Err(e) = module::stats::repository::refresh_stats(&pool).await {
            log::warn!("Initial stats refresh failed: {}", e);
        } else {
            log::info!("Initial stats refresh complete");
        }
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(std::time::Duration::from_secs(interval_mins * 60));
            interval.tick().await;
            loop {
                interval.tick().await;
                if let Err(e) = module::stats::repository::refresh_stats(&pool_stats).await {
                    log::error!("Stats refresh failed: {}", e);
                } else {
                    log::info!("Stats refreshed (every {} min)", interval_mins);
                }
            }
        });
    }

    let temp_dir = std::env::temp_dir();
    HttpServer::new(move || {
        App::new()
            .wrap(middleware::cors::configure_cors())
            .app_data(TempFileConfig::default().directory(temp_dir.clone()))
            .app_data(MultipartFormConfig::default().total_limit(5 * 1024 * 1024))
            .app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::new(redis_pool.clone()))
            .app_data(web::Data::new(configuration.clone()))
            .app_data(web::Data::new(std::sync::Arc::clone(&job_service)))
            .app_data(web::Data::new(std::sync::Arc::clone(&recruiter_service)))
            .app_data(web::Data::new(std::sync::Arc::clone(&resume_service)))
            .app_data(web::Data::new(std::sync::Arc::clone(&application_service)))
            .app_data(web::Data::new(std::sync::Arc::clone(&profiles_service)))
            .configure(routes::config)
    })
    .bind(format!("{}:{}", server_host, server_port))?
    .run()
    .await?;

    Ok(())
}
