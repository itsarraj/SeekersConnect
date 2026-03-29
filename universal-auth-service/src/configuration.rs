#[derive(serde::Deserialize)]
pub struct Settings {
    pub database: DatabaseSettings,
    pub redis: RedisSettings,
    pub jwt: JwtSettings,
    pub email: EmailSettings,
    pub application_host: String,
    pub application_port: u16
}

#[derive(serde::Deserialize)]
pub struct DatabaseSettings {
    pub username: String,
    pub password: String,
    pub port: u16,
    pub host: String,
    pub database_name: String,
}

#[derive(serde::Deserialize)]
pub struct RedisSettings {
    pub host: String,
    pub port: u16,
    pub password: Option<String>,
    pub database: Option<u8>,
}

#[derive(serde::Deserialize, Clone)]
pub struct JwtSettings {
    pub secret: String,
    pub access_token_expiration_hours: i64,
    pub refresh_token_expiration_days: i64,
}

#[derive(serde::Deserialize, Clone)]
pub struct EmailSettings {
    pub api_key: String,
    pub from_email: String,
    pub from_name: String,
    pub base_url: String,
    /// Frontend URL for password reset links (e.g. http://localhost:5173).
    /// Override via env: APP_EMAIL__FRONTEND_BASE_URL
    #[serde(default)]
    pub frontend_base_url: Option<String>,
}

pub fn get_configuration() -> Result<Settings, config::ConfigError> {
    let settings = config::Config::builder()
        .add_source(config::File::new("configuration.yaml", config::FileFormat::Yaml))
        .add_source(config::Environment::default().prefix("APP").separator("__"))
        .build()?;
    // Try to convert the configuration values it read into
    // our Settings type
    settings.try_deserialize::<Settings>()
}

impl DatabaseSettings {
    pub fn connection_string(&self) -> String {
        format!(
            "postgres://{}:{}@{}:{}/{}",
            self.username, self.password, self.host, self.port, self.database_name
        )
    }
}

impl RedisSettings {
    pub fn connection_string(&self) -> String {
        let mut conn_str = format!("redis://{}:{}", self.host, self.port);

        if let Some(password) = &self.password {
            conn_str = format!("redis://:{}@{}:{}", password, self.host, self.port);
        }

        if let Some(database) = self.database {
            conn_str = format!("{}/{}", conn_str, database);
        }

        conn_str
    }
}
