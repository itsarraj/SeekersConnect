use actix_web::{HttpRequest, HttpResponse};
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenClaims {
    pub sub: String,
    pub email: String,
    pub role: String,
    pub exp: i64,
    pub iat: i64,
}

#[derive(Debug, Clone)]
pub struct AuthUser {
    pub user_id: Uuid,
    pub role: String,
}

pub fn extract_auth_user(req: &HttpRequest, jwt_secret: &str) -> Result<AuthUser, HttpResponse> {
    let auth_header = req
        .headers()
        .get("Authorization")
        .and_then(|v| v.to_str().ok());

    let token = match auth_header {
        Some(h) if h.starts_with("Bearer ") => &h[7..],
        _ => {
            return Err(HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "Unauthorized",
                "message": "Authorization header with Bearer token required"
            })));
        }
    };

    let decoding_key = DecodingKey::from_secret(jwt_secret.as_ref());
    let mut validation = Validation::new(Algorithm::HS256);
    validation.validate_exp = true;

    let token_data = decode::<TokenClaims>(token, &decoding_key, &validation)
        .map_err(|e| {
            log::debug!("JWT validation failed: {}", e);
            HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "Unauthorized",
                "message": "Invalid or expired token"
            }))
        })?;

    let user_id = Uuid::parse_str(&token_data.claims.sub).map_err(|_| {
        HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "Unauthorized",
            "message": "Invalid token claims"
        }))
    })?;

    Ok(AuthUser {
        user_id,
        role: token_data.claims.role,
    })
}

/// Returns Ok(()) if auth.role is in allowed_roles, else 403 Forbidden.
pub fn require_role(auth: &AuthUser, allowed_roles: &[&str]) -> Result<(), HttpResponse> {
    if allowed_roles.iter().any(|r| *r == auth.role) {
        Ok(())
    } else {
        Err(HttpResponse::Forbidden().json(serde_json::json!({
            "error": "Forbidden",
            "message": "Insufficient permissions for this action"
        })))
    }
}
