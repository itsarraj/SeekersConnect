use uuid::Uuid;

use crate::configuration::MatcherSettings;

pub fn spawn_refresh_suggestions(matcher: &MatcherSettings, user_id: Uuid) {
    let Some(ref base_raw) = matcher.base_url else {
        return;
    };
    let base = base_raw.trim().trim_end_matches('/');
    if base.is_empty() {
        return;
    }

    let url = format!("{}/v1/refresh/{}", base, user_id);
    let secret = matcher.internal_secret.clone();

    tokio::spawn(async move {
        let client = match reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(300))
            .build()
        {
            Ok(c) => c,
            Err(e) => {
                log::warn!("matcher HTTP client build failed: {}", e);
                return;
            }
        };

        let mut req = client.post(&url);
        if let Some(ref s) = secret {
            if !s.is_empty() {
                req = req.header("X-Matcher-Secret", s);
            }
        }

        match req.send().await {
            Ok(resp) if resp.status().is_success() => {
                log::info!("matcher refresh OK for user {}", user_id);
            }
            Ok(resp) => {
                log::warn!(
                    "matcher refresh HTTP {} for user {}",
                    resp.status(),
                    user_id
                );
            }
            Err(e) => log::warn!("matcher refresh failed for user {}: {}", user_id, e),
        }
    });
}
