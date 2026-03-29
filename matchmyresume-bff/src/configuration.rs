#[derive(serde::Deserialize, Clone)]
pub struct Settings {
    pub database: DatabaseSettings,
    pub redis: RedisSettings,
    pub auth_service: AuthServiceSettings,
    pub jwt: JwtSettings,
    #[serde(default)]
    pub stats: StatsSettings,
    pub object_storage: ObjectStorageSettings,
    pub application_host: String,
    pub application_port: u16,
}

#[derive(serde::Deserialize, Clone)]
pub struct StatsSettings {
    #[serde(default = "default_stats_refresh_minutes")]
    pub refresh_interval_minutes: u64,
}

impl Default for StatsSettings {
    fn default() -> Self {
        Self {
            refresh_interval_minutes: default_stats_refresh_minutes(),
        }
    }
}

fn default_stats_refresh_minutes() -> u64 {
    30
}

#[derive(serde::Deserialize, Clone)]
pub struct JwtSettings {
    pub secret: String,
}

#[derive(serde::Deserialize, Clone)]
pub struct ObjectStorageSettings {
    pub endpoint: String,
    pub bucket: String,
    pub access_key_id: String,
    pub secret_access_key: String,
    pub region: String,
}

#[derive(serde::Deserialize, Clone)]
pub struct DatabaseSettings {
    pub username: String,
    pub password: String,
    pub port: u16,
    pub host: String,
    pub database_name: String,
}

#[derive(serde::Deserialize, Clone)]
pub struct RedisSettings {
    pub host: String,
    pub port: u16,
    pub password: Option<String>,
    pub database: Option<u8>,
}

#[derive(serde::Deserialize, Clone)]
pub struct AuthServiceSettings {
    pub base_url: String,
    pub api_version: String,
}

pub fn get_configuration() -> Result<Settings, config::ConfigError> {
    let base = config::File::new("configuration.yaml", config::FileFormat::Yaml);
    let settings = config::Config::builder()
        .add_source(base)
        .add_source(
            config::Environment::with_prefix("OBJECT_STORAGE")
                .separator("__")
                .try_parsing(true),
        )
        .add_source(
            config::Environment::with_prefix("JWT")
                .separator("__")
                .try_parsing(true),
        )
        .add_source(
            config::Environment::with_prefix("STATS")
                .separator("__")
                .try_parsing(true),
        )
        .add_source(
            config::Environment::with_prefix("APP")
                .separator("__")
                .try_parsing(true),
        )
        .build()?;
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
