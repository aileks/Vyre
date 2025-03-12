import Config

database_url =
  System.get_env("DATABASE_URL") ||
    raise """
    environment variable DATABASE_URL is missing.
    For example: ecto://USER:PASS@HOST/DATABASE
    """

config :api, Api.Accounts.Guardian, secret_key: System.get_env("GUARDIAN_SECRET_KEY")

config :logger, level: :info

config :api, Api.Repo,
  adapter: Ecto.Adapters.Postgres,
  show_sensitive_data_on_connection_error: true,
  parameters: [search_path: System.get_env("DB_SCHEMA")],
  migration_default_prefix: System.get_env("DB_SCHEMA"),
  url: database_url,
  ssl: [
    verify: :verify_peer,
    cacertfile: "/etc/ssl/certs/prod-ca-2021.crt",
    server_name_indication: String.to_charlist(URI.parse(System.get_env("DATABASE_URL")).host)
  ],
  pool_size: 5,
  queue_target: 5000,
  queue_interval: 5000
