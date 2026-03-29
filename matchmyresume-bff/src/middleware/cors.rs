use actix_cors::Cors;
use actix_web::http::header;

pub fn configure_cors() -> Cors {
    Cors::default()
        .allow_any_origin() // In production, replace with specific origins
        .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
        .allowed_headers(vec![
            header::AUTHORIZATION,
            header::ACCEPT,
            header::CONTENT_TYPE,
            header::HeaderName::from_static("x-user-id"),
        ])
        .max_age(3600)
}
