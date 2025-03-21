import Config

database_url =
  System.get_env("DATABASE_URL") ||
    raise """
    environment variable DATABASE_URL is missing.
    For example: ecto://USER:PASS@HOST/DATABASE
    """

db_schema = System.get_env("DB_SCHEMA") || raise "environment variable DB_SCHEMA is missing"

config :logger, level: :info

config :api, Api.Repo,
  adapter: Ecto.Adapters.Postgres,
  show_sensitive_data_on_connection_error: true,
  parameters: [search_path: db_schema],
  migration_default_prefix: db_schema,
  url: database_url,
  ssl: [
    verify: :verify_peer,
    cacertfile: "/etc/ssl/certs/prod-ca-2021.crt",
    server_name_indication: String.to_charlist(URI.parse(System.get_env("DATABASE_URL")).host)
  ],
  pool_size: 5,
  queue_target: 5000,
  queue_interval: 5000

config :cors_plug,
  origin: ["https://vyre-2uyou.ondigitalocean.app/"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  headers: ["Authorization", "Content-Type", "Accept", "Origin", "User-Agent"],
  credentials: true,
  max_age: 86400

config :guardian, Guardian.DB, prefix: db_schema
